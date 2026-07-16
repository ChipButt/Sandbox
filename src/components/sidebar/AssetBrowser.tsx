import { useMemo, useState } from "react";
import { MousePointer2, Ruler, Save, Search, Trash2 } from "lucide-react";
import type { ActiveTool, AssetCategory } from "../../types/project";
import { ASSET_CATEGORIES, ASSETS } from "../../utils/assets";
import { TEMPLATE_SUMMARIES } from "../../utils/templates";
import { usePlannerStore } from "../../store/plannerStore";
import { PanelSection, buttonClassName, inputClassName } from "../layout/Panel";
import { SvgIconPreview } from "../icons/SvgIconPreview";
import { clamp, screenToWorld } from "../../utils/geometry";

const MEASUREMENT_TOOLS: Array<{ id: ActiveTool; label: string }> = [
  { id: "ruler", label: "Ruler" },
  { id: "distance", label: "Distance" },
  { id: "dimension", label: "Dimension Line" },
  { id: "room", label: "Room Dimensions" },
];

export function AssetBrowser() {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("cameras");
  const [search, setSearch] = useState("");
  const activeTool = usePlannerStore((state) => state.activeTool);
  const setActiveTool = usePlannerStore((state) => state.setActiveTool);
  const newProject = usePlannerStore((state) => state.newProject);
  const roomTemplates = usePlannerStore((state) => state.roomTemplates);
  const saveCurrentRoomTemplate = usePlannerStore((state) => state.saveCurrentRoomTemplate);
  const deleteRoomTemplate = usePlannerStore((state) => state.deleteRoomTemplate);
  const addObjectFromAsset = usePlannerStore((state) => state.addObjectFromAsset);
  const projectName = usePlannerStore((state) => state.project.metadata.name);
  const canvas = usePlannerStore((state) => state.project.canvas);
  const view = usePlannerStore((state) => state.view);

  const filteredAssets = useMemo(() => {
    const normalised = search.trim().toLowerCase();
    return ASSETS.filter((asset) => {
      const categoryMatch = asset.category === activeCategory;
      const searchMatch =
        normalised.length === 0 ||
        asset.name.toLowerCase().includes(normalised) ||
        asset.categoryLabel.toLowerCase().includes(normalised);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  const addAtViewportCentre = (assetId: string): void => {
    const asset = ASSETS.find((item) => item.id === assetId);
    if (!asset) {
      return;
    }
    const world = screenToWorld({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, view);
    addObjectFromAsset(asset, {
      x: clamp(world.x, 0, canvas.width),
      y: clamp(world.y, 0, canvas.height),
    });
  };
  const saveTemplate = (): void => {
    const name = window.prompt("Room template name", projectName);
    if (name === null) {
      return;
    }
    saveCurrentRoomTemplate(name);
  };

  return (
    <div className="thin-scrollbar h-full overflow-y-auto">
      <PanelSection title="Asset Browser">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1.5 h-4 w-4 text-ink-500" />
          <input
            className={`${inputClassName} pl-8`}
            placeholder="Search assets"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1">
          {ASSET_CATEGORIES.map((category) => (
            <button
              className={`${buttonClassName} justify-start ${activeCategory === category.id ? "border-signal-blue bg-blue-50 text-signal-blue" : ""}`}
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </PanelSection>

      <div className="grid grid-cols-2 gap-2 p-3">
        {filteredAssets.map((asset) => (
          <button
            className="group flex min-h-[94px] flex-col items-center justify-center gap-2 rounded border border-black/10 bg-white p-2 text-center shadow-sm transition hover:border-signal-blue hover:bg-blue-50"
            draggable
            key={asset.id}
            title={`Drag or tap ${asset.name} to add it to the canvas`}
            type="button"
            onClick={() => addAtViewportCentre(asset.id)}
            onDragStart={(event) => {
              event.dataTransfer.setData("application/planuf-asset", asset.id);
              event.dataTransfer.effectAllowed = "copy";
            }}
          >
            <SvgIconPreview svg={asset.svg} color={asset.defaultColor} className="h-9 w-9 [&_svg]:h-full [&_svg]:w-full" />
            <span className="line-clamp-2 text-[11px] leading-tight text-ink-800">{asset.name}</span>
          </button>
        ))}
      </div>

      <PanelSection title="Measurement Tools">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`${buttonClassName} ${activeTool === "select" ? "border-signal-blue bg-blue-50 text-signal-blue" : ""}`}
            type="button"
            onClick={() => setActiveTool("select")}
          >
            <MousePointer2 className="h-3.5 w-3.5" />
            Select
          </button>
          {MEASUREMENT_TOOLS.map((tool) => (
            <button
              className={`${buttonClassName} ${activeTool === tool.id ? "border-signal-blue bg-blue-50 text-signal-blue" : ""}`}
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
            >
              <Ruler className="h-3.5 w-3.5" />
              {tool.label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Templates">
        <div className="grid gap-2">
          <button className={`${buttonClassName} justify-start`} type="button" onClick={saveTemplate}>
            <Save className="h-3.5 w-3.5" />
            Save Current Room Template
          </button>
          {roomTemplates.length > 0 ? (
            <div className="grid gap-2 border-b border-black/10 pb-2">
              {roomTemplates.map((template) => (
                <div className="rounded border border-black/10 bg-white p-2 shadow-sm" key={template.id}>
                  <button
                    className="block w-full text-left"
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Create a new project from "${template.name}"? Unsaved changes stay in autosave until cleared.`)) {
                        newProject(template.id);
                      }
                    }}
                  >
                    <span className="block truncate text-[12px] font-semibold text-ink-900">{template.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-ink-500">{template.description}</span>
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-ink-500">
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                    <button
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-signal-red hover:bg-red-50"
                      title={`Delete ${template.name}`}
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${template.name}" room template?`)) {
                          deleteRoomTemplate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {TEMPLATE_SUMMARIES.map((template) => (
            <button
              className="rounded border border-black/10 bg-white p-2 text-left shadow-sm transition hover:border-signal-blue hover:bg-blue-50"
              key={template.id}
              type="button"
              onClick={() => {
                if (window.confirm(`Create a new project from "${template.name}"? Unsaved changes stay in autosave until cleared.`)) {
                  newProject(template.id);
                }
              }}
            >
              <span className="block text-[12px] font-semibold text-ink-900">{template.name}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">{template.description}</span>
            </button>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}
