import { Eye, EyeOff, Lock, Plus, Trash2, Unlock, ArrowUp, ArrowDown } from "lucide-react";
import { usePlannerStore } from "../../store/plannerStore";
import { buttonClassName, inputClassName, PanelSection } from "../layout/Panel";

export function LayersPanel() {
  const layers = usePlannerStore((state) => state.project.layers);
  const objects = usePlannerStore((state) => state.project.objects);
  const activeLayerId = usePlannerStore((state) => state.activeLayerId);
  const createLayer = usePlannerStore((state) => state.createLayer);
  const renameLayer = usePlannerStore((state) => state.renameLayer);
  const deleteLayer = usePlannerStore((state) => state.deleteLayer);
  const toggleLayerLock = usePlannerStore((state) => state.toggleLayerLock);
  const toggleLayerVisibility = usePlannerStore((state) => state.toggleLayerVisibility);
  const reorderLayer = usePlannerStore((state) => state.reorderLayer);
  const setActiveLayer = usePlannerStore((state) => state.setActiveLayer);

  return (
    <PanelSection
      action={
        <button className={buttonClassName} title="Create layer" type="button" onClick={createLayer}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      }
      title="Layers"
    >
      <div className="grid gap-2">
        {layers.map((layer, index) => {
          const objectCount = objects.filter((object) => object.layerId === layer.id).length;
          const isActive = activeLayerId === layer.id;

          return (
            <div
              className={`rounded border p-2 shadow-sm ${isActive ? "border-signal-blue bg-blue-50" : "border-black/10 bg-white"}`}
              key={layer.id}
            >
              <div className="flex items-center gap-1">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-black/5"
                  title={layer.visible ? "Hide layer" : "Show layer"}
                  type="button"
                  onClick={() => toggleLayerVisibility(layer.id)}
                >
                  {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-black/5"
                  title={layer.locked ? "Unlock layer" : "Lock layer"}
                  type="button"
                  onClick={() => toggleLayerLock(layer.id)}
                >
                  {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </button>
                <input
                  className={`${inputClassName} flex-1`}
                  value={layer.name}
                  onChange={(event) => renameLayer(layer.id, event.target.value)}
                  onFocus={() => setActiveLayer(layer.id)}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
                <button className="font-medium text-ink-800 hover:text-signal-blue" type="button" onClick={() => setActiveLayer(layer.id)}>
                  {objectCount} object{objectCount === 1 ? "" : "s"}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 disabled:opacity-30"
                    disabled={index === 0}
                    title="Move layer up"
                    type="button"
                    onClick={() => reorderLayer(layer.id, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 disabled:opacity-30"
                    disabled={index === layers.length - 1}
                    title="Move layer down"
                    type="button"
                    onClick={() => reorderLayer(layer.id, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded text-signal-red hover:bg-red-50 disabled:opacity-30"
                    disabled={layers.length <= 1}
                    title="Delete layer"
                    type="button"
                    onClick={() => deleteLayer(layer.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PanelSection>
  );
}
