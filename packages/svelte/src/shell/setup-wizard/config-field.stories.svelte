<!--
  One key of the wizard's configuration steps, outside the wizard. The wizard's
  own stories end at the code step, so the list that offers a value has its
  story here.
-->
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import type { SetupKey } from '../../data';
  import { EASYPRINT_ORIGIN } from '../easyprint';
  import ConfigField from './config-field.svelte';
  import { addWizardTexts } from './texts';

  addWizardTexts();

  const { Story } = defineMeta({
    title: 'Shell/SetupWizard/Config Field',
    component: ConfigField,
  });

  const origins: SetupKey = {
    path: 'core.api.allowed_origins',
    group: 'api',
    level: 'advanced',
    kind: 'text_list',
    default: null,
    choices: [],
    doc: 'Browser origins that may call this API from a page this server did not serve itself. A wildcard is refused.',
    secret: false,
    locked: false,
    reference: 'config/#key-core-api-allowed-origins',
  };

  const ports = {
    file: '/srv/prusa-connect/config/config.yaml',
    docsHref: undefined,
    showError: false,
    onanswer: () => undefined,
    onforget: () => undefined,
  };
</script>

<Story
  name="List That Offers EasyPrint"
  args={{ key: origins, shown: '', answered: false, ...ports }}
/>

<Story
  name="List With EasyPrint Allowed"
  args={{
    key: origins,
    shown: `http://localhost:5173\n${EASYPRINT_ORIGIN}`,
    answered: true,
    ...ports,
  }}
/>

<!-- The operator's file sets the key, so the list is shown and nothing is offered. -->
<Story
  name="List The File Sets"
  args={{
    key: { ...origins, locked: true, value: ['http://localhost:5173'] },
    shown: 'http://localhost:5173',
    answered: false,
    ...ports,
  }}
/>
