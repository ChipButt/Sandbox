import { Group, Layer, Line, Rect } from "react-konva";
import type { GuideLine, RectBounds, ViewState } from "../../types/project";

interface GuidesLayerProps {
  guides: GuideLine[];
  selection?: RectBounds | null;
  view: ViewState;
}

export function GuidesLayer({ guides, selection, view }: GuidesLayerProps) {
  return (
    <Layer listening={false}>
      <Group scaleX={view.scale} scaleY={view.scale} x={view.x} y={view.y}>
        {guides.map((guide) =>
          guide.orientation === "vertical" ? (
            <Line
              dash={[8, 5]}
              key={guide.id}
              points={[guide.position, guide.from, guide.position, guide.to]}
              stroke="#2563eb"
              strokeWidth={1 / view.scale}
            />
          ) : (
            <Line
              dash={[8, 5]}
              key={guide.id}
              points={[guide.from, guide.position, guide.to, guide.position]}
              stroke="#2563eb"
              strokeWidth={1 / view.scale}
            />
          ),
        )}
        {selection ? (
          <Rect
            dash={[6, 4]}
            fill="rgba(37,99,235,.08)"
            height={selection.height}
            stroke="#2563eb"
            strokeWidth={1 / view.scale}
            width={selection.width}
            x={selection.x}
            y={selection.y}
          />
        ) : null}
      </Group>
    </Layer>
  );
}
