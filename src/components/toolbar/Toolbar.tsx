import {
  Download,
  FileDown,
  FileInput,
  FilePlus2,
  Grid3X3,
  ImageDown,
  Minus,
  MousePointer2,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  SaveAll,
  Undo2,
  Magnet,
} from "lucide-react";
import type Konva from "konva";
import type { MutableRefObject } from "react";
import type { ReactNode } from "react";
import { usePlannerStore } from "../../store/plannerStore";
import { clamp } from "../../utils/geometry";
import { exportProjectSvg, exportStageToPdf, exportStageToPng } from "../../utils/exporters";

interface ToolbarProps {
  stageRef: MutableRefObject<Konva.Stage | null>;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
}

function ToolbarButton({
  label,
  title,
  onClick,
  children,
  active,
}: {
  label: string;
  title?: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`inline-flex h-8 items-center gap-1.5 rounded border px-2 text-[12px] font-medium shadow-sm transition ${
        active ? "border-signal-blue bg-blue-50 text-signal-blue" : "border-black/15 bg-white text-ink-800 hover:bg-ink-100"
      }`}
      title={title ?? label}
      type="button"
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function Separator() {
  return <span className="h-7 w-px bg-black/10" />;
}

export function Toolbar({ stageRef, onOpen, onSave, onSaveAs }: ToolbarProps) {
  const project = usePlannerStore((state) => state.project);
  const view = usePlannerStore((state) => state.view);
  const setView = usePlannerStore((state) => state.setView);
  const resetView = usePlannerStore((state) => state.resetView);
  const setCanvas = usePlannerStore((state) => state.setCanvas);
  const newProject = usePlannerStore((state) => state.newProject);
  const undo = usePlannerStore((state) => state.undo);
  const redo = usePlannerStore((state) => state.redo);
  const setActiveTool = usePlannerStore((state) => state.setActiveTool);
  const activeTool = usePlannerStore((state) => state.activeTool);
  const setStatus = usePlannerStore((state) => state.setStatus);

  const zoom = (factor: number): void => {
    const stage = stageRef.current;
    const centre = {
      x: (stage?.width() ?? 1200) / 2,
      y: (stage?.height() ?? 800) / 2,
    };
    const oldScale = view.scale;
    const newScale = clamp(view.scale * factor, 0.08, 4);
    const world = {
      x: (centre.x - view.x) / oldScale,
      y: (centre.y - view.y) / oldScale,
    };
    setView({
      x: centre.x - world.x * newScale,
      y: centre.y - world.y * newScale,
      scale: newScale,
    });
  };

  const exportPng = (variant: "standard" | "transparent" | "4k" | "8k"): void => {
    const stage = stageRef.current;
    if (!stage) {
      setStatus("Canvas is not ready yet");
      return;
    }

    const ratio =
      variant === "4k"
        ? Math.max(1, 3840 / stage.width())
        : variant === "8k"
          ? Math.max(1, 7680 / stage.width())
          : 2;
    exportStageToPng(stage, {
      transparent: variant === "transparent",
      pixelRatio: ratio,
      fileName: `${project.metadata.name.replace(/\s+/gu, "-").toLowerCase()}-${variant}.png`,
    });
    setStatus(`Exported ${variant} PNG`);
  };

  const exportPdf = async (size: "a4" | "a3"): Promise<void> => {
    const stage = stageRef.current;
    if (!stage) {
      setStatus("Canvas is not ready yet");
      return;
    }
    await exportStageToPdf(stage, project, size);
    setStatus(`Exported ${size.toUpperCase()} landscape PDF`);
  };

  return (
    <div className="flex h-full min-w-0 items-center gap-2 overflow-x-auto px-2">
      <div className="flex items-center gap-1">
        <ToolbarButton label="New" title="New (Ctrl+N)" onClick={() => newProject("blank-studio")}>
          <FilePlus2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Open" title="Open (Ctrl+O)" onClick={onOpen}>
          <FileInput className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Save" title="Save (Ctrl+S)" onClick={onSave}>
          <Save className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Save As" title="Save As (Ctrl+Shift+S)" onClick={onSaveAs}>
          <SaveAll className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator />

      <div className="flex items-center gap-1">
        <div className="group relative">
          <ToolbarButton label="Export PNG" onClick={() => exportPng("standard")}>
            <ImageDown className="h-4 w-4" />
          </ToolbarButton>
          <div className="invisible absolute left-0 top-9 z-20 grid w-44 gap-1 rounded border border-black/15 bg-white p-1 shadow-panel group-hover:visible">
            <button className="rounded px-2 py-1.5 text-left text-[12px] hover:bg-ink-100" type="button" onClick={() => exportPng("standard")}>
              Standard PNG
            </button>
            <button className="rounded px-2 py-1.5 text-left text-[12px] hover:bg-ink-100" type="button" onClick={() => exportPng("transparent")}>
              Transparent PNG
            </button>
            <button className="rounded px-2 py-1.5 text-left text-[12px] hover:bg-ink-100" type="button" onClick={() => exportPng("4k")}>
              4K PNG
            </button>
            <button className="rounded px-2 py-1.5 text-left text-[12px] hover:bg-ink-100" type="button" onClick={() => exportPng("8k")}>
              8K PNG
            </button>
          </div>
        </div>
        <ToolbarButton label="Export SVG" onClick={() => exportProjectSvg(project)}>
          <Download className="h-4 w-4" />
        </ToolbarButton>
        <div className="group relative">
          <ToolbarButton label="Export PDF" onClick={() => void exportPdf("a4")}>
            <FileDown className="h-4 w-4" />
          </ToolbarButton>
          <div className="invisible absolute left-0 top-9 z-20 grid w-44 gap-1 rounded border border-black/15 bg-white p-1 shadow-panel group-hover:visible">
            <button className="rounded px-2 py-1.5 text-left text-[12px] hover:bg-ink-100" type="button" onClick={() => void exportPdf("a4")}>
              A4 Landscape
            </button>
            <button className="rounded px-2 py-1.5 text-left text-[12px] hover:bg-ink-100" type="button" onClick={() => void exportPdf("a3")}>
              A3 Landscape
            </button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-1">
        <ToolbarButton label="Undo" title="Undo (Ctrl+Z)" onClick={undo}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" title="Redo (Ctrl+Y)" onClick={redo}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator />

      <div className="flex items-center gap-1">
        <ToolbarButton active={project.canvas.gridVisible} label="Grid" title="Toggle Grid (G)" onClick={() => setCanvas({ gridVisible: !project.canvas.gridVisible })}>
          <Grid3X3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={project.canvas.snapEnabled} label="Snap" title="Toggle Snap (S)" onClick={() => setCanvas({ snapEnabled: !project.canvas.snapEnabled })}>
          <Magnet className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton active={activeTool === "pan"} label="Pan" onClick={() => setActiveTool(activeTool === "pan" ? "select" : "pan")}>
          <MousePointer2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator />

      <div className="flex items-center gap-1">
        <ToolbarButton label="Zoom -" onClick={() => zoom(0.85)}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Zoom +" onClick={() => zoom(1.18)}>
          <Plus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Reset View" onClick={resetView}>
          <RotateCcw className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
