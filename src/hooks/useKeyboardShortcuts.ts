import { useEffect, useRef } from "react";
import type { ActiveTool } from "../types/project";
import { usePlannerStore } from "../store/plannerStore";

interface ShortcutCallbacks {
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks): void {
  const previousToolRef = useRef<ActiveTool>("select");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const store = usePlannerStore.getState();
      const meta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (meta && key === "n") {
        event.preventDefault();
        store.newProject("blank-studio");
        return;
      }

      if (meta && key === "o") {
        event.preventDefault();
        callbacks.onOpen();
        return;
      }

      if (meta && key === "s" && event.shiftKey) {
        event.preventDefault();
        callbacks.onSaveAs();
        return;
      }

      if (meta && key === "s") {
        event.preventDefault();
        callbacks.onSave();
        return;
      }

      if (meta && key === "z") {
        event.preventDefault();
        store.undo();
        return;
      }

      if (meta && key === "y") {
        event.preventDefault();
        store.redo();
        return;
      }

      if (meta && key === "c") {
        event.preventDefault();
        store.copySelected();
        return;
      }

      if (meta && key === "v") {
        event.preventDefault();
        store.pasteClipboard();
        return;
      }

      if (meta && key === "d") {
        event.preventDefault();
        store.duplicateSelected();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        store.deleteSelected();
        return;
      }

      if (event.key === "Escape") {
        store.clearSelection();
        store.setActiveTool("select");
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        if (store.activeTool !== "pan") {
          previousToolRef.current = store.activeTool;
          store.setActiveTool("pan");
        }
        return;
      }

      if (key === "g") {
        event.preventDefault();
        store.setCanvas({ gridVisible: !store.project.canvas.gridVisible });
        return;
      }

      if (key === "s") {
        event.preventDefault();
        store.setCanvas({ snapEnabled: !store.project.canvas.snapEnabled });
        return;
      }

      if (key === "r") {
        event.preventDefault();
        store.updateSelected({ rotation: ((store.project.objects.find((object) => store.selectedIds.includes(object.id))?.rotation ?? 0) + 15) % 360 });
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const delta = {
          x: event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0,
          y: event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0,
        };
        store.moveObjectsBy(store.selectedIds, delta);
      }
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === " ") {
        const store = usePlannerStore.getState();
        if (store.activeTool === "pan") {
          store.setActiveTool(previousToolRef.current);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [callbacks]);
}
