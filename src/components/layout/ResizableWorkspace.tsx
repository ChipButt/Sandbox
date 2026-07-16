import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Boxes, SlidersHorizontal, X } from "lucide-react";

interface ResizableWorkspaceProps {
  toolbar: ReactNode;
  left: ReactNode;
  canvas: ReactNode;
  right: ReactNode;
  status: ReactNode;
}

type DragSide = "left" | "right";
type MobileDrawer = "left" | "right" | null;

export function ResizableWorkspace({ toolbar, left, canvas, right, status }: ResizableWorkspaceProps) {
  const [leftWidth, setLeftWidth] = useState(292);
  const [rightWidth, setRightWidth] = useState(332);
  const [mobileDrawer, setMobileDrawer] = useState<MobileDrawer>(null);

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
    <div className="grid h-dvh w-full grid-rows-[52px_minmax(0,1fr)_32px] bg-[#c9ced5] text-[13px] text-ink-900 md:h-full md:grid-rows-[48px_minmax(0,1fr)_28px]">
      <header className="min-w-0 border-b border-black/10 bg-[#f8fafc] shadow-sm">{toolbar}</header>
      <div className="relative flex min-h-0 min-w-0">
        <aside className="hidden min-h-0 shrink-0 border-r border-black/10 bg-[#f8fafc] md:block" style={{ width: leftWidth }}>
          {left}
        </aside>
        <div
          aria-label="Resize left panel"
          className="hidden w-1.5 cursor-col-resize bg-[#d9dee5] transition hover:bg-signal-blue md:block"
          role="separator"
          onPointerDown={(event) => startResize("left", event)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{canvas}</main>
        <div
          aria-label="Resize right panel"
          className="hidden w-1.5 cursor-col-resize bg-[#d9dee5] transition hover:bg-signal-blue md:block"
          role="separator"
          onPointerDown={(event) => startResize("right", event)}
        />
        <aside className="hidden min-h-0 shrink-0 border-l border-black/10 bg-[#f8fafc] md:block" style={{ width: rightWidth }}>
          {right}
        </aside>
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 flex items-center justify-between md:hidden">
          <button
            aria-label="Open asset browser"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded border border-black/15 bg-white/95 text-ink-800 shadow-panel backdrop-blur"
            type="button"
            onClick={() => setMobileDrawer("left")}
          >
            <Boxes className="h-5 w-5" />
          </button>
          <button
            aria-label="Open properties and layers"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded border border-black/15 bg-white/95 text-ink-800 shadow-panel backdrop-blur"
            type="button"
            onClick={() => setMobileDrawer("right")}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
        {mobileDrawer ? (
          <div className="absolute inset-0 z-40 md:hidden">
            <button
              aria-label="Close panel overlay"
              className="absolute inset-0 h-full w-full bg-black/25"
              type="button"
              onClick={() => setMobileDrawer(null)}
            />
            <aside
              className={`absolute top-0 h-full w-[min(90vw,380px)] border-black/10 bg-[#f8fafc] shadow-panel ${
                mobileDrawer === "left" ? "left-0 border-r" : "right-0 border-l"
              }`}
            >
              <div className="flex h-11 items-center justify-between border-b border-black/10 px-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-700">
                  {mobileDrawer === "left" ? "Assets" : "Inspector"}
                </span>
                <button
                  aria-label="Close panel"
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-black/5"
                  type="button"
                  onClick={() => setMobileDrawer(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[calc(100%-2.75rem)] min-h-0">{mobileDrawer === "left" ? left : right}</div>
            </aside>
          </div>
        ) : null}
      </div>
      <footer className="border-t border-black/10 bg-[#eef2f6]">{status}</footer>
    </div>
  );
}
