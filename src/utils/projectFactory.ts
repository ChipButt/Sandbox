import type {
  AssetDefinition,
  CanvasSettings,
  LayerDefinition,
  MeasurementKind,
  MeasurementPlanObject,
  ObjectPreset,
  PlanObject,
  PlanObjectPatch,
  PlanufProject,
  Point,
} from "../types/project";
import { PLANUF_FILE_VERSION } from "../types/project";
import { createId } from "./id";

export const DEFAULT_LAYER_ID = "layer_main";

export const defaultCanvasSettings: CanvasSettings = {
  width: 3200,
  height: 1800,
  background: "#f4f5f7",
  gridSize: 20,
  unit: "metric",
  pixelsPerUnit: 40,
  scaleLabel: "1 square = 0.5 m",
  gridVisible: true,
  snapEnabled: true,
  snapToObjects: true,
  snapToCenters: true,
  smartGuides: true,
  room: {
    visible: true,
    x: 560,
    y: 360,
    width: 2080,
    height: 1080,
    areaMode: "vertical",
    splitRatio: 0.62,
    performanceLabel: "Performance Area",
    crewLabel: "Crew Area",
    performanceColor: "#e0f2fe",
    crewColor: "#ecfdf5",
    labelColor: "#334155",
  },
};

export function createDefaultLayers(): LayerDefinition[] {
  return [
    { id: "layer_walls", name: "Set Walls", locked: false, visible: true },
    { id: "layer_main", name: "Objects", locked: false, visible: true },
    { id: "layer_annotations", name: "Measurements", locked: false, visible: true },
  ];
}

export function createBlankProject(name = "Untitled Set Plan"): PlanufProject {
  const now = new Date().toISOString();

  return {
    version: PLANUF_FILE_VERSION,
    metadata: {
      id: createId("project"),
      name,
      createdAt: now,
      updatedAt: now,
      author: "Local user",
    },
    canvas: structuredClone(defaultCanvasSettings),
    layers: createDefaultLayers(),
    objects: [],
    presets: [],
  };
}

function layerForAsset(asset: AssetDefinition): string {
  if (asset.objectType === "wall" || asset.objectType === "curved-wall" || asset.objectType === "door" || asset.objectType === "window") {
    return "layer_walls";
  }

  return DEFAULT_LAYER_ID;
}

export function createObjectFromAsset(
  asset: AssetDefinition,
  point: Point,
  overrides: PlanObjectPatch = {},
): PlanObject {
  const base = {
    id: createId("obj"),
    type: asset.objectType,
    name: asset.name,
    assetId: asset.id,
    assetPath: asset.path,
    assetSvg: asset.svg,
    category: asset.category,
    x: point.x - asset.defaultWidth / 2,
    y: point.y - asset.defaultHeight / 2,
    width: asset.defaultWidth,
    height: asset.defaultHeight,
    baseWidth: asset.defaultWidth,
    baseHeight: asset.defaultHeight,
    rotation: 0,
    opacity: 1,
    fill: "transparent",
    stroke: asset.defaultColor,
    strokeWidth: 7,
    notes: "",
    locked: false,
    visible: true,
    layerId: layerForAsset(asset),
    flipX: false,
    flipY: false,
  };

  switch (asset.objectType) {
    case "camera":
      return {
        ...base,
        type: "camera",
        viewAngle: 45,
        viewDistance: 420,
        coneColor: "#2563eb",
        coneOpacity: 0.18,
        showCone: true,
        ...overrides,
      };
    case "light":
      return {
        ...base,
        type: "light",
        beamAngle: 55,
        beamLength: 320,
        beamColor: "#f59e0b",
        beamOpacity: 0.2,
        showBeam: true,
        ...overrides,
      };
    case "wall":
    case "curved-wall":
    case "door":
    case "window":
      return {
        ...base,
        type: asset.objectType,
        thickness: 14,
        curvature: asset.objectType === "curved-wall" ? 0.5 : 0,
        height: asset.objectType === "wall" ? 18 : asset.defaultHeight,
        ...overrides,
      };
    case "table":
      return {
        ...base,
        type: "table",
        tableShape: asset.id.includes("round") ? "round" : "rect",
        keepProportions: asset.id.includes("round"),
        ...overrides,
      };
    default:
      return {
        ...base,
        type: "asset",
        ...overrides,
      };
  }
}

export function createMeasurementObject(
  kind: MeasurementKind,
  start: Point,
  end: Point,
  layerId = "layer_annotations",
): MeasurementPlanObject {
  const width = end.x - start.x;
  const height = end.y - start.y;

  return {
    id: createId("measure"),
    type: "measurement",
    measurementKind: kind,
    name: kind === "room" ? "Room Dimensions" : "Measurement",
    x: start.x,
    y: start.y,
    width,
    height,
    baseWidth: Math.max(1, Math.abs(width)),
    baseHeight: Math.max(1, Math.abs(height)),
    rotation: 0,
    opacity: 1,
    fill: "transparent",
    stroke: "#0891b2",
    strokeWidth: 2,
    notes: "",
    locked: false,
    visible: true,
    layerId,
    flipX: false,
    flipY: false,
    label: "",
  };
}

export function cloneObjectForPaste(object: PlanObject, offset: Point): PlanObject {
  return {
    ...structuredClone(object),
    id: createId("obj"),
    name: `${object.name} copy`,
    x: object.x + offset.x,
    y: object.y + offset.y,
    locked: false,
  };
}

export function clonePresetObject(preset: ObjectPreset, point: Point): PlanObject {
  return {
    ...structuredClone(preset.object),
    id: createId("obj"),
    name: preset.name,
    x: point.x - preset.object.width / 2,
    y: point.y - preset.object.height / 2,
    locked: false,
    visible: true,
  };
}

export function touchProject(project: PlanufProject): PlanufProject {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}
