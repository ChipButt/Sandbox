import { Arrow, Circle, Ellipse, Group, Image as KonvaImage, Path, Rect, Text } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { CanvasSettings, PlanObject } from "../../types/project";
import { findAsset } from "../../utils/assets";
import { formatMeasurement } from "../../utils/geometry";
import { useSvgImage } from "../../hooks/useSvgImage";

interface ObjectNodeProps {
  object: PlanObject;
  canvas: CanvasSettings;
  selected: boolean;
  layerVisible: boolean;
  layerLocked: boolean;
  onBindNode: (id: string, node: Konva.Group | null) => void;
  onSelect: (id: string, additive: boolean) => void;
  onDragStart: (id: string, node: Konva.Group) => void;
  onDragMove: (id: string, node: Konva.Group) => void;
  onDragEnd: (id: string, node: Konva.Group) => void;
}

function objectSvg(object: PlanObject): string {
  return findAsset(object.assetId)?.svg ?? object.assetSvg ?? "";
}

function AssetImage({ object }: { object: PlanObject }) {
  const image = useSvgImage(objectSvg(object), object.stroke, object.strokeWidth);

  return (
    <>
      {object.fill !== "transparent" ? (
        <Rect fill={object.fill} height={object.height} opacity={0.18} width={object.width} x={0} y={0} />
      ) : null}
      <KonvaImage height={object.height} image={image ?? undefined} width={object.width} x={0} y={0} />
    </>
  );
}

function MeasurementShape({ object, canvas }: { object: PlanObject; canvas: CanvasSettings }) {
  if (object.type !== "measurement") {
    return null;
  }

  const length = Math.hypot(object.width, object.height);
  const label = object.label || formatMeasurement(length, canvas);
  const midpoint = { x: object.width / 2, y: object.height / 2 };
  const isRoom = object.measurementKind === "room";

  if (isRoom) {
    return (
      <>
        <Rect
          dash={[8, 6]}
          fill="rgba(8,145,178,.05)"
          height={object.height}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          width={object.width}
          x={0}
          y={0}
        />
        <Text
          align="center"
          fill={object.stroke}
          fontSize={18}
          text={`${formatMeasurement(Math.abs(object.width), canvas)} x ${formatMeasurement(Math.abs(object.height), canvas)}`}
          width={Math.abs(object.width)}
          x={object.width < 0 ? object.width : 0}
          y={object.height / 2 - 10}
        />
      </>
    );
  }

  return (
    <>
      <Arrow
        fill={object.stroke}
        pointerAtBeginning
        pointerLength={9}
        pointerWidth={9}
        points={[0, 0, object.width, object.height]}
        stroke={object.stroke}
        strokeWidth={object.strokeWidth}
      />
      <Text
        align="center"
        fill={object.stroke}
        fontSize={16}
        offsetX={60}
        offsetY={18}
        text={label}
        width={120}
        x={midpoint.x}
        y={midpoint.y}
      />
    </>
  );
}

export function ObjectNode({
  object,
  canvas,
  layerVisible,
  layerLocked,
  onBindNode,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ObjectNodeProps) {
  const locked = object.locked || layerLocked;
  const visible = object.visible && layerVisible;

  if (object.type === "measurement") {
    return (
      <Group
        draggable={!locked}
        id={object.id}
        name="plan-object"
        opacity={object.opacity}
        ref={(node) => onBindNode(object.id, node)}
        rotation={object.rotation}
        visible={visible}
        x={object.x}
        y={object.y}
        onClick={(event) => onSelect(object.id, event.evt.shiftKey)}
        onDragEnd={(event) => onDragEnd(object.id, event.target as Konva.Group)}
        onDragMove={(event) => onDragMove(object.id, event.target as Konva.Group)}
        onDragStart={(event) => onDragStart(object.id, event.target as Konva.Group)}
        onTap={(event) => onSelect(object.id, event.evt.shiftKey)}
      >
        <MeasurementShape canvas={canvas} object={object} />
      </Group>
    );
  }

  const groupX = object.x + object.width / 2;
  const groupY = object.y + object.height / 2;

  return (
    <Group
      draggable={!locked}
      height={object.height}
      id={object.id}
      name="plan-object"
      offsetX={object.width / 2}
      offsetY={object.height / 2}
      opacity={object.opacity}
      ref={(node) => onBindNode(object.id, node)}
      rotation={object.rotation}
      scaleX={object.flipX ? -1 : 1}
      scaleY={object.flipY ? -1 : 1}
      visible={visible}
      width={object.width}
      x={groupX}
      y={groupY}
      onClick={(event: KonvaEventObject<MouseEvent>) => onSelect(object.id, event.evt.shiftKey)}
      onDragEnd={(event) => onDragEnd(object.id, event.target as Konva.Group)}
      onDragMove={(event) => onDragMove(object.id, event.target as Konva.Group)}
      onDragStart={(event) => onDragStart(object.id, event.target as Konva.Group)}
      onTap={(event) => onSelect(object.id, event.evt.shiftKey)}
    >
      {object.type === "wall" ? (
        <Rect cornerRadius={2} fill={object.stroke} height={object.height} width={object.width} x={0} y={0} />
      ) : null}
      {object.type === "curved-wall" ? (
        <Path
          data={`M 0 ${object.height} Q ${object.width * object.curvature} ${-object.height * 3} ${object.width} ${object.height}`}
          lineCap="round"
          listening
          stroke={object.stroke}
          strokeWidth={object.thickness}
        />
      ) : null}
      {object.type === "table" && object.tableShape === "round" ? (
        <Ellipse
          fill={object.fill === "transparent" ? "rgba(71,113,140,.08)" : object.fill}
          radiusX={object.width / 2}
          radiusY={object.height / 2}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          x={object.width / 2}
          y={object.height / 2}
        />
      ) : null}
      {object.type !== "wall" && object.type !== "curved-wall" && !(object.type === "table" && object.tableShape === "round") ? (
        <AssetImage object={object} />
      ) : null}
      {object.type === "camera" ? (
        <Arrow
          fill={object.stroke}
          pointerLength={10}
          pointerWidth={10}
          points={[object.width / 2, object.height / 2, object.width / 2, -18]}
          stroke={object.stroke}
          strokeWidth={2}
        />
      ) : null}
      {object.type === "light" ? (
        <Circle fill={object.beamColor} opacity={0.3} radius={5} x={object.width / 2} y={object.height / 2} />
      ) : null}
    </Group>
  );
}
