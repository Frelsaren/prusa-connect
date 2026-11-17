import { describe, expect, it } from 'vitest';

import { EASYPRINT_ORIGIN } from '../easyprint';
import { holds, suggestionsOf, withoutValue, withValue } from './suggestions';

describe('what a list key offers', () => {
  it('offers the EasyPrint origin for the allowed origins alone', () => {
    expect(
      suggestionsOf('core.api.allowed_origins').map((offer) => offer.value),
    ).toEqual([EASYPRINT_ORIGIN]);
    expect(suggestionsOf('core.trusted_proxies')).toEqual([]);
  });

  it('adds the value as a line of its own', () => {
    expect(withValue('', EASYPRINT_ORIGIN)).toBe(EASYPRINT_ORIGIN);
    expect(withValue('http://localhost:5173\n', EASYPRINT_ORIGIN)).toBe(
      `http://localhost:5173\n${EASYPRINT_ORIGIN}`,
    );
  });

  it('leaves a list that holds the value as it was typed', () => {
    const typed = `  ${EASYPRINT_ORIGIN}  \nhttp://localhost:5173`;

    expect(holds(typed, EASYPRINT_ORIGIN)).toBe(true);
    expect(withValue(typed, EASYPRINT_ORIGIN)).toBe(typed);
  });

  it('takes the value out and keeps the other lines', () => {
    expect(
      withoutValue(
        `http://localhost:5173\n${EASYPRINT_ORIGIN}\n${EASYPRINT_ORIGIN}`,
        EASYPRINT_ORIGIN,
      ),
    ).toBe('http://localhost:5173');
    expect(withoutValue(EASYPRINT_ORIGIN, EASYPRINT_ORIGIN)).toBe('');
  });

  // The server matches an origin exactly, so a longer address that starts
  // with the value is another origin.
  it('does not take a longer line for the value', () => {
    expect(holds(`${EASYPRINT_ORIGIN}:8443`, EASYPRINT_ORIGIN)).toBe(false);
  });
});
