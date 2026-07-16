import { usePlannerStore } from "../../store/plannerStore";

export function StatusBar() {
  const project = usePlannerStore((state) => state.project);
  const selectedIds = usePlannerStore((state) => state.selectedIds);
  const view = usePlannerStore((state) => state.view);
  const status = usePlannerStore((state) => state.status);
  const lastAutosavedAt = usePlannerStore((state) => state.lastAutosavedAt);

  return (
    <div className="flex h-full items-center justify-between gap-4 px-3 text-[12px] text-ink-700">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate font-medium text-ink-900">{status}</span>
        <span>{selectedIds.length} selected</span>
        <span>{project.objects.length} objects</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span>{Math.round(view.scale * 100)}%</span>
        <span>{project.canvas.unit === "metric" ? "Metric" : "Imperial"}</span>
        <span>{project.canvas.scaleLabel}</span>
        <span>{lastAutosavedAt ? `Autosaved ${new Date(lastAutosavedAt).toLocaleTimeString()}` : "Autosave ready"}</span>
      </div>
    </div>
  );
}
