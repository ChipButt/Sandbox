import { Plus, Trash2 } from "lucide-react";
import { usePlannerStore } from "../../store/plannerStore";
import { PanelSection, buttonClassName } from "../layout/Panel";
import { findAsset } from "../../utils/assets";
import { SvgIconPreview } from "../icons/SvgIconPreview";

export function PresetsPanel() {
  const project = usePlannerStore((state) => state.project);
  const createPresetFromSelection = usePlannerStore((state) => state.createPresetFromSelection);
  const deletePreset = usePlannerStore((state) => state.deletePreset);
  const addObjectFromPreset = usePlannerStore((state) => state.addObjectFromPreset);
  const selectedIds = usePlannerStore((state) => state.selectedIds);

  return (
    <PanelSection
      action={
        <button className={buttonClassName} disabled={selectedIds.length === 0} title="Save selected object as preset" type="button" onClick={createPresetFromSelection}>
          <Plus className="h-3.5 w-3.5" />
          Preset
        </button>
      }
      title="Object Presets"
    >
      {project.presets.length === 0 ? (
        <p className="text-[12px] leading-snug text-ink-500">Select an object and save it as a reusable custom preset.</p>
      ) : (
        <div className="grid gap-2">
          {project.presets.map((preset) => {
            const asset = findAsset(preset.object.assetId);
            return (
              <div className="flex items-center gap-2 rounded border border-black/10 bg-white p-2 shadow-sm" key={preset.id}>
                <button
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  draggable
                  type="button"
                  onClick={() => addObjectFromPreset(preset.id, { x: project.canvas.width / 2, y: project.canvas.height / 2 })}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("application/planuf-preset", preset.id);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                >
                  {asset ? (
                    <SvgIconPreview svg={asset.svg} color={preset.object.stroke} className="h-7 w-7 shrink-0 [&_svg]:h-full [&_svg]:w-full" />
                  ) : (
                    <span className="h-7 w-7 shrink-0 rounded border border-black/15" style={{ background: preset.object.stroke }} />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold text-ink-900">{preset.name}</span>
                    <span className="block truncate text-[11px] text-ink-500">{preset.object.type}</span>
                  </span>
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded text-signal-red hover:bg-red-50" title="Delete preset" type="button" onClick={() => deletePreset(preset.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </PanelSection>
  );
}
