# 48px Character Pack Builder - GitHub Pages Fixed Version

This version fixes the blank GitHub Pages issue by putting the static front-end files at the repository root:

- `index.html`
- `styles.css`
- `app.js`

GitHub Pages can load those files.

## Important

GitHub Pages cannot run the AI backend. It only hosts static HTML/CSS/JS.

The backend is in:

```text
api-server/
```

You must run that locally or deploy it to a Node-supporting host.

## Local test

1. Unzip this package.
2. Open Terminal.
3. Go into the backend folder:

```bash
cd api-server
npm install
cp .env.example .env
npm start
```

4. Open the root `index.html` through GitHub Pages or just open it in your browser.
5. Set Backend URL to:

```text
http://localhost:3333
```

6. Click **Test backend**.

## Real AI generation

Edit:

```text
api-server/.env
```

Add:

```env
OPENAI_API_KEY=your_key_here
```

Restart the backend:

```bash
npm start
```

## GitHub Pages setup

For GitHub Pages:

- Set source to `main`
- Folder: `/root`

Do not use `/docs` unless you move `index.html`, `styles.css`, and `app.js` into `/docs`.

## Why the previous package went blank

The previous package had the website inside `/public` and expected a Node server to serve it.

GitHub Pages does not run Node servers, so it did not serve the app correctly.