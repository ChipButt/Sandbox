import { useEffect, useMemo, useState } from "react";
import type { PlanufProject } from "../types/project";
import { AUTOSAVE_KEY, parseProjectFile, serialiseProject } from "../utils/file";
import { usePlannerStore } from "../store/plannerStore";

export function readAutosavedProject(): PlanufProject | null {
  const raw = localStorage.getItem(AUTOSAVE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return parseProjectFile(raw);
  } catch {
    localStorage.removeItem(AUTOSAVE_KEY);
    return null;
  }
}

export function clearAutosavedProject(): void {
  localStorage.removeItem(AUTOSAVE_KEY);
}

export function useAutosave(): PlanufProject | null {
  const project = usePlannerStore((state) => state.project);
  const markAutosaved = usePlannerStore((state) => state.markAutosaved);
  const [recoveryProject] = useState<PlanufProject | null>(() => readAutosavedProject());
  const serialisedProject = useMemo(() => serialiseProject(project), [project]);

  useEffect(() => {
    const save = (): void => {
      localStorage.setItem(AUTOSAVE_KEY, serialisedProject);
      markAutosaved();
    };

    const timer = window.setInterval(save, 30_000);
    window.addEventListener("beforeunload", save);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("beforeunload", save);
    };
  }, [markAutosaved, serialisedProject]);

  return recoveryProject;
}
