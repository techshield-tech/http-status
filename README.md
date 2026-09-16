# HTTP Status Code Reference

Look up every HTTP status code — reason phrase, class, plain-English explanation, common causes, spec reference, retryability, default cacheability, and related headers — fast, free, and 100% client-side. Includes a "Which status should I use?" decision helper.

**Live:** https://techshield-tech.github.io/http-status/

Part of [MMOALL Developer Tools](https://mmoall.com/tools).

## Features

- Full IANA registry coverage: every 1xx–5xx status code, including
  WebDAV (RFC 4918), Early Hints (RFC 8297), and the RFC 6585 codes
  (428/429/431/511).
- A clearly-labeled "unofficial/common" group for vendor/framework
  conventions that show up in the wild but aren't in the registry: 419,
  420, 444, 499, Cloudflare's 520–527, 598, and 599.
- For each code: reason phrase, class, a short explanation, when to use it
  (or its common causes), a spec reference (e.g. `RFC 9110 §15.5.5`),
  whether it's retryable, whether it's cacheable by default per
  RFC 9110 §15.1, and related HTTP headers.
- Search by code or text (matches the code, reason phrase, summary, and
  causes).
- Filter by class via chips: 1xx / 2xx / 3xx / 4xx / 5xx / Unofficial.
- A detail panel for the selected code, with a "copy link" button.
- Deep linking via the URL hash — e.g. `#404` opens that code's detail on
  load, and the hash updates as you browse.
- "Which status should I use?" decision helper: a few multiple-choice
  questions covering common REST scenarios (auth failure vs. permission
  denied vs. not found vs. validation error vs. rate limited vs. redirect
  types, and more) that narrow down to a suggested status code.
- All data is bundled and 100% client-side — nothing is sent over the
  network, and the tool works offline once loaded.
- Zero runtime dependencies beyond React.
- Responsive down to 360px viewport width.

## Embedding

This tool can be embedded in an iframe, e.g. on mmoall.com. In embed mode it
renders only the tool itself (no header/footer) on a transparent background.

```html
<iframe
  id="http-status"
  src="https://techshield-tech.github.io/http-status/?embed=1&theme=dark"
  style="width: 100%; border: 0;"
  title="HTTP Status Code Reference"
></iframe>

<script>
  const iframe = document.getElementById('http-status');

  // Resize the iframe to fit its content.
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type === 'mmoall-tool:height' && data.slug === 'http-status') {
      iframe.style.height = `${data.height}px`;
    }
    if (data && data.type === 'mmoall-tool:ready' && data.slug === 'http-status') {
      // The tool has mounted and is ready.
    }
  });

  // Push a theme change into the iframe (only accepted from an allowed origin).
  iframe.contentWindow.postMessage({ type: 'mmoall-tool:theme', theme: 'dark' }, '*');
</script>
```

### Contract

- `?embed=1` in the URL renders only the tool (no chrome), transparent
  background.
- `?theme=light` / `?theme=dark` sets the initial theme; otherwise it follows
  `prefers-color-scheme`.
- The page listens for `window.postMessage({type:'mmoall-tool:theme', theme})`
  from the parent frame to change theme at runtime. Only messages whose
  `event.origin` is `https://mmoall.com`, `https://www.mmoall.com`, or
  `http://localhost:3000` are accepted.
- On mount (embed mode only), the page posts
  `{type:'mmoall-tool:ready', slug:'http-status'}` to `window.parent`.
- Whenever its rendered height changes (embed mode only), the page posts
  `{type:'mmoall-tool:height', slug:'http-status', height}` to
  `window.parent`.

## Local development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```

Deployment to GitHub Pages happens automatically via
`.github/workflows/deploy.yml` on every push to `main`.

## License

MIT — see [LICENSE](./LICENSE).
