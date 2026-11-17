// The values the wizard offers for a list as a switch each, so a person does
// not have to type an address exactly.
import { EASYPRINT_ORIGIN } from '../easyprint';
import type { Answer } from './model';

/** One value a list key offers, with the catalogue keys of its texts. */
export interface Suggestion {
  /** The line the switch adds to the list and takes out of it. */
  value: string;
  /** The name of the switch. */
  label: string;
  /** What the value permits. */
  note: string;
}

const SUGGESTIONS: Readonly<Record<string, readonly Suggestion[]>> = {
  'core.api.allowed_origins': [
    {
      value: EASYPRINT_ORIGIN,
      label: 'setupWizard.suggest.easyPrint',
      note: 'setupWizard.suggest.easyPrint.note',
    },
  ],
};

/** What a key offers. Most keys offer nothing. */
export const suggestionsOf = (path: string): readonly Suggestion[] =>
  SUGGESTIONS[path] ?? [];

const linesOf = (answer: Answer): string[] =>
  typeof answer === 'string'
    ? answer
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
    : [];

/** Whether a list already holds a value, as one of its lines. */
export const holds = (answer: Answer, value: string): boolean =>
  linesOf(answer).includes(value);

/** The list with the value as its last line. A list that holds it is unchanged. */
export const withValue = (answer: Answer, value: string): string =>
  holds(answer, value)
    ? String(answer)
    : [...linesOf(answer), value].join('\n');

/** The list with every line that is the value taken out. */
export const withoutValue = (answer: Answer, value: string): string =>
  linesOf(answer)
    .filter((line) => line !== value)
    .join('\n');
