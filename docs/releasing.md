# Releasing

1. Bump `version` in **both** `package.json` and `public/manifest.json`
   (`test/manifest.test.ts` fails if they differ).
2. Verify and build from a clean tree:
   ```bash
   npm ci
   npm run verify
   ```
3. Create the upload file:
   ```bash
   npm run package    # -> release/account-switcher-for-reddit-<version>.zip
   ```
   `scripts/package.sh` refuses to run if `dist/` was built from a different
   version, and zips from inside `dist/` so `manifest.json` is at the archive
   root, which is the only layout the Web Store accepts.
4. Upload the zip in the Chrome Web Store developer dashboard. Listing text lives
   in [`store/LISTING.md`](../store/LISTING.md).
5. Tag the commit that was released and push the tag (`git push` alone does not
   push tags):
   ```bash
   git tag v<version> && git push origin v<version>
   ```

Do not rebuild between step 3 and the upload: the zip should be exactly what was
verified.
