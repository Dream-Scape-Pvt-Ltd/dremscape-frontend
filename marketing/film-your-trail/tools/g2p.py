"""Kokoro's own dictionary pronunciation (misaki, US gold/silver lexicon) with hand-checked part-of-speech tags,
so stress and function-word reduction follow the sentence instead of a rule-based guess.
spaCy is used only for its tokenizer (no model download)."""
import spacy
from misaki import en

TAGS = {  # Penn tags for every word in the script
    'some': 'DT', 'trails': 'NNS', 'you': 'PRP', 'walk': 'VBP', 'stay': 'VBP', 'with': 'IN',
    'since': 'IN', '2005': 'CD', 'our': 'PRP$', 'team': 'NN', 'in': 'IN', 'kathmandu': 'NNP', 'has': 'VBZ', 'planned': 'VBN',
    'journeys': 'NNS', 'through': 'IN', 'the': 'DT', 'himalaya': 'NNP', 'tell': 'VB', 'us': 'PRP', 'where': 'WRB', 'want': 'VBP',
    'to': 'TO', 'go': 'VB', 'and': 'CC', 'how': 'WRB', 'hard': 'RB', 'climb': 'VB', 'we': 'PRP', "'ll": 'MD', 'shape': 'VB',
    'route': 'NN', 'around': 'IN', 'share': 'VB', 'your': 'PRP$', 'idea': 'NN', 'talk': 'VB', 'it': 'PRP', 'get': 'VB', 'a': 'DT',
    'plan': 'NN', 'that': 'WDT', "'s": 'VBZ', 'yours': 'PRP', 'dreamscape': 'NNP', 'treks': 'NNP', 'beyond': 'RB',
}
PUNCT = {',': ',', '.': '.', '!': '.', '?': '.'}

class G2P(en.G2P):
    def __init__(self):                                   # skip the spaCy model download in the parent class
        self.british = False; self.nlp = spacy.blank('en'); self.lexicon = en.Lexicon(False); self.fallback = None; self.unk = '❓'
    def tokenize(self, text, tokens, features):
        out = []
        for t in self.nlp(text):
            tag = PUNCT.get(t.text) or TAGS.get(t.text.lower())
            if tag is None: raise KeyError('no tag for ' + t.text)
            out.append(en.MToken(text=t.text, tag=tag, whitespace=t.whitespace_))
        return out

_g = None
def phonemize(text):
    global _g
    _g = _g or G2P()
    ps, toks = _g(text)
    bad = [t.text for t in toks if t.phonemes is None or '❓' in (t.phonemes or '')]
    if bad: raise ValueError('unknown words: %s' % bad)
    return ps

if __name__ == '__main__':
    import sys
    for line in sys.argv[1:]: print(line, '->', phonemize(line))
