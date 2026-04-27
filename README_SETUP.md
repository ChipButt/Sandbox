# Roll Britannia Forge Quest — Rune Scanner v4 Test Build

This is the player-facing live-event build with a proper test mode.

## What this version does

- Uses six quest rune locations:
  - Roll Britannia
  - Stand 1
  - Stand 2
  - Stand 3
  - Stand 4
  - Stand 5
- The player can scan the six normal rune QR codes in any order.
- Each unique rune upgrades the sword once.
- Duplicate rune scans do not upgrade again.
- Legendary claim and Godlike claim are triggered by separate staff-held claim QR codes.
- Godlike claim opens the prize draw consent form.
- Progress is saved in this browser and synced to Firebase when online.
- The app is a PWA and caches its core files for weak-signal use after first load.

## Important wording for players

Use this same phone and browser for the whole quest so your sword progress is remembered.

A browser-based app cannot guarantee “same physical device” across Safari, Chrome, private browsing, cleared website data, etc. It remembers the same browser profile.

## Firebase setup required

You need these Firebase services switched on:

1. **Authentication**
   - Firebase Console → Authentication → Sign-in method.
   - Enable **Anonymous** sign-in.

2. **Cloud Firestore**
   - Firebase Console → Firestore Database.
   - Create the database if needed.

3. **Firestore Rules**
   - Firestore Database → Rules.
   - Replace the existing rules with the full contents of `firestore.rules`.
   - Publish the rules.

If Anonymous Authentication is not enabled, the app will save locally but cloud sync will fail.

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

## Built-in scanner note

The app now tries two scanner methods:

1. Browser-native `BarcodeDetector` where supported.
2. `html5-qrcode` fallback for browsers that support camera access but not native QR decoding.

That matters because some mobile browsers can open the camera but do not support the browser-native BarcodeDetector API.

For best offline behaviour, open the app and open the scanner once while online before relying on it in a poor-signal venue. The app shell is cached automatically; the fallback QR decoder is cached after it has loaded once.

## How to test without printing QR codes

Open the app with:

```text
https://YOUR-SITE-HERE/index.html?dev=1
```

This reveals the Developer Tools panel.

Use:

```text
Fake Scan: Absorb Next Unused Rune
```

Press it repeatedly to simulate scanning the six stands:

```text
1 press = Common
2 presses = Uncommon
3 presses = Rare
4 presses = Very Rare
5 presses = Legendary
6 presses = Godlike
```

Then test:

```text
Fake Scan: Legendary Claim Rune
Fake Scan: Godlike Claim Rune
```

Important: if you claim Legendary at level 5, that completes the quest and you cannot continue to Godlike on that same browser save. Use the reset button in the Testing Controls panel if you want to test Godlike afterwards.

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

## Where the data saves in Firestore

The app writes to:

```text
forgeQuestPlayers/{anonymousAuthUid}
forgeQuestPrizeDraw/{anonymousAuthUid}
```

The rules only allow each anonymous user to read/write their own records.
