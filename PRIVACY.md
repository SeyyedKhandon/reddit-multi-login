# Privacy Policy – Account Switcher for Reddit

_Last updated: 2026-10-04_

Account Switcher for Reddit does not track you. It has no analytics, no telemetry, no ads and no server of its own.

## What the extension stores
To let you switch accounts, the extension saves a copy of your Reddit **session cookies** (the same cookies your browser already keeps while you are logged in) together with your Reddit username and avatar URL.

- This data is stored **only on your device**, in the extension's local storage (`chrome.storage.local`). It is never synced and never sent anywhere.
- The extension **never sees, asks for or stores your password.** You type it on Reddit's own login page.
- You can remove any saved account at any time with the × button in the toolbar popup, or remove everything by uninstalling the extension.

## Network requests
The only request the extension makes is to `reddit.com` (`/api/me.json`) to find out which account is currently logged in. It talks to no other server.

## Permissions
- `cookies` + access to `reddit.com`: save and restore the Reddit session when you switch accounts.
- `storage`: keep the saved accounts on your device.

## Third parties
No data is collected, so none is sold, shared or transferred to third parties.

## Open source
The full source code is available for inspection under the MIT license (see `LICENSE`).

## Contact
support.mhdi@gmail.com
