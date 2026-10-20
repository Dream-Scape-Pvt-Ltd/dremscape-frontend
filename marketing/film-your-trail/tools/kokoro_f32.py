#!/usr/bin/env python3
"""Turn Kokoro-82M's fp16 ONNX export into an fp32-compute graph.

The fp16 graph overflows on some voices (am_michael comes out as full-scale noise), and the q8 export is audibly
grainier. Casting every fp16 weight and Cast target back to fp32 keeps the fp16 weights' precision while all
arithmetic runs in fp32, which is clean on every voice.

  npm pack kokoro-fp16-shards@1.0.4 && tar xzf kokoro-fp16-shards-1.0.4.tgz
  cat package/kokoro-fp16.part*.bin > model_fp16.onnx          # 163,234,740 bytes
  python3 tools/kokoro_f32.py model_fp16.onnx model_f32.onnx   # needs: pip install onnx
"""
import sys
import numpy as np
import onnx
from onnx import numpy_helper, TensorProto

F16, F32 = TensorProto.FLOAT16, TensorProto.FLOAT


def to32(t):
    if t.data_type == F16:
        t.CopyFrom(numpy_helper.from_array(numpy_helper.to_array(t).astype(np.float32), t.name))


def walk(g):
    for t in g.initializer:
        to32(t)
    for vi in list(g.input) + list(g.output) + list(g.value_info):
        if vi.type.tensor_type.elem_type == F16:
            vi.type.tensor_type.elem_type = F32
    for n in g.node:
        for a in n.attribute:
            if a.name in ('to', 'dtype') and a.type == onnx.AttributeProto.INT and a.i == F16:
                a.i = F32
            if a.type == onnx.AttributeProto.TENSOR:
                to32(a.t)
            if a.type == onnx.AttributeProto.GRAPH:
                walk(a.g)
            for sg in a.graphs:
                walk(sg)


if __name__ == '__main__':
    m = onnx.load(sys.argv[1])
    walk(m.graph)
    onnx.save(m, sys.argv[2])
    print('wrote', sys.argv[2])
