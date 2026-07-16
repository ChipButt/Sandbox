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

function snapValue(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function legacyPerformanceArea(room: RoomSettings): RectBounds | null {
  if (room.areaMode === "horizontal") {
    return {
      x: 0,
      y: 0,
      width: room.width,
      height: room.height * room.splitRatio,
    };
  }

  if (room.areaMode === "vertical") {
    return {
      x: 0,
      y: 0,
      width: room.width * room.splitRatio,
      height: room.height,
    };
  }

  return null;
}

export function createDefaultPerformanceArea(room: RoomSettings): RectBounds {
  const width = room.width * 0.48;
  const height = room.height * 0.58;

  return {
    x: (room.width - width) / 2,
    y: (room.height - height) / 2,
    width,
    height,
  };
}

export function normalisePerformanceArea(room: RoomSettings, gridSize: number): RectBounds | null {
  const safeGridSize = Math.max(1, gridSize);
  const source = room.performanceArea === undefined ? legacyPerformanceArea(room) : room.performanceArea;

  if (!source) {
    return null;
  }

  const maxWidth = Math.max(safeGridSize, room.width);
  const maxHeight = Math.max(safeGridSize, room.height);
  const width = clamp(snapValue(source.width, safeGridSize), safeGridSize, maxWidth);
  const height = clamp(snapValue(source.height, safeGridSize), safeGridSize, maxHeight);
  const x = clamp(snapValue(source.x, safeGridSize), 0, Math.max(0, room.width - width));
  const y = clamp(snapValue(source.y, safeGridSize), 0, Math.max(0, room.height - height));

  return { x, y, width, height };
}

export function roomAreaBounds(room: RoomSettings, area: RoomAreaId): RectBounds {
  if (area === "crew") {
    return { x: room.x, y: room.y, width: room.width, height: room.height };
  }

  const performanceArea = room.performanceArea;
  return performanceArea
    ? {
        x: room.x + performanceArea.x,
        y: room.y + performanceArea.y,
        width: performanceArea.width,
        height: performanceArea.height,
      }
    : { x: room.x, y: room.y, width: 0, height: 0 };
}

export function roomWithAreaBounds(room: RoomSettings, area: RoomAreaId, bounds: RectBounds, gridSize: number): RoomSettings {
  const safeGridSize = Math.max(1, gridSize);

  if (area === "crew") {
    return snapRoomToGrid(
      {
        ...room,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      },
      safeGridSize,
    );
  }

  return snapRoomToGrid(
    {
      ...room,
      areaMode: "vertical",
      performanceArea: {
        x: bounds.x - room.x,
        y: bounds.y - room.y,
        width: bounds.width,
        height: bounds.height,
      },
    },
    safeGridSize,
  );
}

export function snapRoomToGrid(room: RoomSettings, gridSize: number): RoomSettings {
  const safeGridSize = Math.max(1, gridSize);
  const snappedRoom = {
    ...room,
    x: snapValue(room.x, safeGridSize),
    y: snapValue(room.y, safeGridSize),
    width: Math.max(safeGridSize, snapValue(room.width, safeGridSize)),
    height: Math.max(safeGridSize, snapValue(room.height, safeGridSize)),
    splitRatio: clamp(room.splitRatio, 0.05, 0.95),
  };
  const performanceArea = normalisePerformanceArea(snappedRoom, safeGridSize);

  return {
    ...snappedRoom,
    areaMode: performanceArea ? (snappedRoom.areaMode === "none" ? "vertical" : snappedRoom.areaMode) : "none",
    performanceArea,
  };
}
