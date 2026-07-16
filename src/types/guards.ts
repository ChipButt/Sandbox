import type { PlanObject, PlanufProject } from "./project";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPlanObject(value: unknown): value is PlanObject {
  if (!isRecord(value)) {
    return false;
  }

  const type = value.type;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof type === "string" &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number"
  );
}

export function isPlanufProject(value: unknown): value is PlanufProject {
  if (!isRecord(value)) {
    return false;
  }

  const metadata = value.metadata;
  const canvas = value.canvas;

  return (
    typeof value.version === "number" &&
    isRecord(metadata) &&
    typeof metadata.name === "string" &&
    isRecord(canvas) &&
    typeof canvas.width === "number" &&
    Array.isArray(value.layers) &&
    Array.isArray(value.objects) &&
    value.objects.every(isPlanObject)
  );
}
