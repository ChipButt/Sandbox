import type { CanvasSettings, MeasurementUnit, RectBounds, RoomAreaId, RoomSettings } from "../types/project";

const FEET_PER_METRE = 3.28084;
const MIN_SCALE_UNITS = 0.001;
const MIN_ROOM_UNITS = 0.1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundForDisplay(value: number): number {
  if (value >= 100) {
    return Math.round(value);
  }

  if (value >= 10) {
    return Number(value.toFixed(1));
  }

  return Number(value.toFixed(2));
}

function formatScaleValue(value: number): string {
  if (value >= 10) {
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }

  if (value >= 1) {
    return value.toFixed(value % 1 === 0 ? 0 : 2).replace(/0+$/u, "").replace(/\.$/u, "");
  }

  return value.toFixed(3).replace(/0+$/u, "").replace(/\.$/u, "");
}

export function unitLabel(unit: MeasurementUnit): "m" | "ft" {
  return unit === "imperial" ? "ft" : "m";
}

export function metresToDisplayUnits(metres: number, unit: MeasurementUnit): number {
  return unit === "imperial" ? metres * FEET_PER_METRE : metres;
}

export function displayUnitsToMetres(value: number, unit: MeasurementUnit): number {
  return unit === "imperial" ? value / FEET_PER_METRE : value;
}

export function pixelsToDisplayUnits(pixels: number, canvas: CanvasSettings): number {
  return metresToDisplayUnits(pixels / canvas.pixelsPerUnit, canvas.unit);
}

export function displayUnitsToPixels(value: number, canvas: CanvasSettings): number {
  return displayUnitsToMetres(value, canvas.unit) * canvas.pixelsPerUnit;
}

export function displayUnitsPerGridSquare(canvas: CanvasSettings): number {
  return pixelsToDisplayUnits(canvas.gridSize, canvas);
}

export function pixelsPerMetreForGridSquare(gridSize: number, displayUnitsPerSquare: number, unit: MeasurementUnit): number {
  const metresPerSquare = Math.max(MIN_SCALE_UNITS, displayUnitsToMetres(displayUnitsPerSquare, unit));
  return gridSize / metresPerSquare;
}

export function scaleLabelForCanvas(canvas: CanvasSettings): string {
  return `1 square = ${formatScaleValue(displayUnitsPerGridSquare(canvas))} ${unitLabel(canvas.unit)}`;
}

export function normalisedRoomDisplaySize(value: number): number {
  return Math.max(MIN_ROOM_UNITS, roundForDisplay(value));
}

export function roomAreaBounds(room: RoomSettings, area: RoomAreaId): RectBounds {
  if (room.areaMode === "horizontal") {
    const performanceHeight = room.height * room.splitRatio;
    return area === "performance"
      ? { x: room.x, y: room.y, width: room.width, height: performanceHeight }
      : { x: room.x, y: room.y + performanceHeight, width: room.width, height: room.height - performanceHeight };
  }

  const performanceWidth = room.width * room.splitRatio;
  return area === "performance"
    ? { x: room.x, y: room.y, width: performanceWidth, height: room.height }
    : { x: room.x + performanceWidth, y: room.y, width: room.width - performanceWidth, height: room.height };
}

export function snapRoomToGrid(room: RoomSettings, gridSize: number): RoomSettings {
  const safeGridSize = Math.max(1, gridSize);

  return {
    ...room,
    x: Math.round(room.x / safeGridSize) * safeGridSize,
    y: Math.round(room.y / safeGridSize) * safeGridSize,
    width: Math.max(safeGridSize, room.width),
    height: Math.max(safeGridSize, room.height),
    splitRatio: clamp(room.splitRatio, 0.05, 0.95),
  };
}
