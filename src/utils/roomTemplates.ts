import type { LayerDefinition, PlanObject, PlanufProject, RoomTemplate } from "../types/project";
import { createId } from "./id";
import { createBlankProject } from "./projectFactory";

export const ROOM_TEMPLATES_KEY = "planuf-set-planner-room-templates";

interface StoredRoomTemplateCollection {
  version: 1;
  templates: RoomTemplate[];
}

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLayer(value: unknown): value is LayerDefinition {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.locked === "boolean" &&
    typeof value.visible === "boolean"
  );
}

function isPlanObject(value: unknown): value is PlanObject {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    typeof value.name === "string" &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number" &&
    typeof value.layerId === "string"
  );
}

function isRoomTemplate(value: unknown): value is RoomTemplate {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    isRecord(value.canvas) &&
    Array.isArray(value.layers) &&
    value.layers.every(isLayer) &&
    Array.isArray(value.objects) &&
    value.objects.every(isPlanObject)
  );
}

function readStoredCollection(): StoredRoomTemplateCollection {
  if (!hasLocalStorage()) {
    return { version: 1, templates: [] };
  }

  const raw = window.localStorage.getItem(ROOM_TEMPLATES_KEY);
  if (!raw) {
    return { version: 1, templates: [] };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.templates)) {
      return { version: 1, templates: [] };
    }

    return {
      version: 1,
      templates: parsed.templates.filter(isRoomTemplate),
    };
  } catch {
    window.localStorage.removeItem(ROOM_TEMPLATES_KEY);
    return { version: 1, templates: [] };
  }
}

function writeStoredCollection(collection: StoredRoomTemplateCollection): void {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(ROOM_TEMPLATES_KEY, JSON.stringify(collection));
}

export function readRoomTemplates(): RoomTemplate[] {
  return readStoredCollection().templates;
}

export function persistRoomTemplates(templates: RoomTemplate[]): void {
  writeStoredCollection({
    version: 1,
    templates,
  });
}

export function createRoomTemplateFromProject(project: PlanufProject, name: string): RoomTemplate {
  const now = new Date().toISOString();
  const templateName = name.trim() || project.metadata.name || "Untitled Room Template";

  return {
    id: createId("room_template"),
    name: templateName,
    description: `${project.objects.length} object${project.objects.length === 1 ? "" : "s"} saved from ${project.metadata.name}`,
    createdAt: now,
    updatedAt: now,
    canvas: structuredClone(project.canvas),
    layers: structuredClone(project.layers),
    objects: structuredClone(project.objects),
  };
}

export function createProjectFromRoomTemplate(template: RoomTemplate): PlanufProject {
  const project = createBlankProject(template.name);

  return {
    ...project,
    canvas: structuredClone(template.canvas),
    layers: structuredClone(template.layers),
    objects: structuredClone(template.objects),
  };
}
