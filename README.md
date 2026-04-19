# Clean Copy

Copy text exactly as selected - no extra links, source credits, or promotional text added by the website.

<a href="https://chromewebstore.google.com/detail/clean-copy/hdofpmcaoldgoghhdhlocpbmoghoeecc">
<img width="206px" height="58px" alt="badge" src="https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png" />
</a>

## Development

Install dependencies:

```bash
pnpm i
```

## Build extension (create ZIP)

```bash
pnpm run build
```

This will generate:

```
extension.zip
```

in the project root.

## Load into Chrome

1. Open Chrome
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the project folder (recommended for development)

Alternatively:

- Extract `extension.zip`
- Use **Load unpacked** on the extracted folder
