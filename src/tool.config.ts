// Per-tool metadata. This is the ONE file (together with the `base` in
// vite.config.ts, index.html's <title>/meta tags, README.md, and everything
// under src/tool/) that changes when this template is copied to a sibling
// tool repo.

export type ToolCategory = 'JSON' | 'JWT' | 'SQL' | 'Docker' | 'Git' | 'Web';

export interface ToolConfig {
  /** Unique identifier used in embed postMessage payloads and URLs. */
  slug: string;
  /** Display name shown in the header. */
  name: string;
  /** Short description used for meta tags and listings. */
  description: string;
  /** One of the shared MMOALL tool categories. */
  category: ToolCategory;
  /** Keywords for search/SEO purposes. */
  keywords: string[];
}

export const toolConfig: ToolConfig = {
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
};
