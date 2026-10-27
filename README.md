<p align="center">
  <img src="./public/icon/48.png" alt="Clean Copy logo" />
</p>

# Clean Copy

Web extension that preserves exactly what you selected instead of letting websites add extra links, source labels, referral text, or other junk to your clipboard.

![GitHub Release](https://img.shields.io/github/v/release/maciekt07/clean-copy?color=FF530A)
![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/hdofpmcaoldgoghhdhlocpbmoghoeecc?color=FF530A)
![Chrome Web Store Size](https://img.shields.io/chrome-web-store/size/hdofpmcaoldgoghhdhlocpbmoghoeecc?color=FF530A)
![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/hdofpmcaoldgoghhdhlocpbmoghoeecc?color=FF530A)
![GitHub License](https://img.shields.io/github/license/maciekt07/clean-copy?color=FF530A)

<p>
  <a href="https://chromewebstore.google.com/detail/clean-copy/hdofpmcaoldgoghhdhlocpbmoghoeecc">
    <img
      width="206"
      height="58"
      alt="Get Clean Copy from the Chrome Web Store"
      src="https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png"
    />
  </a>
</p>

## Development

Install dependencies:

```bash
pnpm install
```

Start Chrome:

```bash
pnpm dev
```

Firefox:

```bash
pnpm dev:firefox
```

### Playground

There's a small page for testing copy behavior:

```bash
pnpm dev:playground
```

Starts the playground server and `wxt dev`, then opens Chrome at `http://127.0.0.1:4173` with the extension loaded. Select some text, hit Cmd/Ctrl+C, check what landed in the clipboard.

If you only need the page:

```bash
pnpm playground
```

E2E tests use the same page and start the server themselves:

```bash
pnpm build
pnpm test:e2e
```

## Release

Create a release with:

```bash
pnpm release
```

This uses [release-it](https://github.com/release-it/release-it) to:

1. Bump the version in `package.json`
2. Commit the change
3. Create a git tag with the version (e.g. `v1.2.3`)
4. Push the commit and tag, which triggers the release workflow

Pushing a `v*` tag starts the [Release Pipeline](https://github.com/maciekt07/clean-copy/blob/main/.github/workflows/release-pipeline.yml) GitHub Actions workflow, which:

1. Runs quality checks and Playwright E2E tests
2. Builds and zips the Chrome and Firefox extensions
3. Creates a GitHub release with both ZIPs
4. Submits the Chrome ZIP to the Chrome Web Store for review

## Credits

Made by [maciekt07](https://github.com/maciekt07), licensed under [MIT](https://github.com/maciekt07/clean-copy/blob/main/LICENSE)
