import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {apiError, assertSameOrigin, backend, BackendError, noStore} from '@/lib/backend';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) throw new BackendError('Please select image files to upload.', 415);
    const input = await request.formData();
    const files = input.getAll('files').filter((value): value is File => value instanceof File);
    if (!files.length) throw new BackendError('Select at least one image.', 400);
    if (files.length > 12) throw new BackendError('Upload no more than 12 images at once.', 400);
    const outgoing = new FormData();
    for (const file of files) {
      if (!allowedTypes.has(file.type)) throw new BackendError('Upload JPG, PNG, or WebP images only.', 400);
      if (file.size > maxFileSize) throw new BackendError('Each image must be 10 MB or smaller.', 400);
      outgoing.append('files', file, file.name);
    }
    const {headers} = await staffAccess();
    const data = await backend<{files:Array<{id:string;url:string;name:string;size:number}>}>('content/guides/media/upload/', {method:'POST', headers, body:outgoing});
    return NextResponse.json({data}, {status:201, headers:noStore});
  } catch (error) {
    return apiError(error);
  }
}
