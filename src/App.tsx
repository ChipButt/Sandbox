import { useCallback, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type Konva from "konva";
import type { PlanufProject } from "./types/project";
import { useAutosave, clearAutosavedProject } from "./hooks/useAutosave";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { usePlannerStore } from "./store/plannerStore";
import { parseProjectFile, projectFileName, readTextFile, serialiseProject, downloadTextFile } from "./utils/file";
import { ResizableWorkspace } from "./components/layout/ResizableWorkspace";
import { StatusBar } from "./components/layout/StatusBar";
import { AssetBrowser } from "./components/sidebar/AssetBrowser";
import { RightSidebar } from "./components/properties/RightSidebar";
import { PlannerCanvas } from "./components/canvas/PlannerCanvas";
import { Toolbar } from "./components/toolbar/Toolbar";

function RecoveryDialog({
  project,
  onRecover,
  onDiscard,
}: {
  project: PlanufProject;
  onRecover: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded border border-black/15 bg-white p-4 shadow-panel">
        <h1 className="text-base font-semibold text-ink-950">Recover Previous Session</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
          Planuf found an autosaved project named <strong>{project.metadata.name}</strong>, last updated{" "}
          {new Date(project.metadata.updatedAt).toLocaleString()}.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="h-8 rounded border border-black/15 bg-white px-3 text-[12px] font-medium hover:bg-ink-100" type="button" onClick={onDiscard}>
            Start Fresh
          </button>
          <button className="h-8 rounded border border-signal-blue bg-signal-blue px-3 text-[12px] font-semibold text-white hover:bg-blue-700" type="button" onClick={onRecover}>
            Recover
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const project = usePlannerStore((state) => state.project);
  const loadProject = usePlannerStore((state) => state.loadProject);
  const setProjectName = usePlannerStore((state) => state.setProjectName);
  const setStatus = usePlannerStore((state) => state.setStatus);
  const autosavedProject = useAutosave();
  const [recoveryProject, setRecoveryProject] = useState<PlanufProject | null>(autosavedProject);

  const saveProject = useCallback(() => {
    downloadTextFile(projectFileName(project), serialiseProject(project), "application/json");
    setStatus(`Saved ${project.metadata.name}`);
  }, [project, setStatus]);

  const saveProjectAs = useCallback(() => {
    const nextName = window.prompt("Save project as", project.metadata.name);
    if (!nextName) {
      return;
    }
    const renamed = {
      ...project,
      metadata: {
        ...project.metadata,
        name: nextName.trim() || project.metadata.name,
        updatedAt: new Date().toISOString(),
      },
    };
    setProjectName(renamed.metadata.name);
    downloadTextFile(projectFileName(renamed), serialiseProject(renamed), "application/json");
    setStatus(`Saved ${renamed.metadata.name}`);
  }, [project, setProjectName, setStatus]);

  const openProjectPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const shortcutCallbacks = useMemo(
    () => ({
      onOpen: openProjectPicker,
      onSave: saveProject,
      onSaveAs: saveProjectAs,
    }),
    [openProjectPicker, saveProject, saveProjectAs],
  );

  useKeyboardShortcuts(shortcutCallbacks);

  const handleFileSelected = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) {
        return;
      }

      try {
        const text = await readTextFile(file);
        loadProject(parseProjectFile(text));
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not open the selected project");
      }
    },
    [loadProject, setStatus],
  );

  return (
    <>
      <ResizableWorkspace
        canvas={<PlannerCanvas stageRef={stageRef} />}
        left={<AssetBrowser />}
        right={<RightSidebar />}
        status={<StatusBar />}
        toolbar={<Toolbar stageRef={stageRef} onOpen={openProjectPicker} onSave={saveProject} onSaveAs={saveProjectAs} />}
      />
      <input
        ref={fileInputRef}
        accept=".planufset,application/json"
        className="hidden"
        type="file"
        onChange={(event) => {
          void handleFileSelected(event);
        }}
      />
      {recoveryProject ? (
        <RecoveryDialog
          project={recoveryProject}
          onDiscard={() => {
            clearAutosavedProject();
            setRecoveryProject(null);
            setStatus("Started fresh");
          }}
          onRecover={() => {
            loadProject(recoveryProject);
            setRecoveryProject(null);
          }}
        />
      ) : null}
    </>
  );
}
