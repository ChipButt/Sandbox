ASTRA Field Terminal

Open index.html to test locally. For live camera QR scanning, host the folder on HTTPS such as GitHub Pages or Netlify.

EDITING TEXT
All app wording is now in one editable file:

  data/content.js

Edit that file to change mission brief copy, inbox emails, anomaly names, anomaly info lines, scanner text, popup text, profile labels, and map coming-soon wording. Upload the changed file to GitHub and the app will use the updated wording automatically.

For testing without camera, add ?test=1 to the URL to reveal the SIMULATE SCAN button.

QR codes for printing are in the qr-codes folder.


Update: Pop-up alerts now appear centred over the full UI. The Home inbox button shows a blinking green unread-message dot only when unread mail exists.


Update: Agent Profile inputs and checkboxes have been moved above all panel elements and made directly tappable/editable on mobile. The Save Profile button now closes the profile immediately and then shows the saved confirmation over the Home UI.

Update: The six original static anomaly images have been replaced with animated WebP anomaly loops:
- Cyan Trackway Impression
- Magenta Fungal Bloom
- Lime Gas Vent
- Orange Geode Core
- Purple Liquid Basin
- Gold Sap Stump

Each anomaly now has its own scanner/data-log wording and its own UI glow colour. The app uses a new local storage key for this build so old test progress from the previous anomaly set will not corrupt the new scan order.
