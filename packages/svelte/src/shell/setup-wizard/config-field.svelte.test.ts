// A list key that offers a known value draws a switch for it, and the switch
// writes the same text a person would type.
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import type { SetupKey } from '../../data';
import { EASYPRINT_ORIGIN } from '../easyprint';
import ConfigField from './config-field.svelte';
import type { Answer } from './model';
import { addWizardTexts } from './texts';

addWizardTexts();

const list = (path: string, extra: Partial<SetupKey> = {}): SetupKey => ({
  path,
  group: 'api',
  level: 'advanced',
  kind: 'text_list',
  default: null,
  choices: [],
  doc: '',
  secret: false,
  locked: false,
  reference: `config/#key-${path}`,
  ...extra,
});

const props = (key: SetupKey, shown: Answer, onanswer = vi.fn()) => ({
  key,
  shown,
  answered: shown !== '',
  file: '/srv/config/config.yaml',
  docsHref: undefined,
  showError: false,
  onanswer,
  onforget: vi.fn(),
});

const origins = list('core.api.allowed_origins');

describe('ConfigField', () => {
  it('adds the EasyPrint origin under the lines already typed', async () => {
    const onanswer = vi.fn();
    await render(ConfigField, {
      props: props(origins, 'http://localhost:5173', onanswer),
    });

    const allow = page.getByRole('switch', { name: 'Allow EasyPrint' });
    await expect.element(allow).not.toBeChecked();
    await allow.click();

    expect(onanswer).toHaveBeenCalledWith(
      `http://localhost:5173\n${EASYPRINT_ORIGIN}`,
    );
  });

  it('shows the switch on for a list that holds the origin, and takes it out', async () => {
    const onanswer = vi.fn();
    await render(ConfigField, {
      props: props(
        origins,
        `${EASYPRINT_ORIGIN}\nhttp://localhost:5173`,
        onanswer,
      ),
    });

    const allow = page.getByRole('switch', { name: 'Allow EasyPrint' });
    await expect.element(allow).toBeChecked();
    await allow.click();

    expect(onanswer).toHaveBeenCalledWith('http://localhost:5173');
  });

  it('offers nothing for another list', async () => {
    await render(ConfigField, {
      props: props(list('core.trusted_proxies'), ''),
    });

    await expect.element(page.getByRole('textbox')).toBeVisible();
    await expect
      .element(page.getByRole('switch', { name: 'Allow EasyPrint' }))
      .not.toBeInTheDocument();
  });

  // The operator's file wins for a locked key, so a switch could change nothing.
  it('offers nothing for a list the configuration file sets', async () => {
    await render(ConfigField, {
      props: props(
        list('core.api.allowed_origins', {
          locked: true,
          value: ['http://localhost:5173'],
        }),
        'http://localhost:5173',
      ),
    });

    await expect.element(page.getByRole('textbox')).toBeVisible();
    await expect
      .element(page.getByRole('switch', { name: 'Allow EasyPrint' }))
      .not.toBeInTheDocument();
  });
});
