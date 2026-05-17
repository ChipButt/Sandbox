# The Restoration Route — Finished Static Firebase Build

Upload the contents of this folder to:

https://the-piston-club.github.io/The-Restoration-Route

## Firebase setup required

1. Firebase Authentication → Sign-in method → enable Email/Password.
2. Authentication → Settings → Authorized domains → add:
   the-piston-club.github.io
3. Firestore Database → create database.
4. Apply the included `firestore.rules`.

## Included

- Exact JSON layout positioning.
- Home as the base screen.
- Menu, Garage Directory and Venue pages as popups over Home.
- Scanner as a full-screen screen.
- Email/password account creation.
- Required username on registration.
- Basic offensive username blocking.
- Terms/prize-draw consent checkbox.
- Firebase email verification email sent on sign-up.
- Prize entries only become eligible if email is verified.
- Firestore user progress, leaderboard and scan event structures.
- 8 venues and 8 component repairs.
- Random long QR scan tokens rather than venue-name URLs.
- URL is immediately cleaned with `history.replaceState()` after a QR/deep-link scan.
- QR PNGs included in `qr-codes/`.
- QR URLs listed in `QR_LINKS.md`.
- Issues button opens email to chip@thepistonclub.co.uk.
- Admin: open Menu, tap the Restoration Route logo 5 times, then press the red X. Code: Watson.

## Static/free Firebase QR limitation

This is the strongest possible version while staying on static GitHub Pages + free Firebase.
The QR values are random and non-obvious, and the URL is immediately removed after scan.
However, without Cloud Functions/server validation, any secret stored in a frontend app can theoretically be found by someone inspecting the code.
