import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import fss from "fs";
import crypto from "crypto";
import archiver from "archiver";
import sharp from "sharp";
import slugify from "slugify";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3333;
const ROOT = process.cwd();
const GENERATED_DIR = path.join(ROOT, "generated");

await fs.mkdir(GENERATED_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(ROOT, "public")));
app.use("/generated", express.static(GENERATED_DIR));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function safeSlug(value, fallback = "character") {
  const base = slugify(String(value || fallback), {
    lower: true,
    strict: true,
    trim: true
  });
  return base || fallback;
}

function parseDialogue(raw) {
  return String(raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildPrompt(form, tweakNotes = "") {
  const name = form.name || "Unnamed Character";
  const role = form.role || "NPC";
  const personality = form.personality || "neutral";
  const artNotes = form.artNotes || "";
  const width = Number(form.width || 48);
  const height = Number(form.height || 48);

  return `
Create a single square contact sheet containing four separate pixel-art RPG character views.

Character name: ${name}
Character role: ${role}
Personality / NPC behaviour: ${personality}
Extra visual notes: ${artNotes}
Requested final in-game sprite size: ${width}x${height}px

Reference image rules:
- Use the uploaded image as the main likeness reference.
- Preserve recognisable character features, silhouette, clothing, colours, hair, beard, accessories, and age impression where possible.
- Convert the character into clean retro pixel art suitable for a 48px tile-based top-down RPG.

Contact sheet layout:
- 2 columns x 2 rows.
- Top-left: NORTH / back-facing view.
- Top-right: EAST / right-facing side view.
- Bottom-left: SOUTH / front-facing view.
- Bottom-right: WEST / left-facing side view.
- Each quadrant must contain exactly one full-body character sprite, centred.
- Use the same proportions, scale, palette, and outfit across all four views.
- Transparent background if supported, otherwise plain flat background.
- No labels, no text, no shadows, no props, no border, no floor.

Sprite style:
- Crisp pixel art.
- 3/4 top-down RPG overworld character style.
- NES/SNES-inspired simplicity, but readable.
- Character must fit inside a 48x48 frame after resizing.
- Strong silhouette.
- Avoid tiny messy details.
- Do not make the character realistic or painterly.
- Do not create animation frames; only four static direction views.

${tweakNotes ? `Tweak instructions to apply carefully:\n${tweakNotes}` : ""}
`.trim();
}

async function saveBuffer(filePath, buffer) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
}

async function createMockSheet(sessionDir, form) {
  const width = 1024;
  const height = 1024;
  const colours = {
    bg: { r: 0, g: 0, b: 0, alpha: 0 },
    outline: "#2b1a12",
    skin: "#d79668",
    hair: "#5c351f",
    shirt: "#2d5c79",
    trousers: "#4a3928",
    boots: "#1f1814"
  };

  const svgParts = [];
  const labels = [
    { key: "north", x: 256, y: 256 },
    { key: "east", x: 768, y: 256 },
    { key: "south", x: 256, y: 768 },
    { key: "west", x: 768, y: 768 }
  ];

  for (const item of labels) {
    const cx = item.x;
    const cy = item.y;
    const side = item.key === "east" || item.key === "west";
    const back = item.key === "north";
    const face = item.key === "south";

    svgParts.push(`<g transform="translate(${cx - 96}, ${cy - 128})">`);
    svgParts.push(`<rect x="70" y="130" width="52" height="82" rx="12" fill="${colours.trousers}" stroke="${colours.outline}" stroke-width="10"/>`);
    svgParts.push(`<rect x="52" y="68" width="88" height="82" rx="16" fill="${colours.shirt}" stroke="${colours.outline}" stroke-width="10"/>`);

    if (side) {
      svgParts.push(`<ellipse cx="96" cy="40" rx="39" ry="45" fill="${colours.skin}" stroke="${colours.outline}" stroke-width="10"/>`);
      svgParts.push(`<path d="M70 20 C88 -10 128 4 135 38 C128 26 105 25 94 30 C83 35 79 55 70 64 Z" fill="${colours.hair}"/>`);
      svgParts.push(`<rect x="${item.key === "east" ? 126 : 52}" y="42" width="12" height="8" fill="${colours.outline}"/>`);
    } else if (back) {
      svgParts.push(`<ellipse cx="96" cy="40" rx="42" ry="45" fill="${colours.hair}" stroke="${colours.outline}" stroke-width="10"/>`);
      svgParts.push(`<path d="M60 54 C76 76 116 80 134 52 L132 84 L62 84 Z" fill="${colours.hair}"/>`);
    } else if (face) {
      svgParts.push(`<ellipse cx="96" cy="40" rx="42" ry="45" fill="${colours.skin}" stroke="${colours.outline}" stroke-width="10"/>`);
      svgParts.push(`<path d="M55 28 C70 -4 121 -10 139 30 C121 20 81 20 55 28 Z" fill="${colours.hair}"/>`);
      svgParts.push(`<rect x="78" y="42" width="10" height="8" fill="${colours.outline}"/>`);
      svgParts.push(`<rect x="108" y="42" width="10" height="8" fill="${colours.outline}"/>`);
      svgParts.push(`<rect x="84" y="64" width="28" height="10" fill="${colours.hair}"/>`);
    }

    svgParts.push(`<rect x="36" y="82" width="28" height="76" rx="12" fill="${colours.shirt}" stroke="${colours.outline}" stroke-width="8"/>`);
    svgParts.push(`<rect x="128" y="82" width="28" height="76" rx="12" fill="${colours.shirt}" stroke="${colours.outline}" stroke-width="8"/>`);
    svgParts.push(`<rect x="62" y="204" width="34" height="42" rx="8" fill="${colours.boots}" stroke="${colours.outline}" stroke-width="8"/>`);
    svgParts.push(`<rect x="100" y="204" width="34" height="42" rx="8" fill="${colours.boots}" stroke="${colours.outline}" stroke-width="8"/>`);
    svgParts.push(`</g>`);
  }

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="none"/>
  ${svgParts.join("\n")}
</svg>`.trim();

  const sheetBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const sheetPath = path.join(sessionDir, "nesw-source-sheet.png");
  await saveBuffer(sheetPath, sheetBuffer);
  return sheetBuffer;
}

function extractImageBase64FromResponse(response) {
  const outputs = response.output || [];
  const found = outputs
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result)
    .filter(Boolean);

  if (found.length > 0) return found[0];

  // Some SDK versions expose nested content. Keep this as a defensive fallback.
  for (const output of outputs) {
    const content = output.content || [];
    for (const item of content) {
      if (item.type === "image_generation_call" && item.result) return item.result;
    }
  }

  return null;
}

async function createAISheet(sessionDir, form, imageBuffer, imageMimeType, tweakNotes = "") {
  if (!openai) {
    return createMockSheet(sessionDir, form);
  }

  const base64Ref = imageBuffer.toString("base64");
  const prompt = buildPrompt(form, tweakNotes);

  const response = await openai.responses.create({
    model: process.env.OPENAI_REASONING_MODEL || "gpt-5.5",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          {
            type: "input_image",
            image_url: `data:${imageMimeType};base64,${base64Ref}`
          }
        ]
      }
    ],
    tools: [
      {
        type: "image_generation",
        action: process.env.IMAGE_TOOL_ACTION || "auto"
      }
    ]
  });

  const imageBase64 = extractImageBase64FromResponse(response);

  if (!imageBase64) {
    const debugPath = path.join(sessionDir, "openai-response-debug.json");
    await saveBuffer(debugPath, Buffer.from(JSON.stringify(response, null, 2)));
    throw new Error("OpenAI did not return an image. A debug response was saved in the generated session folder.");
  }

  const buffer = Buffer.from(imageBase64, "base64");
  const sheetPath = path.join(sessionDir, "nesw-source-sheet.png");
  await saveBuffer(sheetPath, buffer);
  return buffer;
}

async function splitSheetIntoDirections(sessionDir, sheetBuffer, frameWidth, frameHeight) {
  const meta = await sharp(sheetBuffer).metadata();
  const sourceWidth = meta.width || 1024;
  const sourceHeight = meta.height || 1024;
  const quadWidth = Math.floor(sourceWidth / 2);
  const quadHeight = Math.floor(sourceHeight / 2);

  const dirs = {
    north: { left: 0, top: 0 },
    east: { left: quadWidth, top: 0 },
    south: { left: 0, top: quadHeight },
    west: { left: quadWidth, top: quadHeight }
  };

  const out = {};

  for (const [dir, pos] of Object.entries(dirs)) {
    const buffer = await sharp(sheetBuffer)
      .extract({
        left: pos.left,
        top: pos.top,
        width: quadWidth,
        height: quadHeight
      })
      .resize(frameWidth, frameHeight, {
        fit: "contain",
        kernel: sharp.kernel.nearest,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    const filePath = path.join(sessionDir, `${dir}.png`);
    await saveBuffer(filePath, buffer);
    out[dir] = filePath;
  }

  return out;
}

async function buildPreviewSheet(sessionDir, directionFiles, frameWidth, frameHeight) {
  const sheetPath = path.join(sessionDir, "nesw-48-preview.png");
  const blank = await sharp({
    create: {
      width: frameWidth * 2,
      height: frameHeight * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: directionFiles.north, left: 0, top: 0 },
      { input: directionFiles.east, left: frameWidth, top: 0 },
      { input: directionFiles.south, left: 0, top: frameHeight },
      { input: directionFiles.west, left: frameWidth, top: frameHeight }
    ])
    .png()
    .toBuffer();

  await saveBuffer(sheetPath, blank);
  return sheetPath;
}

async function writeSessionMetadata(sessionDir, data) {
  await saveBuffer(path.join(sessionDir, "session.json"), Buffer.from(JSON.stringify(data, null, 2)));
}

async function readSession(sessionId) {
  const sessionDir = path.join(GENERATED_DIR, sessionId);
  const raw = await fs.readFile(path.join(sessionDir, "session.json"), "utf8");
  return {
    sessionDir,
    data: JSON.parse(raw)
  };
}

function characterConstName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.toUpperCase().replace(/[^A-Z0-9]/g, "_"))
    .join("_");
}

function buildCharacterJson(sessionData) {
  const form = sessionData.form;
  const slug = sessionData.slug;
  const width = Number(form.width || 48);
  const height = Number(form.height || 48);

  return {
    id: slug,
    name: form.name || "Unnamed Character",
    role: form.role || "npc",
    size: { width, height },
    sprites: {
      north: `assets/characters/${slug}/north.png`,
      east: `assets/characters/${slug}/east.png`,
      south: `assets/characters/${slug}/south.png`,
      west: `assets/characters/${slug}/west.png`
    },
    animation: {
      idle: {
        bobAmount: Number(form.idleBob || 1),
        bobSpeed: Number(form.idleSpeed || 900)
      },
      walk: {
        bobAmount: Number(form.walkBob || 2),
        bobSpeed: Number(form.walkSpeed || 180),
        swayAmount: Number(form.swayAmount || 1)
      },
      talk: {
        bobAmount: 1,
        bobSpeed: 220
      }
    },
    npc: {
      behaviour: form.behaviour || "stationary",
      movement: form.movement || "stationary",
      interactionRadius: Number(form.interactionRadius || 1),
      canTalk: form.canTalk !== "false",
      canTrade: form.canTrade === "true",
      canGiveQuest: form.canGiveQuest === "true",
      hostile: form.hostile === "true",
      personality: form.personality || ""
    },
    dialogue: parseDialogue(form.dialogue),
    notes: form.artNotes || ""
  };
}

function buildCharacterJs(sessionData) {
  const slug = sessionData.slug;
  const json = buildCharacterJson(sessionData);
  const constName = characterConstName(slug);

  return `// Auto-generated by Character Pack Builder.
// Drop this file into your game's character folder and import ${constName}.

export const ${constName} = ${JSON.stringify(json, null, 2)};

export default ${constName};
`;
}

function buildRuntimeJs() {
  return `// Generic procedural NESW character runtime.
// This is optional helper code. You can use the generated .character.js data with your own engine instead.

export class AnimatedCharacter {
  constructor(definition, imageMap) {
    this.definition = definition;
    this.images = imageMap;
    this.x = 0;
    this.y = 0;
    this.direction = "south";
    this.isWalking = false;
    this.isTalking = false;
    this.time = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  face(direction) {
    if (this.definition.sprites[direction]) this.direction = direction;
  }

  update(deltaMs) {
    this.time += deltaMs;
  }

  draw(ctx, cameraX = 0, cameraY = 0) {
    const img = this.images[this.direction];
    if (!img) return;

    const { width, height } = this.definition.size;
    const idle = this.definition.animation.idle;
    const walk = this.definition.animation.walk;
    const talk = this.definition.animation.talk;

    let yOffset = 0;
    let xOffset = 0;
    let scaleY = 1;

    if (this.isWalking) {
      yOffset = Math.sin(this.time / walk.bobSpeed * Math.PI * 2) * walk.bobAmount;
      xOffset = Math.sin(this.time / walk.bobSpeed * Math.PI * 2) * walk.swayAmount;
      scaleY = 1 + Math.sin(this.time / walk.bobSpeed * Math.PI * 2) * 0.025;
    } else if (this.isTalking) {
      yOffset = Math.sin(this.time / talk.bobSpeed * Math.PI * 2) * talk.bobAmount;
    } else {
      yOffset = Math.sin(this.time / idle.bobSpeed * Math.PI * 2) * idle.bobAmount;
    }

    const drawX = Math.round(this.x - cameraX + xOffset);
    const drawY = Math.round(this.y - cameraY + yOffset);

    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(drawX + width / 2, drawY + height);
    ctx.scale(1, scaleY);
    ctx.drawImage(img, -width / 2, -height, width, height);
    ctx.restore();
  }
}

export async function loadCharacterImages(definition, basePath = "./") {
  const entries = Object.entries(definition.sprites);

  const pairs = await Promise.all(entries.map(([direction, src]) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve([direction, image]);
      image.onerror = reject;
      image.src = basePath + src;
    });
  }));

  return Object.fromEntries(pairs);
}
`;
}

function buildReadme(sessionData) {
  const slug = sessionData.slug;
  const constName = characterConstName(slug);

  return `# ${sessionData.form.name || slug} Character Pack

This pack was generated by Character Pack Builder.

## Files

- assets/characters/${slug}/north.png
- assets/characters/${slug}/east.png
- assets/characters/${slug}/south.png
- assets/characters/${slug}/west.png
- data/characters/${slug}.json
- code/characters/${slug}.character.js
- code/runtime/animatedCharacterRuntime.js

## Basic use

Import the generated character module:

\`\`\`js
import { ${constName} } from "./code/characters/${slug}.character.js";
\`\`\`

Your game needs to load the four directional PNGs and draw the correct one based on direction.

## Optional runtime helper

The included animatedCharacterRuntime.js can create simple code animation from static NESW images:

- idle bob
- walk bob
- side sway
- talk bounce

This does not create true hand-drawn walking frames. It creates procedural movement from static directional sprites.

## Sprite size

${sessionData.form.width || 48}x${sessionData.form.height || 48}px

## Notes

If the generated likeness is not right, go back to the app, add tweak notes, regenerate, then export again.
`;
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mode: openai ? "openai" : "mock",
    message: openai
      ? "OpenAI API key detected. Real generation enabled."
      : "No OpenAI API key detected. Mock generation enabled."
  });
});

app.post("/api/generate", upload.single("reference"), async (req, res) => {
  try {
    const form = req.body || {};
    const width = Math.max(16, Math.min(256, Number(form.width || 48)));
    const height = Math.max(16, Math.min(256, Number(form.height || 48)));

    const sessionId = crypto.randomUUID();
    const slug = safeSlug(form.name, "character");
    const sessionDir = path.join(GENERATED_DIR, sessionId);
    await fs.mkdir(sessionDir, { recursive: true });

    let sourceBuffer = req.file?.buffer;
    let sourceMime = req.file?.mimetype || "image/png";

    if (!sourceBuffer) {
      // Permit mock testing without an upload.
      sourceBuffer = Buffer.from("");
      sourceMime = "image/png";
    }

    const originalRefPath = path.join(sessionDir, "reference-original");
    if (req.file?.buffer) {
      await saveBuffer(`${originalRefPath}${path.extname(req.file.originalname || ".png") || ".png"}`, req.file.buffer);
    }

    const sheetBuffer = await createAISheet(
      sessionDir,
      { ...form, width, height },
      sourceBuffer,
      sourceMime,
      form.tweakNotes || ""
    );

    const directionFiles = await splitSheetIntoDirections(sessionDir, sheetBuffer, width, height);
    const previewSheet = await buildPreviewSheet(sessionDir, directionFiles, width, height);

    const sessionData = {
      sessionId,
      slug,
      form: { ...form, width, height },
      createdAt: new Date().toISOString(),
      mode: openai ? "openai" : "mock",
      files: {
        sourceSheet: "nesw-source-sheet.png",
        previewSheet: "nesw-48-preview.png",
        north: "north.png",
        east: "east.png",
        south: "south.png",
        west: "west.png"
      }
    };

    await writeSessionMetadata(sessionDir, sessionData);

    res.json({
      ok: true,
      mode: sessionData.mode,
      sessionId,
      slug,
      images: {
        sourceSheet: `/generated/${sessionId}/nesw-source-sheet.png`,
        previewSheet: `/generated/${sessionId}/nesw-48-preview.png`,
        north: `/generated/${sessionId}/north.png`,
        east: `/generated/${sessionId}/east.png`,
        south: `/generated/${sessionId}/south.png`,
        west: `/generated/${sessionId}/west.png`
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message || "Generation failed."
    });
  }
});

app.post("/api/export", async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) throw new Error("Missing sessionId.");

    const { sessionDir, data } = await readSession(sessionId);
    const slug = data.slug;
    const packName = `${slug}-character-pack.zip`;
    const zipPath = path.join(sessionDir, packName);

    const characterJson = buildCharacterJson(data);
    const characterJs = buildCharacterJs(data);
    const runtimeJs = buildRuntimeJs();
    const readme = buildReadme(data);

    await saveBuffer(path.join(sessionDir, `${slug}.json`), Buffer.from(JSON.stringify(characterJson, null, 2)));
    await saveBuffer(path.join(sessionDir, `${slug}.character.js`), Buffer.from(characterJs));
    await saveBuffer(path.join(sessionDir, "animatedCharacterRuntime.js"), Buffer.from(runtimeJs));
    await saveBuffer(path.join(sessionDir, "README.txt"), Buffer.from(readme));

    await new Promise((resolve, reject) => {
      const output = fss.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", resolve);
      archive.on("error", reject);
      archive.pipe(output);

      archive.file(path.join(sessionDir, "north.png"), { name: `assets/characters/${slug}/north.png` });
      archive.file(path.join(sessionDir, "east.png"), { name: `assets/characters/${slug}/east.png` });
      archive.file(path.join(sessionDir, "south.png"), { name: `assets/characters/${slug}/south.png` });
      archive.file(path.join(sessionDir, "west.png"), { name: `assets/characters/${slug}/west.png` });
      archive.file(path.join(sessionDir, "nesw-48-preview.png"), { name: `assets/characters/${slug}/nesw-48-preview.png` });
      archive.file(path.join(sessionDir, `${slug}.json`), { name: `data/characters/${slug}.json` });
      archive.file(path.join(sessionDir, `${slug}.character.js`), { name: `code/characters/${slug}.character.js` });
      archive.file(path.join(sessionDir, "animatedCharacterRuntime.js"), { name: `code/runtime/animatedCharacterRuntime.js` });
      archive.file(path.join(sessionDir, "README.txt"), { name: "README.txt" });

      archive.finalize();
    });

    res.json({
      ok: true,
      downloadUrl: `/generated/${sessionId}/${packName}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error.message || "Export failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Character Pack Builder running at http://localhost:${PORT}`);
  console.log(openai ? "Mode: OpenAI image generation" : "Mode: mock generation. Add OPENAI_API_KEY to .env for real image generation.");
});