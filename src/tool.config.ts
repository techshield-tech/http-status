// Per-tool metadata. This is the ONE file (together with `src/tool/`,
// `index.html`'s fallback <title>, and this repo's README) that changes
// when this template is copied to a new tool repo.

// Imports from '@mmoall/tool-kit/config' (a plain-JS-backed subpath), not
// the main '@mmoall/tool-kit' barrel — this file is also reachable from
// vite.config.ts's config-load chain, which cannot load the main barrel's
// .ts source from inside node_modules. See '@mmoall/tool-kit/config's
// source comment for why.
import { defineToolConfig } from '@mmoall/tool-kit/config';

export const toolConfig = defineToolConfig({
  slug: 'http-status',
  name: 'HTTP Status Code Reference',
  description:
    'Look up every HTTP status code — meaning, causes, spec reference, retryability, caching, and related headers — plus a decision helper. 100% client-side.',
  category: 'Web',
  keywords: [
    'http status codes',
    'http status code reference',
    'http error codes',
    'status code lookup',
    'which status code should i use',
    'rest api status codes',
    'rfc 9110',
  ],
});
