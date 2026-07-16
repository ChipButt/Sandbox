import { useCallback, useState } from "react";
import type { ReactNode } from "react";

interface ResizableWorkspaceProps {
  toolbar: ReactNode;
  left: ReactNode;
  canvas: ReactNode;
  right: ReactNode;
  status: ReactNode;
}

type DragSide = "left" | "right";

export function ResizableWorkspace({ toolbar, left, canvas, right, status }: ResizableWorkspaceProps) {
  const [leftWidth, setLeftWidth] = useState(292);
  const [rightWidth, setRightWidth] = useState(332);

  const startResize = useCallback(
    (side: DragSide, event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const initialLeft = leftWidth;
      const initialRight = rightWidth;

      const handlePointerMove = (moveEvent: PointerEvent): void => {
        const delta = moveEvent.clientX - startX;
        if (side === "left") {
          setLeftWidth(Math.min(Math.max(initialLeft + delta, 220), 460));
        } else {
          setRightWidth(Math.min(Math.max(initialRight - delta, 270), 520));
        }
      };

      const handlePointerUp = (): void => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [leftWidth, rightWidth],
  );

  return (
    <div className="grid h-full w-full grid-rows-[48px_minmax(0,1fr)_28px] bg-[#c9ced5] text-[13px] text-ink-900">
      <header className="min-w-0 border-b border-black/10 bg-[#f8fafc] shadow-sm">{toolbar}</header>
      <div className="flex min-h-0 min-w-0">
        <aside className="min-h-0 shrink-0 border-r border-black/10 bg-[#f8fafc]" style={{ width: leftWidth }}>
          {left}
        </aside>
        <div
          aria-label="Resize left panel"
          className="w-1.5 cursor-col-resize bg-[#d9dee5] transition hover:bg-signal-blue"
          role="separator"
          onPointerDown={(event) => startResize("left", event)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{canvas}</main>
        <div
          aria-label="Resize right panel"
          className="w-1.5 cursor-col-resize bg-[#d9dee5] transition hover:bg-signal-blue"
          role="separator"
          onPointerDown={(event) => startResize("right", event)}
        />
        <aside className="min-h-0 shrink-0 border-l border-black/10 bg-[#f8fafc]" style={{ width: rightWidth }}>
          {right}
        </aside>
      </div>
      <footer className="border-t border-black/10 bg-[#eef2f6]">{status}</footer>
    </div>
  );
}
