import { describe, expect, it } from 'vitest';

import { EASYPRINT_ORIGIN, easyPrintPairHref } from './easyprint';

describe('the EasyPrint addresses', () => {
  // The server compares an origin byte for byte, so a trailing slash or a
  // path would allow nothing.
  it('names an origin a browser would send', () => {
    expect(new URL(EASYPRINT_ORIGIN).origin).toBe(EASYPRINT_ORIGIN);
  });

  it('carries the server address as one encoded parameter', () => {
    const href = easyPrintPairHref('https://connect.lan:8443');

    expect(href).toBe(
      'https://www.printables.com/slice?pair_connect_local=https%3A%2F%2Fconnect.lan%3A8443',
    );
    expect(new URL(href).searchParams.get('pair_connect_local')).toBe(
      'https://connect.lan:8443',
    );
  });
});
