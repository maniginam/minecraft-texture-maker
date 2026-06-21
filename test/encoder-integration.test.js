import { describe, it, expect } from 'vitest';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';

// The asm.js encoder needs BOTH its script and its .mem memory initializer to be
// vendored, or it aborts at runtime ("Cannot enlarge memory arrays"). The actual
// encode is proven in a real browser (headless Chrome produced a valid OGG); node
// cannot faithfully run the async .mem init, so here we guard that both vendored
// files are present and non-trivial.
describe('vendored OGG Vorbis encoder assets', () => {
  for (const file of ['OggVorbisEncoder.min.js', 'OggVorbisEncoder.min.js.mem']) {
    it(`${file} is vendored and non-trivial`, () => {
      const size = statSync(resolve(process.cwd(), 'js/vendor/', file)).size;
      expect(size).toBeGreaterThan(10000);
    });
  }
});
