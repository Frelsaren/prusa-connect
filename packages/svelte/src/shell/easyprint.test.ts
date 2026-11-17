import { describe, expect, it } from 'vitest';

import { EASYPRINT_ORIGIN } from './easyprint';

describe('the EasyPrint addresses', () => {
  // The server compares an origin byte for byte, so a trailing slash or a
  // path would allow nothing.
  it('names an origin a browser would send', () => {
    expect(new URL(EASYPRINT_ORIGIN).origin).toBe(EASYPRINT_ORIGIN);
  });
});
