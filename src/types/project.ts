export const PLANUF_FILE_VERSION = 1;

export type AssetCategory =
  | "cameras"
  | "lighting"
  | "furniture"
  | "set-walls"
  | "architecture"
  | "props"
  | "audio"
  | "grip"
  | "people"
  | "misc";

export type PlanObjectType =
  | "asset"
  | "camera"
  | "light"
  | "wall"
  | "curved-wall"
  | "door"
  | "window"
  | "table"
  | "measurement";

export type MeasurementKind = "ruler" | "distance" | "dimension" | "room";
export type MeasurementUnit = "metric" | "imperial";
export type ActiveTool = "select" | "pan" | MeasurementKind;
export type ExportFormat = "png" | "png-transparent" | "png-4k" | "png-8k" | "svg" | "pdf-a4" | "pdf-a3";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface RectBounds extends Point, Size {}

export interface AssetDefinition {
  id: string;
  name: string;
  category: AssetCategory;
  categoryLabel: string;
  svg: string;
  path: string;
  defaultWidth: number;
  defaultHeight: number;
  objectType: PlanObjectType;
  defaultColor: string;
}

export type RoomAreaMode = "none" | "vertical" | "horizontal";

export interface RoomSettings extends RectBounds {
  visible: boolean;
  areaMode: RoomAreaMode;
  splitRatio: number;
  performanceLabel: string;
  crewLabel: string;
  performanceColor: string;
  crewColor: string;
  labelColor: string;
}

export interface CanvasSettings extends Size {
  background: string;
  gridSize: number;
  unit: MeasurementUnit;
  pixelsPerUnit: number;
  scaleLabel: string;
  gridVisible: boolean;
  snapEnabled: boolean;
  snapToObjects: boolean;
  snapToCenters: boolean;
  smartGuides: boolean;
  room: RoomSettings;
}

export interface LayerDefinition {
  id: string;
  name: string;
  locked: boolean;
  visible: boolean;
}

export interface ObjectPreset {
  id: string;
  name: string;
  createdAt: string;
  object: PlanObject;
}

export interface BasePlanObject extends RectBounds {
  id: string;
  type: PlanObjectType;
  name: string;
  assetId?: string;
  assetPath?: string;
  assetSvg?: string;
  category?: AssetCategory;
  baseWidth: number;
  baseHeight: number;
  rotation: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  notes: string;
  locked: boolean;
  visible: boolean;
  layerId: string;
  flipX: boolean;
  flipY: boolean;
}

export interface AssetPlanObject extends BasePlanObject {
  type: "asset";
}

export interface CameraPlanObject extends BasePlanObject {
  type: "camera";
  viewAngle: number;
  viewDistance: number;
  coneColor: string;
  coneOpacity: number;
  showCone: boolean;
}

export interface LightPlanObject extends BasePlanObject {
  type: "light";
  beamAngle: number;
  beamLength: number;
  beamColor: string;
  beamOpacity: number;
  showBeam: boolean;
}

export interface WallPlanObject extends BasePlanObject {
  type: "wall" | "curved-wall" | "door" | "window";
  thickness: number;
  curvature: number;
}

export interface TablePlanObject extends BasePlanObject {
  type: "table";
  tableShape: "round" | "rect";
  keepProportions: boolean;
}

export interface MeasurementPlanObject extends BasePlanObject {
  type: "measurement";
  measurementKind: MeasurementKind;
  label: string;
}

export type PlanObject =
  | AssetPlanObject
  | CameraPlanObject
  | LightPlanObject
  | WallPlanObject
  | TablePlanObject
  | MeasurementPlanObject;

export interface PlanObjectPatch {
  name?: string;
  assetId?: string;
  assetPath?: string;
  assetSvg?: string;
  category?: AssetCategory;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  baseWidth?: number;
  baseHeight?: number;
  rotation?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  notes?: string;
  locked?: boolean;
  visible?: boolean;
  layerId?: string;
  flipX?: boolean;
  flipY?: boolean;
  viewAngle?: number;
  viewDistance?: number;
  coneColor?: string;
  coneOpacity?: number;
  showCone?: boolean;
  beamAngle?: number;
  beamLength?: number;
  beamColor?: string;
  beamOpacity?: number;
  showBeam?: boolean;
  thickness?: number;
  curvature?: number;
  tableShape?: "round" | "rect";
  keepProportions?: boolean;
  measurementKind?: MeasurementKind;
  label?: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface PlanufProject {
  version: number;
  metadata: ProjectMetadata;
  canvas: CanvasSettings;
  layers: LayerDefinition[];
  objects: PlanObject[];
  presets: ObjectPreset[];
}

export interface ViewState extends Point {
  scale: number;
}

export interface GuideLine {
  id: string;
  orientation: "vertical" | "horizontal";
  position: number;
  from: number;
  to: number;
  label?: string;
}

export interface SnapResult {
  point: Point;
  guides: GuideLine[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  canvas: Partial<CanvasSettings>;
  objects: PlanObject[];
}
