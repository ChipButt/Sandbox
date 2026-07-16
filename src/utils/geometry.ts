import type { CanvasSettings, GuideLine, PlanObject, Point, RectBounds, Size, SnapResult, ViewState } from "../types/project";
import { pixelsToDisplayUnits, unitLabel } from "./scale";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeRect(rect: RectBounds): RectBounds {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;

  return {
    x,
    y,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  };
}

export function objectBounds(object: PlanObject): RectBounds {
  return normalizeRect({
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
  });
}

export function rectsIntersect(first: RectBounds, second: RectBounds): boolean {
  const a = normalizeRect(first);
  const b = normalizeRect(second);

  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function screenToWorld(point: Point, view: ViewState): Point {
  return {
    x: (point.x - view.x) / view.scale,
    y: (point.y - view.y) / view.scale,
  };
}

export function workspaceBounds(canvas: CanvasSettings): RectBounds {
  if (canvas.room.visible) {
    return {
      x: canvas.room.x,
      y: canvas.room.y,
      width: canvas.room.width,
      height: canvas.room.height,
    };
  }

  return {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  };
}

export function fitRectView(rect: RectBounds, viewport: Size, margin = 48): ViewState {
  const availableWidth = Math.max(120, viewport.width - margin * 2);
  const availableHeight = Math.max(120, viewport.height - margin * 2);
  const scale = clamp(Math.min(availableWidth / rect.width, availableHeight / rect.height), 0.08, 0.9);

  return {
    x: (viewport.width - rect.width * scale) / 2 - rect.x * scale,
    y: (viewport.height - rect.height * scale) / 2 - rect.y * scale,
    scale,
  };
}

export function fitCanvasView(canvas: CanvasSettings, viewport: Size, margin = 48): ViewState {
  return fitRectView(workspaceBounds(canvas), viewport, margin);
}

export function worldToScreen(point: Point, view: ViewState): Point {
  return {
    x: point.x * view.scale + view.x,
    y: point.y * view.scale + view.y,
  };
}

export function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function formatMeasurement(pixels: number, settings: CanvasSettings): string {
  const units = pixelsToDisplayUnits(pixels, settings);

  if (settings.unit === "imperial") {
    const wholeFeet = Math.floor(units);
    const inches = Math.round((units - wholeFeet) * 12);
    return inches === 12 ? `${wholeFeet + 1}' 0"` : `${wholeFeet}' ${inches}"`;
  }

  return units >= 10 ? `${units.toFixed(1)} ${unitLabel(settings.unit)}` : `${units.toFixed(2)} ${unitLabel(settings.unit)}`;
}

function addGuide(guides: GuideLine[], guide: GuideLine): void {
  if (!guides.some((existing) => existing.id === guide.id)) {
    guides.push(guide);
  }
}

function snapScalar(value: number, target: number, threshold: number): number | null {
  return Math.abs(value - target) <= threshold ? target : null;
}

function wallEndpoints(object: PlanObject): Point[] {
  if (object.type !== "wall" && object.type !== "curved-wall") {
    return [];
  }

  return [
    { x: object.x, y: object.y + object.height / 2 },
    { x: object.x + object.width, y: object.y + object.height / 2 },
  ];
}

export function computeSnap(
  moving: PlanObject,
  proposedPoint: Point,
  objects: PlanObject[],
  canvas: CanvasSettings,
  threshold: number,
): SnapResult {
  let x = proposedPoint.x;
  let y = proposedPoint.y;
  const guides: GuideLine[] = [];

  if (canvas.snapEnabled) {
    x = Math.round(x / canvas.gridSize) * canvas.gridSize;
    y = Math.round(y / canvas.gridSize) * canvas.gridSize;
  }

  const movingBounds = {
    x,
    y,
    width: moving.width,
    height: moving.height,
  };
  const movingCenters = {
    x: movingBounds.x + movingBounds.width / 2,
    y: movingBounds.y + movingBounds.height / 2,
  };

  if (canvas.snapToCenters) {
    const workspace = workspaceBounds(canvas);
    const centreX = workspace.x + workspace.width / 2;
    const centreY = workspace.y + workspace.height / 2;
    const snappedX = snapScalar(movingCenters.x, centreX, threshold);
    const snappedY = snapScalar(movingCenters.y, centreY, threshold);

    if (snappedX !== null) {
      x += snappedX - movingCenters.x;
      addGuide(guides, {
        id: "canvas-centre-x",
        orientation: "vertical",
        position: centreX,
        from: workspace.y,
        to: workspace.y + workspace.height,
        label: "Room centre",
      });
    }

    if (snappedY !== null) {
      y += snappedY - movingCenters.y;
      addGuide(guides, {
        id: "canvas-centre-y",
        orientation: "horizontal",
        position: centreY,
        from: workspace.x,
        to: workspace.x + workspace.width,
        label: "Room centre",
      });
    }
  }

  if (!canvas.snapToObjects) {
    return { point: { x, y }, guides };
  }

  const candidateX = [x, x + moving.width / 2, x + moving.width];
  const candidateY = [y, y + moving.height / 2, y + moving.height];

  for (const object of objects) {
    if (object.id === moving.id || !object.visible) {
      continue;
    }

    const bounds = objectBounds(object);
    const targetX = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
    const targetY = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];

    for (const source of candidateX) {
      const target = targetX.find((value) => Math.abs(value - source) <= threshold);
      if (target !== undefined) {
        x += target - source;
        addGuide(guides, {
          id: `snap-x-${object.id}-${target}`,
          orientation: "vertical",
          position: target,
          from: Math.min(y, bounds.y) - 60,
          to: Math.max(y + moving.height, bounds.y + bounds.height) + 60,
        });
        break;
      }
    }

    for (const source of candidateY) {
      const target = targetY.find((value) => Math.abs(value - source) <= threshold);
      if (target !== undefined) {
        y += target - source;
        addGuide(guides, {
          id: `snap-y-${object.id}-${target}`,
          orientation: "horizontal",
          position: target,
          from: Math.min(x, bounds.x) - 60,
          to: Math.max(x + moving.width, bounds.x + bounds.width) + 60,
        });
        break;
      }
    }

    const movingEndpoints = wallEndpoints({ ...moving, x, y });
    const targetEndpoints = wallEndpoints(object);
    for (const endpoint of movingEndpoints) {
      const target = targetEndpoints.find((targetPoint) => distance(endpoint, targetPoint) <= threshold);
      if (target) {
        x += target.x - endpoint.x;
        y += target.y - endpoint.y;
        addGuide(guides, {
          id: `wall-joint-${object.id}`,
          orientation: "horizontal",
          position: target.y,
          from: target.x - 30,
          to: target.x + 30,
          label: "Wall joint",
        });
      }
    }
  }

  return { point: { x, y }, guides };
}

export function rotatePoint(point: Point, centre: Point, angleDegrees: number): Point {
  const angle = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - centre.x;
  const dy = point.y - centre.y;

  return {
    x: centre.x + dx * cos - dy * sin,
    y: centre.y + dx * sin + dy * cos,
  };
}
