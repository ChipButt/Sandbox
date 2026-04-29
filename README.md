# 48px Character Pack Builder

This app turns a reference photo or character artwork into a 48px north/east/south/west RPG character pack, then exports a drop-in ZIP containing:

- four 48px PNG character views
- a character JSON file
- a `.character.js` module
- a small optional procedural animation runtime
- install notes

It is designed for tile-based RPG projects where you want static NESW character art animated in code.

## What it does

1. Upload a reference image.
2. Enter name, role, size, visual notes, NPC behaviour, and dialogue.
3. Generate four static direction images:
   - north
   - east
   - south
   - west
4. Add tweak notes and regenerate until the character looks right.
5. Export a game-ready character pack ZIP.

## Important

The app has two modes:

### Mock mode

Works immediately with no API key.

It generates placeholder pixel sprites so you can test the full form, preview, and ZIP export flow.

### OpenAI mode

Add `OPENAI_API_KEY` to `.env` and restart the app.

The backend then uses the OpenAI Responses API with the image-generation tool to generate the reference-based NESW image set.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Then open:

```text
http://localhost:3333
```

## Add your OpenAI API key

Edit `.env`:

```env
OPENAI_API_KEY=your_key_here
```

Then restart:

```bash
npm start
```

## Output pack structure

```text
keth-frostiron-character-pack.zip
├── assets/
│   └── characters/
│       └── keth-frostiron/
│           ├── north.png
│           ├── east.png
│           ├── south.png
│           ├── west.png
│           └── nesw-48-preview.png
├── data/
│   └── characters/
│       └── keth-frostiron.json
├── code/
│   ├── characters/
│   │   └── keth-frostiron.character.js
│   └── runtime/
│       └── animatedCharacterRuntime.js
└── README.txt
```

## How the AI step works

The backend asks the image model to create a 2x2 contact sheet:

```text
top-left: north
top-right: east
bottom-left: south
bottom-right: west
```

The app then crops the contact sheet into four separate direction images and resizes them to your chosen sprite size, default 48x48.

## Why this does not need a sprite sheet

The exported runtime animates the static direction images using procedural movement:

- idle bob
- walk bob
- sway
- talk bounce

This is not true frame-by-frame walking animation. It is code-driven animation from static NESW images.