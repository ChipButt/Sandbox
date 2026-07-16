import { useMemo, useState } from "react";
import { MousePointer2, Ruler, Search } from "lucide-react";
import type { ActiveTool, AssetCategory } from "../../types/project";
import { ASSET_CATEGORIES, ASSETS } from "../../utils/assets";
import { TEMPLATE_SUMMARIES } from "../../utils/templates";
import { usePlannerStore } from "../../store/plannerStore";
import { PanelSection, buttonClassName, inputClassName } from "../layout/Panel";
import { SvgIconPreview } from "../icons/SvgIconPreview";

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
  const addObjectFromAsset = usePlannerStore((state) => state.addObjectFromAsset);
  const canvas = usePlannerStore((state) => state.project.canvas);

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

  return (
    <div className="flex h-full flex-col">
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

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 p-3">
          {filteredAssets.map((asset) => (
            <button
              className="group flex min-h-[94px] flex-col items-center justify-center gap-2 rounded border border-black/10 bg-white p-2 text-center shadow-sm transition hover:border-signal-blue hover:bg-blue-50"
              draggable
              key={asset.id}
              title={`Drag ${asset.name} to the canvas`}
              type="button"
              onDoubleClick={() => addObjectFromAsset(asset, { x: canvas.width / 2, y: canvas.height / 2 })}
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
