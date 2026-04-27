# Roll Britannia Forge Quest — Rune Scanner Build

This is the player-facing live-event build.

## What changed in this version

- The app now has a built-in rune scanner called **The Aether Lens**.
- Players no longer need to use their phone camera app for normal play.
- The main screen is simplified: sword, progress, scan button, and known rune locations.
- QR setup links, reset, and dev tools are hidden from normal users.
- Sync happens automatically when the device is online.
- Firebase imports are loaded only when syncing, so the app can still open offline after it has been cached.
- Firestore rules are included in `firestore.rules`.

## Firebase setup required

You need these Firebase services switched on:

1. **Authentication**
   - Go to Firebase Console → Authentication → Sign-in method.
   - Enable **Anonymous** sign-in.

2. **Cloud Firestore**
   - Go to Firebase Console → Firestore Database.
   - Create the database if you have not already done so.
   - Start in whichever mode Firebase offers, then immediately replace the rules.

3. **Firestore Rules**
   - Open Firestore Database → Rules.
   - Replace the existing rules with the full contents of `firestore.rules`.
   - Publish the rules.

If Anonymous Authentication is not enabled, the app will save locally but cloud sync will not work.

## Upload to GitHub Pages

Upload the full folder contents to your GitHub Pages repo.

Required files/folders:

```text
index.html
manifest.webmanifest
service-worker.js
css/main.css
js/app.js
js/config.js
js/firebaseClient.js
js/scanner.js
js/storage.js
js/swordData.js
js/ui.js
assets/icons/icon-192.png
assets/icons/icon-512.png
```

The camera scanner needs HTTPS. GitHub Pages is fine.

## QR code links

Replace `https://YOUR-SITE-HERE/` with your real GitHub Pages URL.

### Player rune QR codes

```text
https://YOUR-SITE-HERE/index.html?scan=roll-britannia
https://YOUR-SITE-HERE/index.html?scan=stand-1
https://YOUR-SITE-HERE/index.html?scan=stand-2
https://YOUR-SITE-HERE/index.html?scan=stand-3
https://YOUR-SITE-HERE/index.html?scan=stand-4
https://YOUR-SITE-HERE/index.html?scan=stand-5
```

Each one can only upgrade a player once.

### Staff claim QR codes

```text
https://YOUR-SITE-HERE/index.html?claim=legendary&claimCode=rbf-legendary-claim
https://YOUR-SITE-HERE/index.html?claim=godlike&claimCode=rbf-godlike-claim
```

Legendary claim gives the immediate gift.

Godlike claim opens the prize draw consent form, then records the prize draw entry in Firestore.

## Developer test panel

Normal players will not see QR links or reset buttons.

To show the developer panel, open:

```text
https://YOUR-SITE-HERE/index.html?dev=1
```

## Browser scanner note

The built-in camera scanner uses the browser's `BarcodeDetector` API.

If a device/browser does not support that scanner, the app shows a manual fallback. The normal QR links still work if scanned with the phone camera app.

## Where the data saves in Firestore

The app writes to:

```text
forgeQuestPlayers/{anonymousAuthUid}
forgeQuestPrizeDraw/{anonymousAuthUid}
```

The rules only allow each anonymous user to read/write their own records.
