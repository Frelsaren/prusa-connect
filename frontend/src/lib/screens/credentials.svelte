<script lang="ts">
  import type { ApiCredential, CredentialScope } from '@prusa/connect-ui/data';
  import {
    easyPrintPairHref,
    SettingsCredentialsScreen,
    SettingsScreen,
  } from '@prusa/connect-ui/shell';

  import { PATHS } from '../routes';
  import type { AppContext } from '../screens';

  let { ctx }: { ctx: AppContext } = $props();

  const credentials = $derived(ctx.credentials);

  // EasyPrint calls the server on the address this browser reached it on.
  const easyPrintHref =
    typeof window === 'undefined'
      ? undefined
      : easyPrintPairHref(window.location.origin);

  $effect(() => {
    void credentials.load();
  });
</script>

<SettingsScreen>
  <SettingsCredentialsScreen
    {credentials}
    pairHref={PATHS.pair}
    {easyPrintHref}
    onCreate={(name: string, days: number, scope: CredentialScope) => {
      void credentials.mint(name, days, scope);
    }}
    onDismiss={() => {
      credentials.dismiss();
    }}
    onRevoke={(credential: ApiCredential) => {
      void credentials.revoke(credential.id);
    }}
  />
</SettingsScreen>
