import { Group, Layer, Line, Rect, Text } from "react-konva";
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
  const room = canvas.room;
  const performanceWidth = room.width * room.splitRatio;
  const performanceHeight = room.height * room.splitRatio;

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
        {room.visible ? (
          <>
            <Rect
              fill={canvas.background}
              height={room.height}
              name="canvas-background"
              stroke="#94a3b8"
              strokeWidth={2}
              width={room.width}
              x={room.x}
              y={room.y}
            />
            {room.areaMode === "vertical" ? (
              <>
                <Rect fill={room.performanceColor} height={room.height} opacity={0.55} width={performanceWidth} x={room.x} y={room.y} />
                <Rect fill={room.crewColor} height={room.height} opacity={0.55} width={room.width - performanceWidth} x={room.x + performanceWidth} y={room.y} />
                <Line dash={[12, 8]} points={[room.x + performanceWidth, room.y, room.x + performanceWidth, room.y + room.height]} stroke="#64748b" strokeWidth={2} />
                <Text
                  align="center"
                  fill={room.labelColor}
                  fontSize={26}
                  fontStyle="bold"
                  listening={false}
                  text={room.performanceLabel}
                  width={performanceWidth}
                  x={room.x}
                  y={room.y + 28}
                />
                <Text
                  align="center"
                  fill={room.labelColor}
                  fontSize={26}
                  fontStyle="bold"
                  listening={false}
                  text={room.crewLabel}
                  width={room.width - performanceWidth}
                  x={room.x + performanceWidth}
                  y={room.y + 28}
                />
              </>
            ) : null}
            {room.areaMode === "horizontal" ? (
              <>
                <Rect fill={room.performanceColor} height={performanceHeight} opacity={0.55} width={room.width} x={room.x} y={room.y} />
                <Rect fill={room.crewColor} height={room.height - performanceHeight} opacity={0.55} width={room.width} x={room.x} y={room.y + performanceHeight} />
                <Line dash={[12, 8]} points={[room.x, room.y + performanceHeight, room.x + room.width, room.y + performanceHeight]} stroke="#64748b" strokeWidth={2} />
                <Text
                  align="center"
                  fill={room.labelColor}
                  fontSize={26}
                  fontStyle="bold"
                  listening={false}
                  text={room.performanceLabel}
                  width={room.width}
                  x={room.x}
                  y={room.y + 28}
                />
                <Text
                  align="center"
                  fill={room.labelColor}
                  fontSize={26}
                  fontStyle="bold"
                  listening={false}
                  text={room.crewLabel}
                  width={room.width}
                  x={room.x}
                  y={room.y + performanceHeight + 28}
                />
              </>
            ) : null}
            <Rect
              height={room.height}
              listening={false}
              stroke="#334155"
              strokeWidth={3}
              width={room.width}
              x={room.x}
              y={room.y}
            />
          </>
        ) : (
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
        )}
        {lines}
      </Group>
    </Layer>
  );
}
