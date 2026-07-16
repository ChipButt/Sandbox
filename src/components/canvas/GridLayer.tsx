import { Group, Layer, Line, Rect, Text } from "react-konva";
import type { CanvasSettings, Point, RectBounds, RoomAreaId, ViewState } from "../../types/project";
import { roomAreaBounds } from "../../utils/scale";

export type RoomAreaResizeHandle = "nw" | "ne" | "sw" | "se";

interface GridLayerProps {
  canvas: CanvasSettings;
  view: ViewState;
  width: number;
  height: number;
  selectedRoomArea: RoomAreaId | null;
  draftRoomArea: { area: RoomAreaId; bounds: RectBounds } | null;
  onSelectRoomArea: (area: RoomAreaId) => void;
  onRoomAreaDragMove: (area: RoomAreaId, bounds: RectBounds) => void;
  onRoomAreaDragEnd: (area: RoomAreaId, bounds: RectBounds) => void;
  onRoomAreaResizeStart: (area: RoomAreaId, handle: RoomAreaResizeHandle) => void;
  onRoomAreaResizeMove: (point: Point) => void;
  onRoomAreaResizeEnd: () => void;
}

function boundsWithDraft(area: RoomAreaId, bounds: RectBounds, draft: GridLayerProps["draftRoomArea"]): RectBounds {
  return draft?.area === area ? draft.bounds : bounds;
}

function handlePoints(bounds: RectBounds): Array<{ handle: RoomAreaResizeHandle; point: Point }> {
  return [
    { handle: "nw", point: { x: bounds.x, y: bounds.y } },
    { handle: "ne", point: { x: bounds.x + bounds.width, y: bounds.y } },
    { handle: "sw", point: { x: bounds.x, y: bounds.y + bounds.height } },
    { handle: "se", point: { x: bounds.x + bounds.width, y: bounds.y + bounds.height } },
  ];
}

export function GridLayer({
  canvas,
  view,
  width,
  height,
  selectedRoomArea,
  draftRoomArea,
  onSelectRoomArea,
  onRoomAreaDragMove,
  onRoomAreaDragEnd,
  onRoomAreaResizeStart,
  onRoomAreaResizeMove,
  onRoomAreaResizeEnd,
}: GridLayerProps) {
  const worldLeft = -view.x / view.scale;
  const worldTop = -view.y / view.scale;
  const worldRight = worldLeft + width / view.scale;
  const worldBottom = worldTop + height / view.scale;
  const gridSize = canvas.gridSize;
  const startX = Math.floor(worldLeft / gridSize) * gridSize;
  const startY = Math.floor(worldTop / gridSize) * gridSize;
  const lines = [];
  const room = canvas.room;

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
    <Layer>
      <Group scaleX={view.scale} scaleY={view.scale} x={view.x} y={view.y}>
        {room.visible ? (() => {
          const crewBounds = boundsWithDraft("crew", roomAreaBounds(room, "crew"), draftRoomArea);
          const hasPerformanceArea = room.performanceArea !== null || draftRoomArea?.area === "performance";
          const performanceBounds = hasPerformanceArea ? boundsWithDraft("performance", roomAreaBounds(room, "performance"), draftRoomArea) : null;
          const selectedBounds =
            selectedRoomArea === "performance" && performanceBounds
              ? performanceBounds
              : selectedRoomArea === "crew"
                ? crewBounds
                : null;
          const selectedArea = selectedRoomArea === "performance" && performanceBounds ? "performance" : selectedRoomArea === "crew" ? "crew" : null;
          const handleSize = 12 / view.scale;
          const handleOffset = handleSize / 2;

          return (
            <>
              <Rect
                fill={canvas.background}
                height={crewBounds.height}
                listening={false}
                name="canvas-background"
                stroke="#94a3b8"
                strokeWidth={2}
                width={crewBounds.width}
                x={crewBounds.x}
                y={crewBounds.y}
              />
              <Rect
                draggable={selectedRoomArea === "crew"}
                fill={room.crewColor}
                height={crewBounds.height}
                name="room-area-fill room-area-crew"
                opacity={0.55}
                width={crewBounds.width}
                x={crewBounds.x}
                y={crewBounds.y}
                onClick={() => onSelectRoomArea("crew")}
                onDragEnd={(event) => onRoomAreaDragEnd("crew", { ...crewBounds, x: event.target.x(), y: event.target.y() })}
                onDragMove={(event) => onRoomAreaDragMove("crew", { ...crewBounds, x: event.target.x(), y: event.target.y() })}
                onTap={() => onSelectRoomArea("crew")}
              />
              <Text
                align="center"
                fill={room.labelColor}
                fontSize={22}
                fontStyle="bold"
                listening={false}
                name="room-area-label"
                text={room.crewLabel}
                width={crewBounds.width}
                x={crewBounds.x}
                y={crewBounds.y + Math.max(20, crewBounds.height - 38)}
              />
              {performanceBounds ? (
                <>
                  <Rect
                    draggable={selectedRoomArea === "performance"}
                    fill={room.performanceColor}
                    height={performanceBounds.height}
                    name="room-area-fill room-area-performance"
                    opacity={0.7}
                    stroke="#38bdf8"
                    strokeWidth={1}
                    width={performanceBounds.width}
                    x={performanceBounds.x}
                    y={performanceBounds.y}
                    onClick={() => onSelectRoomArea("performance")}
                    onDragEnd={(event) =>
                      onRoomAreaDragEnd("performance", { ...performanceBounds, x: event.target.x(), y: event.target.y() })
                    }
                    onDragMove={(event) =>
                      onRoomAreaDragMove("performance", { ...performanceBounds, x: event.target.x(), y: event.target.y() })
                    }
                    onTap={() => onSelectRoomArea("performance")}
                  />
                  <Text
                    align="center"
                    fill={room.labelColor}
                    fontSize={22}
                    fontStyle="bold"
                    listening={false}
                    name="room-area-label"
                    text={room.performanceLabel}
                    width={performanceBounds.width}
                    x={performanceBounds.x}
                    y={performanceBounds.y + 22}
                  />
                </>
              ) : null}
              <Rect
                height={crewBounds.height}
                listening={false}
                name="room-area-border"
                stroke="#334155"
                strokeWidth={3}
                width={crewBounds.width}
                x={crewBounds.x}
                y={crewBounds.y}
              />
              {selectedBounds && selectedArea ? (
                <>
                  <Rect
                    dash={[10, 6]}
                    height={selectedBounds.height}
                    listening={false}
                    stroke="#2563eb"
                    strokeWidth={4 / view.scale}
                    width={selectedBounds.width}
                    x={selectedBounds.x}
                    y={selectedBounds.y}
                  />
                  {handlePoints(selectedBounds).map(({ handle, point }) => (
                    <Rect
                      draggable
                      fill="#ffffff"
                      height={handleSize}
                      key={handle}
                      name={`room-area-handle room-area-${selectedArea}`}
                      stroke="#2563eb"
                      strokeWidth={2 / view.scale}
                      width={handleSize}
                      x={point.x - handleOffset}
                      y={point.y - handleOffset}
                      onDragEnd={() => onRoomAreaResizeEnd()}
                      onDragMove={(event) =>
                        onRoomAreaResizeMove({ x: event.target.x() + handleOffset, y: event.target.y() + handleOffset })
                      }
                      onDragStart={() => onRoomAreaResizeStart(selectedArea, handle)}
                    />
                  ))}
                </>
              ) : null}
            </>
          );
        })() : (
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
