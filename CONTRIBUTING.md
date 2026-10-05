# Contributing

Bug reports and pull requests are welcome.

## Setup

```bash
npm ci
npx playwright install chromium   # once, for the e2e tests
npm run dev                       # rebuilds dist/ on change
```

Load `dist/` as an unpacked extension in `chrome://extensions` (Developer mode).

## Before opening a pull request

```bash
npm run verify
```

That runs the typecheck, the unit tests, a production build and the end-to-end
tests. CI runs the same steps.

## How the tests work

- **Unit tests (`test/`)** run in Node against a small fake `chrome.*` API and a
  fake Reddit (`test/helpers/fake-chrome.ts`). Use them for logic in
  `src/background/`.
- **End-to-end tests (`e2e/`)** launch real Chromium with the built `dist/`
  loaded. Chromium is told to resolve `www.reddit.com` to a local mock server
  (`e2e/mock-reddit.ts`), so the extension runs exactly as shipped without
  touching the real site or any real account. They test `dist/`, so run
  `npm run build` after changing source.

## Guidelines

- The extension asks for `cookies` and `storage` on `reddit.com` only. Do not add
  permissions, network calls to other hosts, analytics or remote code.
- Cookies must never be sent to the UI. `AppState` deliberately has no cookie
  field; keep it that way.
- Keep `package.json` and `public/manifest.json` on the same version
  (`test/manifest.test.ts` checks).
- When Reddit changes its markup, the fix is normally in
  `src/content/profile-button.ts`. Add the new selector with a test.
