import { Group, Layer, Line, Rect } from "react-konva";
import type { CanvasSettings, ViewState } from "../../types/project";

interface GridLayerProps {
  canvas: CanvasSettings;
  view: ViewState;
  width: number;
  height: number;
}

export function GridLayer({ canvas, view, width, height }: GridLayerProps) {
  const worldLeft = -view.x / view.scale;
  const worldTop = -view.y / view.scale;
  const worldRight = worldLeft + width / view.scale;
  const worldBottom = worldTop + height / view.scale;
  const gridSize = canvas.gridSize;
  const startX = Math.floor(worldLeft / gridSize) * gridSize;
  const startY = Math.floor(worldTop / gridSize) * gridSize;
  const lines = [];

  if (canvas.gridVisible) {
    for (let x = startX; x <= worldRight; x += gridSize) {
      const major = Math.round(x / gridSize) % 5 === 0;
      lines.push(
        <Line
          key={`x-${x}`}
          listening={false}
          name="canvas-grid"
          points={[x, worldTop - gridSize, x, worldBottom + gridSize]}
          stroke={major ? "#b5bdc7" : "#d9dee5"}
          strokeWidth={major ? 1 : 0.6}
        />,
      );
    }

    for (let y = startY; y <= worldBottom; y += gridSize) {
      const major = Math.round(y / gridSize) % 5 === 0;
      lines.push(
        <Line
          key={`y-${y}`}
          listening={false}
          name="canvas-grid"
          points={[worldLeft - gridSize, y, worldRight + gridSize, y]}
          stroke={major ? "#b5bdc7" : "#d9dee5"}
          strokeWidth={major ? 1 : 0.6}
        />,
      );
    }
  }

  return (
    <Layer listening={false}>
      <Group scaleX={view.scale} scaleY={view.scale} x={view.x} y={view.y}>
        <Rect
          fill={canvas.background}
          height={canvas.height}
          name="canvas-background"
          shadowBlur={18}
          shadowColor="rgba(15,23,42,.16)"
          shadowOffset={{ x: 0, y: 8 }}
          shadowOpacity={1}
          width={canvas.width}
          x={0}
          y={0}
        />
        {lines}
      </Group>
    </Layer>
  );
}
