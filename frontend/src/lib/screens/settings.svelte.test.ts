// The Settings rooms this product composes.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { appContext } from '../../test/app-context';
import { empty, json, type Routes } from '../../test/stub';
import Account from './account.svelte';
import ApiCredentials from './credentials.svelte';
import People from './people.svelte';

const SIGNED_IN: Routes = {
  'GET /api/v1/principal': json(200, { principal: 'user:demo' }),
  'GET /api/v1/grants/subject/user:demo': json(200, {
    devices: [],
    subject: 'user:demo',
  }),
};

const credential = {
  created_at: '2026-09-01T08:00:00Z',
  expires_at: '2027-09-01T08:00:00Z',
  id: 'pk-1',
  name: 'laptop',
  subject: 'user:demo',
};

/** The JSON the stub recorded, read back as the pair of fields it carries. */
// The cast names what the route's body is; `JSON.parse` answers `any`.
const bodyOf = (body: string | undefined): Record<string, string> =>
  JSON.parse(body ?? '{}') as Record<string, string>;

const account = {
  created_at: '2026-08-01T08:00:00Z',
  display_name: 'Demo',
  grants: [],
  id: 'demo',
  role: 'admin',
  subject: 'user:demo',
  username: 'demo',
};

describe('the account room', () => {
  it('names who this browser is signed in as', async () => {
    const ctx = appContext(SIGNED_IN);
    await ctx.session.read();

    await render(Account, { props: { ctx } });

    await expect.element(page.getByText('user:demo')).toBeInTheDocument();
  });

  // The core takes the current password for an account changing its own.
  it('sends the current password with the new one', async () => {
    const sent: (string | undefined)[] = [];
    const ctx = appContext({
      ...SIGNED_IN,
      'POST /api/v1/auth/accounts/demo/password': (call) => {
        sent.push(call.body);

        return empty(204);
      },
    });
    await ctx.session.read();

    await render(Account, { props: { ctx } });

    await page.getByLabelText('Current password').fill('old-secret-one');
    await page.getByLabelText('New password').fill('new-secret-one');
    await page.getByLabelText('Confirm new password').fill('new-secret-one');
    await page.getByRole('button', { name: 'Change password' }).click();

    await expect
      .poll(() => sent.map(bodyOf))
      .toEqual([
        { current_password: 'old-secret-one', new_password: 'new-secret-one' },
      ]);
  });
});

describe('the API credentials room', () => {
  it('lists what the signed-in person holds', async () => {
    const ctx = appContext({
      'GET /api/v1/auth/credentials': json(200, { items: [credential] }),
    });

    await render(ApiCredentials, { props: { ctx } });

    await expect.element(page.getByText('laptop').first()).toBeInTheDocument();
  });

  // EasyPrint calls the server from the person's browser, so the address it
  // is given is the one this page was opened on.
  it('links to EasyPrint with the address this page was opened on', async () => {
    const ctx = appContext({
      'GET /api/v1/auth/credentials': json(200, { items: [credential] }),
    });

    await render(ApiCredentials, { props: { ctx } });

    const link = page.getByRole('link', {
      name: 'Add this server to EasyPrint',
    });
    await expect.element(link).toBeInTheDocument();
    const href = new URL(link.element().getAttribute('href') ?? '');
    expect(`${href.origin}${href.pathname}`).toBe(
      'https://www.printables.com/slice',
    );
    expect(href.searchParams.get('pair_connect_local')).toBe(
      window.location.origin,
    );
  });

  it('revokes one by the id the listing names', async () => {
    const gone: string[] = [];
    const ctx = appContext({
      'GET /api/v1/auth/credentials': json(200, { items: [credential] }),
      'DELETE /api/v1/auth/credentials/pk-1': (call) => {
        gone.push(call.path);

        return empty(204);
      },
    });

    await render(ApiCredentials, { props: { ctx } });
    await expect.element(page.getByText('laptop').first()).toBeInTheDocument();
    // The row's menu, then the item in it, then the dialog that confirms it.
    await page
      .getByRole('button', { name: 'Actions for laptop' })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Revoke' }).click();
    await page.getByRole('button', { name: 'Revoke' }).click();

    await expect.poll(() => gone).toEqual(['/api/v1/auth/credentials/pk-1']);
  });
});

describe('the people room', () => {
  it('lists the accounts and marks the signed-in one', async () => {
    const ctx = appContext({
      ...SIGNED_IN,
      'GET /api/v1/auth/accounts': json(200, { items: [account] }),
    });
    await ctx.session.read();

    await render(People, { props: { ctx } });

    await expect.element(page.getByText('demo').first()).toBeInTheDocument();
  });

  // A role on this server is granted over the whole organisation.
  it('says a role reaches every printer', async () => {
    const ctx = appContext({
      ...SIGNED_IN,
      'GET /api/v1/auth/accounts': json(200, { items: [account] }),
    });
    await ctx.session.read();

    await render(People, { props: { ctx } });
    await page.getByRole('button', { name: 'Add person' }).click();

    await expect
      .element(
        page.getByText(
          'A role is held over the whole server. Whoever holds one reaches every printer on it.',
        ),
      )
      .toBeVisible();
  });
});

// The room is behind FEATURES.diagnostics, so the test renders the screen
// itself and stubs the settings, the download and the save.
describe('the diagnostics room', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock('../download');
  });

  it('posts the browser buffer and saves what the server answers', async () => {
    const saved: string[] = [];
    vi.resetModules();
    vi.doMock('../download', () => ({
      saveBlob: (_blob: Blob, name: string) => saved.push(name),
    }));
    const sent: { url: string; body: string }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: Request | string, init?: RequestInit) => {
        sent.push(
          typeof input === 'string'
            ? {
                url: input,
                body: typeof init?.body === 'string' ? init.body : '',
              }
            : { url: input.url, body: await input.clone().text() },
        );

        return new Response(new Blob(['PK']), {
          headers: {
            'content-disposition':
              'attachment; filename="pcl-diagnostics-1-2.zip"',
          },
        });
      }),
    );
    const { default: Diagnostics } = await import('./diagnostics.svelte');

    const ctx = appContext({
      'GET /api/v1/ui': json(200, { diagnostics: true }),
    });
    await ctx.settings.read();

    await render(Diagnostics, { props: { ctx } });
    await page.getByRole('checkbox', { name: /agree to share it/ }).click();
    await page.getByRole('button', { name: 'Download diagnostics' }).click();

    await expect.poll(() => saved).toEqual(['pcl-diagnostics-1-2.zip']);
    // The page also reads which extensions add files, so the bundle is the
    // request that carries the choice.
    const bundle = sent.find((request) => request.url.includes('modules='));
    expect(bundle?.url).toContain('/api/v1/diagnostics');
    expect(bundle?.url).toContain('modules=false');
    expect(Array.isArray(JSON.parse(bundle?.body ?? ''))).toBe(true);
  });

  it('answers not found on a server without the bundle', async () => {
    const { default: Diagnostics } = await import('./diagnostics.svelte');
    const ctx = appContext({
      'GET /api/v1/ui': json(200, { diagnostics: false }),
    });
    await ctx.settings.read();

    const { container } = await render(Diagnostics, { props: { ctx } });

    expect(container.querySelector('[data-slot="not-found"]')).not.toBeNull();
    expect(
      page.getByRole('button', { name: 'Download diagnostics' }).query(),
    ).toBeNull();
  });
});
