import type { AssetDefinition, CanvasSettings, PlanObjectPatch, PlanufProject, Point } from "../types/project";
import { ASSET_MAP } from "./assets";
import { createBlankProject, createObjectFromAsset } from "./projectFactory";

interface TemplateObjectSpec {
  assetId: string;
  point: Point;
  overrides?: PlanObjectPatch;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
}

interface TemplateDefinition extends TemplateSummary {
  canvas?: Partial<CanvasSettings>;
  objects: TemplateObjectSpec[];
}

function objectSpec(assetId: string, x: number, y: number, overrides: PlanObjectPatch = {}): TemplateObjectSpec {
  return { assetId, point: { x, y }, overrides };
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: "blank-studio",
    name: "Blank Studio",
    description: "Open grid with production layers ready.",
    objects: [],
  },
  {
    id: "living-room",
    name: "Living Room",
    description: "Soft seating, practical lamp positions, camera and wall references.",
    objects: [
      objectSpec("set-walls/wall-straight", 900, 380, { width: 720, rotation: 0, name: "Back flats" }),
      objectSpec("set-walls/wall-straight", 540, 650, { width: 560, rotation: 90, name: "Camera-left wall" }),
      objectSpec("set-walls/window", 940, 380, { width: 160, name: "Dressed window" }),
      objectSpec("furniture/sofa", 940, 720, { width: 220, height: 120, name: "Hero sofa" }),
      objectSpec("furniture/chair", 720, 720, { rotation: 16, name: "Accent chair" }),
      objectSpec("furniture/table-round", 895, 900, { width: 110, height: 110, name: "Coffee table" }),
      objectSpec("props/rug", 890, 875, { width: 340, height: 210, stroke: "#47718c", name: "Area rug" }),
      objectSpec("lighting/practical-lamp", 1160, 675, { name: "Practical lamp" }),
      objectSpec("cameras/cinema-camera", 1010, 1220, { rotation: -90, name: "A camera" }),
      objectSpec("lighting/softbox", 620, 1060, { rotation: -35, name: "Key softbox" }),
    ],
  },
  {
    id: "interview-set",
    name: "Interview Set",
    description: "Two-person interview with key, fill, back light, and camera coverage.",
    objects: [
      objectSpec("set-walls/wall-straight", 1000, 420, { width: 780, name: "Backdrop wall" }),
      objectSpec("people/host", 875, 760, { name: "Interviewer" }),
      objectSpec("people/actor", 1110, 760, { name: "Guest" }),
      objectSpec("furniture/chair", 875, 815, { rotation: 12, name: "Interviewer chair" }),
      objectSpec("furniture/chair", 1110, 815, { rotation: -12, name: "Guest chair" }),
      objectSpec("cameras/cinema-camera", 990, 1210, { rotation: -90, name: "Wide camera" }),
      objectSpec("cameras/tripod-camera", 700, 1040, { rotation: -58, name: "Interviewer close-up" }),
      objectSpec("cameras/tripod-camera", 1280, 1040, { rotation: -122, name: "Guest close-up" }),
      objectSpec("lighting/softbox", 690, 610, { rotation: 28, name: "Key light" }),
      objectSpec("lighting/led-panel", 1280, 640, { rotation: -30, name: "Fill light" }),
      objectSpec("lighting/fresnel", 1000, 505, { rotation: 90, name: "Back light" }),
      objectSpec("audio/boom-mic", 990, 620, { rotation: 22, name: "Boom mic" }),
    ],
  },
  {
    id: "podcast",
    name: "Podcast",
    description: "Roundtable show setup with microphones, cameras, and monitors.",
    canvas: { pixelsPerUnit: 80, scaleLabel: "1 square = 0.25 m" },
    objects: [
      objectSpec("furniture/table-round", 1000, 780, { width: 260, height: 260, name: "Podcast table" }),
      objectSpec("people/host", 1000, 560, { name: "Host" }),
      objectSpec("people/actor", 820, 780, { rotation: 90, name: "Guest 1" }),
      objectSpec("people/actor", 1180, 780, { rotation: -90, name: "Guest 2" }),
      objectSpec("audio/lav-mic", 1000, 670, { name: "Host mic" }),
      objectSpec("audio/lav-mic", 895, 780, { rotation: 90, name: "Guest 1 mic" }),
      objectSpec("audio/lav-mic", 1105, 780, { rotation: -90, name: "Guest 2 mic" }),
      objectSpec("cameras/cinema-camera", 1000, 1160, { rotation: -90, name: "Main camera" }),
      objectSpec("cameras/action-camera", 720, 560, { rotation: -45, name: "Side camera" }),
      objectSpec("cameras/action-camera", 1280, 560, { rotation: -135, name: "Reverse side camera" }),
      objectSpec("misc/field-monitor", 1000, 980, { name: "Confidence monitor" }),
      objectSpec("audio/audio-mixer", 1390, 910, { name: "Audio mixer" }),
    ],
  },
  {
    id: "dining-room",
    name: "Dining Room",
    description: "Dining table coverage with practical set dressing and crew lanes.",
    objects: [
      objectSpec("set-walls/wall-corner", 690, 470, { width: 470, height: 470, name: "Dining corner flats" }),
      objectSpec("furniture/table-rect", 980, 790, { width: 280, height: 150, name: "Dining table" }),
      objectSpec("furniture/chair", 780, 790, { rotation: 90, name: "Chair 1" }),
      objectSpec("furniture/chair", 1180, 790, { rotation: -90, name: "Chair 2" }),
      objectSpec("furniture/chair", 980, 620, { rotation: 180, name: "Chair 3" }),
      objectSpec("furniture/chair", 980, 960, { name: "Chair 4" }),
      objectSpec("props/plant", 590, 525, { name: "Corner plant" }),
      objectSpec("cameras/tripod-camera", 1030, 1260, { rotation: -90, name: "Wide camera" }),
      objectSpec("lighting/led-panel", 655, 1050, { rotation: -38, name: "Key panel" }),
      objectSpec("lighting/practical-lamp", 1270, 580, { name: "Practical lamp" }),
    ],
  },
  {
    id: "office",
    name: "Office",
    description: "Desk-led YouTube or corporate filming layout.",
    objects: [
      objectSpec("set-walls/wall-straight", 980, 430, { width: 640, name: "Office backdrop" }),
      objectSpec("furniture/desk", 980, 725, { width: 250, height: 120, name: "Desk" }),
      objectSpec("furniture/chair", 980, 875, { name: "Desk chair" }),
      objectSpec("misc/laptop", 980, 710, { name: "Laptop" }),
      objectSpec("props/picture-frame", 840, 430, { name: "Wall frame" }),
      objectSpec("props/plant", 1210, 625, { name: "Plant" }),
      objectSpec("cameras/cinema-camera", 980, 1130, { rotation: -90, name: "Main camera" }),
      objectSpec("lighting/softbox", 710, 960, { rotation: -35, name: "Key softbox" }),
      objectSpec("lighting/led-panel", 1240, 930, { rotation: -140, name: "Fill panel" }),
      objectSpec("audio/boom-mic", 970, 615, { rotation: 12, name: "Boom mic" }),
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse",
    description: "Large open practical space with walls, columns, people and grip positions.",
    canvas: { width: 4200, height: 2400, gridSize: 40, pixelsPerUnit: 40, scaleLabel: "1 square = 1 m" },
    objects: [
      objectSpec("architecture/column", 870, 690, { name: "Column A" }),
      objectSpec("architecture/column", 1430, 690, { name: "Column B" }),
      objectSpec("architecture/column", 1990, 690, { name: "Column C" }),
      objectSpec("architecture/column", 870, 1260, { name: "Column D" }),
      objectSpec("architecture/column", 1430, 1260, { name: "Column E" }),
      objectSpec("architecture/column", 1990, 1260, { name: "Column F" }),
      objectSpec("set-walls/wall-straight", 1450, 390, { width: 1500, name: "Warehouse north wall" }),
      objectSpec("set-walls/door", 2140, 390, { width: 220, name: "Roll-up door" }),
      objectSpec("grip/dolly", 1180, 1570, { name: "Camera dolly" }),
      objectSpec("grip/c-stand", 1760, 1450, { name: "C-stand" }),
      objectSpec("grip/flag", 1650, 1180, { rotation: -25, name: "Negative fill" }),
      objectSpec("cameras/cinema-camera", 1180, 1660, { rotation: -64, name: "Dolly camera" }),
      objectSpec("people/actor", 1750, 880, { name: "Talent mark" }),
      objectSpec("misc/floor-mark", 1750, 960, { name: "Floor mark" }),
    ],
  },
  {
    id: "theatre-stage",
    name: "Theatre Stage",
    description: "Stage arc, audience sight lines, fixtures and performance positions.",
    canvas: { width: 3600, height: 2200 },
    objects: [
      objectSpec("set-walls/wall-curved", 1370, 520, { width: 780, height: 190, thickness: 20, name: "Cyclorama curve" }),
      objectSpec("set-walls/wall-straight", 1370, 760, { width: 900, name: "Downstage edge" }),
      objectSpec("lighting/fresnel", 880, 1030, { rotation: -55, name: "Stage left fresnel" }),
      objectSpec("lighting/fresnel", 1860, 1030, { rotation: -125, name: "Stage right fresnel" }),
      objectSpec("lighting/tube-light", 1370, 430, { rotation: 90, width: 160, height: 80, name: "Overhead strip" }),
      objectSpec("people/actor", 1370, 650, { name: "Performer" }),
      objectSpec("cameras/tripod-camera", 1370, 1430, { rotation: -90, name: "House camera" }),
      objectSpec("audio/speaker", 860, 790, { name: "Speaker L" }),
      objectSpec("audio/speaker", 1880, 790, { name: "Speaker R" }),
    ],
  },
];

function getAsset(assetId: string): AssetDefinition {
  const asset = ASSET_MAP.get(assetId);
  if (!asset) {
    throw new Error(`Template references a missing asset: ${assetId}`);
  }
  return asset;
}

export const TEMPLATE_SUMMARIES: TemplateSummary[] = TEMPLATE_DEFINITIONS.map(({ id, name, description }) => ({
  id,
  name,
  description,
}));

export function createProjectFromTemplate(templateId: string): PlanufProject {
  const template = TEMPLATE_DEFINITIONS.find((item) => item.id === templateId) ?? TEMPLATE_DEFINITIONS[0];
  const project = createBlankProject(template?.name ?? "Blank Studio");

  if (!template) {
    return project;
  }

  const objects = template.objects.map((spec) => createObjectFromAsset(getAsset(spec.assetId), spec.point, spec.overrides));

  return {
    ...project,
    canvas: {
      ...project.canvas,
      ...template.canvas,
    },
    objects,
  };
}
