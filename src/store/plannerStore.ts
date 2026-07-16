import { create } from "zustand";
import type {
  AssetDefinition,
  CanvasSettings,
  GuideLine,
  LayerDefinition,
  MeasurementKind,
  PlanObject,
  PlanObjectPatch,
  PlanufProject,
  Point,
  RoomAreaId,
  RoomTemplate,
  ViewState,
} from "../types/project";
import { createId } from "../utils/id";
import {
  cloneObjectForPaste,
  clonePresetObject,
  createBlankProject,
  createDefaultLayers,
  createMeasurementObject,
  createObjectFromAsset,
  defaultCanvasSettings,
  DEFAULT_LAYER_ID,
  touchProject,
} from "../utils/projectFactory";
import {
  createProjectFromRoomTemplate,
  createRoomTemplateFromProject,
  persistRoomTemplates,
  readRoomTemplates,
} from "../utils/roomTemplates";
import { scaleLabelForCanvas, snapRoomToGrid } from "../utils/scale";
import { createProjectFromTemplate } from "../utils/templates";

const MAX_HISTORY = 80;
const PASTE_OFFSET = { x: 28, y: 28 };

interface HistoryState {
  past: PlanufProject[];
  future: PlanufProject[];
}

interface PlannerStore {
  project: PlanufProject;
  selectedIds: string[];
  selectedRoomArea: RoomAreaId | null;
  roomTemplates: RoomTemplate[];
  activeLayerId: string;
  activeTool: "select" | "pan" | MeasurementKind;
  view: ViewState;
  clipboard: PlanObject[];
  guides: GuideLine[];
  status: string;
  lastAutosavedAt: string | null;
  history: HistoryState;
  newProject: (templateId?: string) => void;
  loadProject: (project: PlanufProject) => void;
  setProjectName: (name: string) => void;
  setCanvas: (settings: Partial<CanvasSettings>) => void;
  setActiveTool: (tool: PlannerStore["activeTool"]) => void;
  setView: (view: ViewState) => void;
  resetView: () => void;
  setGuides: (guides: GuideLine[]) => void;
  clearGuides: () => void;
  addObjectFromAsset: (asset: AssetDefinition, point: Point) => string;
  addObjectFromPreset: (presetId: string, point: Point) => void;
  addMeasurement: (kind: MeasurementKind, start: Point, end: Point) => void;
  updateObject: (id: string, patch: PlanObjectPatch) => void;
  updateSelected: (patch: PlanObjectPatch) => void;
  moveObjectsBy: (ids: string[], delta: Point) => void;
  moveObjectTo: (id: string, point: Point) => void;
  selectObject: (id: string, additive: boolean) => void;
  selectRoomArea: (area: RoomAreaId) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  copySelected: () => void;
  pasteClipboard: (point?: Point) => void;
  duplicateSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  flipSelected: (axis: "x" | "y") => void;
  createLayer: () => void;
  renameLayer: (id: string, name: string) => void;
  deleteLayer: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  reorderLayer: (id: string, direction: -1 | 1) => void;
  setActiveLayer: (id: string) => void;
  createPresetFromSelection: () => void;
  deletePreset: (id: string) => void;
  saveCurrentRoomTemplate: (name: string) => void;
  deleteRoomTemplate: (id: string) => void;
  undo: () => void;
  redo: () => void;
  markAutosaved: () => void;
  setStatus: (status: string) => void;
}

function cloneProject(project: PlanufProject): PlanufProject {
  return structuredClone(project);
}

function mergeCanvasSettings(current: CanvasSettings, settings: Partial<CanvasSettings>): CanvasSettings {
  const roomPatch: Partial<CanvasSettings["room"]> = settings.room ?? {};
  const shouldMigrateLegacySplit =
    settings.room !== undefined &&
    !("performanceArea" in roomPatch) &&
    current.room.performanceArea === null &&
    roomPatch.areaMode !== undefined &&
    roomPatch.areaMode !== "none";
  const room = {
    ...current.room,
    ...roomPatch,
    ...(shouldMigrateLegacySplit ? { performanceArea: undefined } : {}),
  } as CanvasSettings["room"];
  const next: CanvasSettings = {
    ...current,
    ...settings,
    room: snapRoomToGrid(room, settings.gridSize ?? current.gridSize),
  };

  return {
    ...next,
    scaleLabel: settings.scaleLabel ?? scaleLabelForCanvas(next),
  };
}

function normaliseProject(project: PlanufProject): PlanufProject {
  const fallback = createBlankProject(project.metadata.name);
  const layers = project.layers.length > 0 ? project.layers : createDefaultLayers();
  const layerIds = new Set(layers.map((layer) => layer.id));
  const canvas = mergeCanvasSettings(defaultCanvasSettings, project.canvas);

  return {
    ...fallback,
    ...project,
    canvas,
    layers,
    objects: project.objects.map((object) => ({
      ...object,
      baseWidth: object.baseWidth || object.width,
      baseHeight: object.baseHeight || object.height,
      opacity: object.opacity ?? 1,
      fill: object.fill || "transparent",
      stroke: object.stroke || "#222222",
      strokeWidth: object.strokeWidth || 2,
      notes: object.notes || "",
      visible: object.visible ?? true,
      locked: object.locked ?? false,
      layerId: layerIds.has(object.layerId) ? object.layerId : DEFAULT_LAYER_ID,
      flipX: object.flipX ?? false,
      flipY: object.flipY ?? false,
    })),
    presets: project.presets ?? [],
    metadata: {
      ...fallback.metadata,
      ...project.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

function withHistory(state: PlannerStore, project: PlanufProject, status?: string): Partial<PlannerStore> {
  return {
    project: touchProject(project),
    history: {
      past: [...state.history.past, cloneProject(state.project)].slice(-MAX_HISTORY),
      future: [],
    },
    status: status ?? state.status,
  };
}

function replaceObjects(project: PlanufProject, objects: PlanObject[]): PlanufProject {
  return {
    ...project,
    objects,
  };
}

function selectedObjects(project: PlanufProject, selectedIds: string[]): PlanObject[] {
  const selected = new Set(selectedIds);
  return project.objects.filter((object) => selected.has(object.id));
}

function selectedUnlockedObjects(project: PlanufProject, selectedIds: string[]): PlanObject[] {
  const selected = new Set(selectedIds);
  const layerMap = new Map(project.layers.map((layer) => [layer.id, layer]));
  return project.objects.filter((object) => {
    const layer = layerMap.get(object.layerId);
    return selected.has(object.id) && !object.locked && !(layer?.locked ?? false);
  });
}

function moveInArray<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (index < 0 || target < 0 || target >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  if (item === undefined) {
    return items;
  }
  next.splice(target, 0, item);
  return next;
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  project: createBlankProject(),
  selectedIds: [],
  selectedRoomArea: null,
  roomTemplates: readRoomTemplates(),
  activeLayerId: DEFAULT_LAYER_ID,
  activeTool: "select",
  view: { x: 48, y: 48, scale: 0.32 },
  clipboard: [],
  guides: [],
  status: "Ready",
  lastAutosavedAt: null,
  history: { past: [], future: [] },

  newProject: (templateId) => {
    const roomTemplate = templateId ? get().roomTemplates.find((template) => template.id === templateId) : undefined;
    const project = normaliseProject(
      roomTemplate ? createProjectFromRoomTemplate(roomTemplate) : templateId ? createProjectFromTemplate(templateId) : createBlankProject(),
    );
    set((state) => ({
      project,
      selectedIds: [],
      selectedRoomArea: null,
      activeLayerId: DEFAULT_LAYER_ID,
      activeTool: "select",
      history: { past: [...state.history.past, cloneProject(state.project)].slice(-MAX_HISTORY), future: [] },
      status: templateId ? `Loaded ${project.metadata.name} template` : "Created new blank set plan",
    }));
  },

  loadProject: (project) => {
    const normalised = normaliseProject(project);
    set({
      project: normalised,
      selectedIds: [],
      selectedRoomArea: null,
      activeLayerId: normalised.layers[0]?.id ?? DEFAULT_LAYER_ID,
      activeTool: "select",
      history: { past: [], future: [] },
      status: `Opened ${normalised.metadata.name}`,
    });
  },

  setProjectName: (name) => {
    set((state) =>
      withHistory(state, {
        ...state.project,
        metadata: { ...state.project.metadata, name: name.trim() || "Untitled Set Plan" },
      }),
    );
  },

  setCanvas: (settings) => {
    set((state) =>
      withHistory(state, {
        ...state.project,
        canvas: mergeCanvasSettings(state.project.canvas, settings),
      }),
    );
  },

  setActiveTool: (tool) => set({ activeTool: tool, status: tool === "select" ? "Selection tool" : `${tool} tool active` }),
  setView: (view) => set({ view }),
  resetView: () => set({ view: { x: 380, y: 120, scale: 0.55 }, status: "View reset" }),
  setGuides: (guides) => set({ guides }),
  clearGuides: () => set({ guides: [] }),

  addObjectFromAsset: (asset, point) => {
    const state = get();
    const activeLayer = state.project.layers.find((layer) => layer.id === state.activeLayerId);
    const layerOverride: PlanObjectPatch = activeLayer && !activeLayer.locked ? { layerId: activeLayer.id } : {};
    const object = createObjectFromAsset(asset, point, layerOverride);

    set((current) =>
      withHistory(
        current,
        replaceObjects(current.project, [...current.project.objects, object]),
        `Added ${asset.name}`,
      ),
    );
    set({ selectedIds: [object.id], selectedRoomArea: null });
    return object.id;
  },

  addObjectFromPreset: (presetId, point) => {
    const state = get();
    const preset = state.project.presets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    const object = clonePresetObject(preset, point);
    set((current) => withHistory(current, replaceObjects(current.project, [...current.project.objects, object]), `Added ${preset.name}`));
    set({ selectedIds: [object.id], selectedRoomArea: null });
  },

  addMeasurement: (kind, start, end) => {
    const object = createMeasurementObject(kind, start, end);
    set((state) => withHistory(state, replaceObjects(state.project, [...state.project.objects, object]), "Added measurement"));
    set({ selectedIds: [object.id], selectedRoomArea: null });
  },

  updateObject: (id, patch) => {
    set((state) => {
      const objects = state.project.objects.map((object) => (object.id === id ? { ...object, ...patch } : object));
      return withHistory(state, replaceObjects(state.project, objects));
    });
  },

  updateSelected: (patch) => {
    set((state) => {
      const unlocked = new Set(selectedUnlockedObjects(state.project, state.selectedIds).map((object) => object.id));
      if (unlocked.size === 0) {
        return { status: "Selection is locked" };
      }
      const objects = state.project.objects.map((object) => (unlocked.has(object.id) ? { ...object, ...patch } : object));
      return withHistory(state, replaceObjects(state.project, objects));
    });
  },

  moveObjectsBy: (ids, delta) => {
    if (ids.length === 0) {
      return;
    }

    set((state) => {
      const moving = new Set(ids);
      const objects = state.project.objects.map((object) =>
        moving.has(object.id) && !object.locked
          ? { ...object, x: object.x + delta.x, y: object.y + delta.y }
          : object,
      );
      return withHistory(state, replaceObjects(state.project, objects));
    });
  },

  moveObjectTo: (id, point) => {
    set((state) => {
      const objects = state.project.objects.map((object) =>
        object.id === id && !object.locked ? { ...object, x: point.x, y: point.y } : object,
      );
      return withHistory(state, replaceObjects(state.project, objects));
    });
  },

  selectObject: (id, additive) => {
    set((state) => {
      const object = state.project.objects.find((item) => item.id === id);
      const layer = state.project.layers.find((item) => item.id === object?.layerId);
      if (!object || !object.visible || layer?.visible === false) {
        return {};
      }

      if (additive) {
        const exists = state.selectedIds.includes(id);
        return {
          selectedIds: exists ? state.selectedIds.filter((selectedId) => selectedId !== id) : [...state.selectedIds, id],
          selectedRoomArea: null,
        };
      }

      return { selectedIds: [id], selectedRoomArea: null };
    });
  },

  selectRoomArea: (area) => {
    set({
      selectedIds: [],
      selectedRoomArea: area,
      status: area === "performance" ? "Selected Performance Area" : "Selected Crew Area",
    });
  },

  setSelection: (ids) => set({ selectedIds: ids, selectedRoomArea: null }),
  clearSelection: () => set({ selectedIds: [], selectedRoomArea: null }),

  deleteSelected: () => {
    set((state) => {
      const selected = new Set(state.selectedIds);
      if (selected.size === 0) {
        return {};
      }
      const objects = state.project.objects.filter((object) => !selected.has(object.id) || object.locked);
      return {
        ...withHistory(state, replaceObjects(state.project, objects), "Deleted selection"),
        selectedIds: [],
        selectedRoomArea: null,
      };
    });
  },

  copySelected: () => {
    const state = get();
    const copied = selectedObjects(state.project, state.selectedIds);
    set({ clipboard: cloneProject({ ...state.project, objects: copied }).objects, status: `Copied ${copied.length} object${copied.length === 1 ? "" : "s"}` });
  },

  pasteClipboard: (point) => {
    const state = get();
    if (state.clipboard.length === 0) {
      set({ status: "Clipboard is empty" });
      return;
    }

    const minX = Math.min(...state.clipboard.map((object) => object.x));
    const minY = Math.min(...state.clipboard.map((object) => object.y));
    const offset = point ? { x: point.x - minX, y: point.y - minY } : PASTE_OFFSET;
    const pasted = state.clipboard.map((object) => cloneObjectForPaste(object, offset));

    set((current) => ({
      ...withHistory(current, replaceObjects(current.project, [...current.project.objects, ...pasted]), `Pasted ${pasted.length} object${pasted.length === 1 ? "" : "s"}`),
      selectedIds: pasted.map((object) => object.id),
      selectedRoomArea: null,
    }));
  },

  duplicateSelected: () => {
    const state = get();
    const selected = selectedUnlockedObjects(state.project, state.selectedIds);
    const duplicated = selected.map((object) => cloneObjectForPaste(object, PASTE_OFFSET));
    if (duplicated.length === 0) {
      set({ status: "Selection is locked" });
      return;
    }

    set((current) => ({
      ...withHistory(current, replaceObjects(current.project, [...current.project.objects, ...duplicated]), "Duplicated selection"),
      selectedIds: duplicated.map((object) => object.id),
      selectedRoomArea: null,
    }));
  },

  bringForward: () => {
    set((state) => {
      const selected = new Set(state.selectedIds);
      let objects = [...state.project.objects];
      for (let index = objects.length - 2; index >= 0; index -= 1) {
        if (selected.has(objects[index]?.id ?? "")) {
          objects = moveInArray(objects, index, 1);
        }
      }
      return withHistory(state, replaceObjects(state.project, objects), "Brought selection forward");
    });
  },

  sendBackward: () => {
    set((state) => {
      const selected = new Set(state.selectedIds);
      let objects = [...state.project.objects];
      for (let index = 1; index < objects.length; index += 1) {
        if (selected.has(objects[index]?.id ?? "")) {
          objects = moveInArray(objects, index, -1);
        }
      }
      return withHistory(state, replaceObjects(state.project, objects), "Sent selection backward");
    });
  },

  flipSelected: (axis) => {
    set((state) => {
      const selected = new Set(state.selectedIds);
      const objects = state.project.objects.map((object) => {
        if (!selected.has(object.id) || object.locked) {
          return object;
        }
        return axis === "x"
          ? { ...object, flipX: !object.flipX }
          : { ...object, flipY: !object.flipY };
      });
      return withHistory(state, replaceObjects(state.project, objects), axis === "x" ? "Flipped horizontally" : "Flipped vertically");
    });
  },

  createLayer: () => {
    const layer: LayerDefinition = { id: createId("layer"), name: "New Layer", locked: false, visible: true };
    set((state) => ({
      ...withHistory(state, { ...state.project, layers: [...state.project.layers, layer] }, "Created layer"),
      activeLayerId: layer.id,
    }));
  },

  renameLayer: (id, name) => {
    set((state) =>
      withHistory(state, {
        ...state.project,
        layers: state.project.layers.map((layer) => (layer.id === id ? { ...layer, name: name.trim() || layer.name } : layer)),
      }),
    );
  },

  deleteLayer: (id) => {
    set((state) => {
      if (state.project.layers.length <= 1) {
        return { status: "At least one layer is required" };
      }
      const remainingLayers = state.project.layers.filter((layer) => layer.id !== id);
      const fallbackLayerId = remainingLayers[0]?.id ?? DEFAULT_LAYER_ID;
      const objects = state.project.objects.map((object) =>
        object.layerId === id ? { ...object, layerId: fallbackLayerId } : object,
      );
      return {
        ...withHistory(state, { ...state.project, layers: remainingLayers, objects }, "Deleted layer"),
        activeLayerId: state.activeLayerId === id ? fallbackLayerId : state.activeLayerId,
      };
    });
  },

  toggleLayerLock: (id) => {
    set((state) =>
      withHistory(state, {
        ...state.project,
        layers: state.project.layers.map((layer) => (layer.id === id ? { ...layer, locked: !layer.locked } : layer)),
      }),
    );
  },

  toggleLayerVisibility: (id) => {
    set((state) =>
      withHistory(state, {
        ...state.project,
        layers: state.project.layers.map((layer) => (layer.id === id ? { ...layer, visible: !layer.visible } : layer)),
      }),
    );
  },

  reorderLayer: (id, direction) => {
    set((state) => {
      const index = state.project.layers.findIndex((layer) => layer.id === id);
      return withHistory(state, { ...state.project, layers: moveInArray(state.project.layers, index, direction) }, "Reordered layer");
    });
  },

  setActiveLayer: (id) => set({ activeLayerId: id }),

  createPresetFromSelection: () => {
    const state = get();
    const object = selectedObjects(state.project, state.selectedIds)[0];
    if (!object) {
      set({ status: "Select an object to save a preset" });
      return;
    }

    const preset = {
      id: createId("preset"),
      name: object.name,
      createdAt: new Date().toISOString(),
      object: { ...structuredClone(object), x: 0, y: 0, locked: false },
    };

    set((current) =>
      withHistory(
        current,
        {
          ...current.project,
          presets: [...current.project.presets, preset],
        },
        `Saved ${object.name} preset`,
      ),
    );
  },

  deletePreset: (id) => {
    set((state) =>
      withHistory(
        state,
        {
          ...state.project,
          presets: state.project.presets.filter((preset) => preset.id !== id),
        },
        "Deleted preset",
      ),
    );
  },

  saveCurrentRoomTemplate: (name) => {
    const state = get();
    const template = createRoomTemplateFromProject(state.project, name);
    const templates = [template, ...state.roomTemplates];
    persistRoomTemplates(templates);
    set({
      roomTemplates: templates,
      status: `Saved ${template.name} room template`,
    });
  },

  deleteRoomTemplate: (id) => {
    const state = get();
    const template = state.roomTemplates.find((item) => item.id === id);
    const templates = state.roomTemplates.filter((item) => item.id !== id);
    persistRoomTemplates(templates);
    set({
      roomTemplates: templates,
      status: template ? `Deleted ${template.name} room template` : "Deleted room template",
    });
  },

  undo: () => {
    set((state) => {
      const previous = state.history.past.at(-1);
      if (!previous) {
        return { status: "Nothing to undo" };
      }
      return {
        project: previous,
        history: {
          past: state.history.past.slice(0, -1),
          future: [cloneProject(state.project), ...state.history.future].slice(0, MAX_HISTORY),
        },
        selectedIds: state.selectedIds.filter((id) => previous.objects.some((object) => object.id === id)),
        selectedRoomArea: null,
        status: "Undo",
      };
    });
  },

  redo: () => {
    set((state) => {
      const next = state.history.future[0];
      if (!next) {
        return { status: "Nothing to redo" };
      }
      return {
        project: next,
        history: {
          past: [...state.history.past, cloneProject(state.project)].slice(-MAX_HISTORY),
          future: state.history.future.slice(1),
        },
        selectedIds: state.selectedIds.filter((id) => next.objects.some((object) => object.id === id)),
        selectedRoomArea: null,
        status: "Redo",
      };
    });
  },

  markAutosaved: () => set({ lastAutosavedAt: new Date().toISOString(), status: "Autosaved locally" }),
  setStatus: (status) => set({ status }),
}));
