# Roll Britannia Forge Quest

This is a working offline-capable prototype for the Roll Britannia live-event sword upgrade quest.

## What it does

- Six normal quest QR codes:
  - Roll Britannia
  - Stand 1
  - Stand 2
  - Stand 3
  - Stand 4
  - Stand 5
- The player can scan the stands in any order.
- Each unique stand upgrades the sword once.
- Duplicate scans do not upgrade the sword again.
- Sword progress:
  1. Common
  2. Uncommon
  3. Rare
  4. Very Rare
  5. Legendary
  6. Godlike
- Legendary claim QR exchanges the sword for an immediate gift.
- Godlike claim QR exchanges the sword for an immediate gift and opens the prize draw form.
- Progress saves locally if the connection is poor.
- Progress syncs to Firebase when the device has connection.
- The app shell is cached as a PWA after the first online load.

## Firebase setup

In Firebase Console:

1. Enable **Authentication**.
2. Enable **Anonymous** sign-in provider.
3. Enable **Cloud Firestore**.
4. Open Firestore Rules.
5. Replace the rules with the contents of `firestore.rules`.
6. Publish the rules.

## GitHub Pages setup

Upload everything in this folder to your GitHub Pages repository.

The app expects this structure:

```text
index.html
manifest.webmanifest
service-worker.js
css/main.css
js/app.js
js/config.js
js/firebaseClient.js
js/storage.js
js/swordData.js
js/ui.js
assets/icons/icon-192.png
assets/icons/icon-512.png
```

## QR code links

Once the app is live, open it in the browser and expand **QR setup links**.

The app will show the exact URLs for:

- Roll Britannia
- Stand 1
- Stand 2
- Stand 3
- Stand 4
- Stand 5
- Legendary Claim QR
- Godlike Claim QR

The normal quest links look like:

```text
https://YOUR-SITE/index.html?scan=roll-britannia
https://YOUR-SITE/index.html?scan=stand-1
https://YOUR-SITE/index.html?scan=stand-2
https://YOUR-SITE/index.html?scan=stand-3
https://YOUR-SITE/index.html?scan=stand-4
https://YOUR-SITE/index.html?scan=stand-5
```

The staff claim links look like:

```text
https://YOUR-SITE/index.html?claim=legendary&claimCode=rbf-legendary-claim
https://YOUR-SITE/index.html?claim=godlike&claimCode=rbf-godlike-claim
```

## Important event note

The app must be opened online at least once on a phone before offline/PWA behaviour can work properly. After that first load, the service worker can cache the app shell and the app can continue saving locally during bad signal.

## Placeholder assets

The sword images are currently generated as inline SVGs in `js/ui.js`.

When you have final artwork, replace the `createSwordSvg()` function in `js/ui.js` with image paths such as:

```text
assets/swords/sword-common.png
assets/swords/sword-uncommon.png
assets/swords/sword-rare.png
assets/swords/sword-very-rare.png
assets/swords/sword-legendary.png
assets/swords/sword-godlike.png
```
