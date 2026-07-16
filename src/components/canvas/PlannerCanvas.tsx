import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Transformer, Wedge } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { MutableRefObject } from "react";
import type { MeasurementKind, PlanObject, Point, RectBounds, ViewState } from "../../types/project";
import { ASSET_MAP } from "../../utils/assets";
import { clamp, computeSnap, fitCanvasView, normalizeRect, objectBounds, rectsIntersect, screenToWorld } from "../../utils/geometry";
import { useElementSize } from "../../hooks/useElementSize";
import { usePlannerStore } from "../../store/plannerStore";
import { GridLayer } from "./GridLayer";
import { GuidesLayer } from "./GuidesLayer";
import { ObjectNode } from "./ObjectNode";

interface PlannerCanvasProps {
  stageRef: MutableRefObject<Konva.Stage | null>;
}

interface DragSession {
  ids: string[];
  primaryId: string;
  starts: Map<string, Point>;
  primaryStart: Point;
}

interface DraftMeasurement {
  kind: MeasurementKind;
  start: Point;
  current: Point;
}

function isStageBackground(target: Konva.Node): boolean {
  return target === target.getStage() || target.name() === "canvas-background";
}

function nodeTopLeft(object: PlanObject, node: Konva.Group): Point {
  if (object.type === "measurement") {
    return { x: node.x(), y: node.y() };
  }

  return {
    x: node.x() - object.width / 2,
    y: node.y() - object.height / 2,
  };
}

function setNodeTopLeft(object: PlanObject, node: Konva.Group, point: Point): void {
  if (object.type === "measurement") {
    node.position(point);
    return;
  }

  node.position({
    x: point.x + object.width / 2,
    y: point.y + object.height / 2,
  });
}

function viewFromWheel(current: ViewState, pointer: Point, deltaY: number): ViewState {
  const scaleBy = 1.08;
  const oldScale = current.scale;
  const mousePoint = {
    x: (pointer.x - current.x) / oldScale,
    y: (pointer.y - current.y) / oldScale,
  };
  const newScale = clamp(deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy, 0.08, 4);

  return {
    x: pointer.x - mousePoint.x * newScale,
    y: pointer.y - mousePoint.y * newScale,
    scale: newScale,
  };
}

function objectLayerVisible(object: PlanObject, layerMap: Map<string, { locked: boolean; visible: boolean }>): boolean {
  return layerMap.get(object.layerId)?.visible ?? true;
}

function objectLayerLocked(object: PlanObject, layerMap: Map<string, { locked: boolean; visible: boolean }>): boolean {
  return layerMap.get(object.layerId)?.locked ?? false;
}

export function PlannerCanvas({ stageRef }: PlannerCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const nodeMap = useRef<Map<string, Konva.Group>>(new Map());
  const dragSessionRef = useRef<DragSession | null>(null);
  const panSessionRef = useRef<{ pointer: Point; view: ViewState } | null>(null);
  const selectionStartRef = useRef<Point | null>(null);
  const hasAutoFitRef = useRef(false);
  const [selectionRect, setSelectionRect] = useState<RectBounds | null>(null);
  const [draftMeasurement, setDraftMeasurement] = useState<DraftMeasurement | null>(null);
  const size = useElementSize(containerRef);

  const project = usePlannerStore((state) => state.project);
  const selectedIds = usePlannerStore((state) => state.selectedIds);
  const activeTool = usePlannerStore((state) => state.activeTool);
  const view = usePlannerStore((state) => state.view);
  const guides = usePlannerStore((state) => state.guides);
  const setView = usePlannerStore((state) => state.setView);
  const selectObject = usePlannerStore((state) => state.selectObject);
  const setSelection = usePlannerStore((state) => state.setSelection);
  const clearSelection = usePlannerStore((state) => state.clearSelection);
  const addObjectFromAsset = usePlannerStore((state) => state.addObjectFromAsset);
  const addObjectFromPreset = usePlannerStore((state) => state.addObjectFromPreset);
  const addMeasurement = usePlannerStore((state) => state.addMeasurement);
  const moveObjectsBy = usePlannerStore((state) => state.moveObjectsBy);
  const updateObject = usePlannerStore((state) => state.updateObject);
  const setGuides = usePlannerStore((state) => state.setGuides);
  const clearGuides = usePlannerStore((state) => state.clearGuides);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const layerMap = useMemo(
    () => new Map(project.layers.map((layer) => [layer.id, { locked: layer.locked, visible: layer.visible }])),
    [project.layers],
  );

  const orderedObjects = useMemo(() => {
    const layerOrder = new Map(project.layers.map((layer, index) => [layer.id, index]));
    return [...project.objects].sort((first, second) => {
      const layerDelta = (layerOrder.get(first.layerId) ?? 0) - (layerOrder.get(second.layerId) ?? 0);
      if (layerDelta !== 0) {
        return layerDelta;
      }
      return project.objects.indexOf(first) - project.objects.indexOf(second);
    });
  }, [project.layers, project.objects]);

  const selectedObjects = useMemo(
    () => project.objects.filter((object) => selectedSet.has(object.id) && objectLayerVisible(object, layerMap)),
    [layerMap, project.objects, selectedSet],
  );

  const bindNode = useCallback((id: string, node: Konva.Group | null) => {
    if (node) {
      nodeMap.current.set(id, node);
    } else {
      nodeMap.current.delete(id);
    }
  }, []);

  const syncTransformer = useCallback(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }

    const nodes = selectedObjects
      .filter((object) => !object.locked && !objectLayerLocked(object, layerMap))
      .map((object) => nodeMap.current.get(object.id))
      .filter((node): node is Konva.Group => node !== undefined);

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [layerMap, selectedObjects]);

  const handleStageReady = useCallback(
    (stage: Konva.Stage | null) => {
      stageRef.current = stage;
      syncTransformer();
    },
    [stageRef, syncTransformer],
  );

  useEffect(() => {
    syncTransformer();
  }, [syncTransformer]);

  useEffect(() => {
    if (hasAutoFitRef.current || size.width <= 0 || size.height <= 0) {
      return;
    }

    hasAutoFitRef.current = true;
    setView(fitCanvasView(project.canvas, size));
  }, [project.canvas, setView, size]);

  const handleObjectSelect = useCallback(
    (id: string, additive: boolean) => {
      selectObject(id, additive);
      window.requestAnimationFrame(syncTransformer);
    },
    [selectObject, syncTransformer],
  );

  const startObjectDrag = useCallback(
    (id: string, node: Konva.Group) => {
      const state = usePlannerStore.getState();
      const object = state.project.objects.find((item) => item.id === id);
      if (!object) {
        return;
      }

      const ids = state.selectedIds.includes(id) ? state.selectedIds : [id];
      const starts = new Map<string, Point>();
      for (const selectedId of ids) {
        const selectedObject = state.project.objects.find((item) => item.id === selectedId);
        const selectedNode = nodeMap.current.get(selectedId);
        if (selectedObject && selectedNode) {
          starts.set(selectedId, nodeTopLeft(selectedObject, selectedNode));
        }
      }

      if (!state.selectedIds.includes(id)) {
        selectObject(id, false);
      }

      dragSessionRef.current = {
        ids,
        primaryId: id,
        starts,
        primaryStart: nodeTopLeft(object, node),
      };
    },
    [selectObject],
  );

  const moveObjectDrag = useCallback(
    (id: string, node: Konva.Group) => {
      const session = dragSessionRef.current;
      const state = usePlannerStore.getState();
      const moving = state.project.objects.find((object) => object.id === id);
      if (!session || !moving) {
        return;
      }

      const proposedPoint = nodeTopLeft(moving, node);
      const snap = computeSnap(
        moving,
        proposedPoint,
        state.project.objects.filter((object) => !session.ids.includes(object.id)),
        state.project.canvas,
        8 / state.view.scale,
      );
      const delta = {
        x: snap.point.x - session.primaryStart.x,
        y: snap.point.y - session.primaryStart.y,
      };

      for (const selectedId of session.ids) {
        const selectedObject = state.project.objects.find((object) => object.id === selectedId);
        const selectedNode = nodeMap.current.get(selectedId);
        const start = session.starts.get(selectedId);
        if (selectedObject && selectedNode && start) {
          setNodeTopLeft(selectedObject, selectedNode, { x: start.x + delta.x, y: start.y + delta.y });
        }
      }

      if (state.project.canvas.smartGuides) {
        setGuides(snap.guides);
      }
    },
    [setGuides],
  );

  const endObjectDrag = useCallback(
    (id: string, node: Konva.Group) => {
      const session = dragSessionRef.current;
      const state = usePlannerStore.getState();
      const object = state.project.objects.find((item) => item.id === id);
      if (!session || !object) {
        return;
      }

      const endPoint = nodeTopLeft(object, node);
      const delta = {
        x: endPoint.x - session.primaryStart.x,
        y: endPoint.y - session.primaryStart.y,
      };

      moveObjectsBy(session.ids, delta);
      dragSessionRef.current = null;
      clearGuides();
    },
    [clearGuides, moveObjectsBy],
  );

  const handleTransformEnd = useCallback(() => {
    const state = usePlannerStore.getState();
    for (const object of state.project.objects.filter((item) => state.selectedIds.includes(item.id))) {
      const node = nodeMap.current.get(object.id);
      if (!node) {
        continue;
      }

      const scaleX = Math.abs(node.scaleX());
      const scaleY = Math.abs(node.scaleY());
      let width = Math.max(6, object.width * scaleX);
      let height = Math.max(6, object.height * scaleY);

      if (object.type === "wall" || object.type === "door" || object.type === "window") {
        height = object.thickness;
      }

      if (object.type === "table" && (object.tableShape === "round" || object.keepProportions)) {
        const sizeValue = Math.max(width, height);
        width = sizeValue;
        height = sizeValue;
      }

      const x = object.type === "measurement" ? node.x() : node.x() - width / 2;
      const y = object.type === "measurement" ? node.y() : node.y() - height / 2;
      node.scaleX(object.flipX ? -1 : 1);
      node.scaleY(object.flipY ? -1 : 1);

      updateObject(object.id, {
        x,
        y,
        width,
        height,
        rotation: node.rotation(),
      });
    }
  }, [updateObject]);

  const handleWheel = useCallback(
    (event: KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault();
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!pointer) {
        return;
      }
      setView(viewFromWheel(view, pointer, event.evt.deltaY));
    },
    [setView, stageRef, view],
  );

  const handleMouseDown = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) {
        return;
      }

      const world = screenToWorld(pointer, view);
      const shouldPan = event.evt.button === 1 || activeTool === "pan";
      if (shouldPan) {
        panSessionRef.current = { pointer, view };
        stage.container().style.cursor = "grabbing";
        return;
      }

      if (!isStageBackground(event.target)) {
        return;
      }

      if (activeTool === "ruler" || activeTool === "distance" || activeTool === "dimension" || activeTool === "room") {
        setDraftMeasurement({ kind: activeTool, start: world, current: world });
        return;
      }

      clearSelection();
      selectionStartRef.current = world;
      setSelectionRect({ x: world.x, y: world.y, width: 0, height: 0 });
    },
    [activeTool, clearSelection, stageRef, view],
  );

  const handleMouseMove = useCallback(() => {
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) {
      return;
    }

    if (panSessionRef.current) {
      const session = panSessionRef.current;
      setView({
        ...session.view,
        x: session.view.x + pointer.x - session.pointer.x,
        y: session.view.y + pointer.y - session.pointer.y,
      });
      return;
    }

    const world = screenToWorld(pointer, usePlannerStore.getState().view);
    if (selectionStartRef.current) {
      const start = selectionStartRef.current;
      setSelectionRect(normalizeRect({ x: start.x, y: start.y, width: world.x - start.x, height: world.y - start.y }));
    }
    setDraftMeasurement((current) => (current ? { ...current, current: world } : null));
  }, [setView, stageRef]);

  const handleMouseUp = useCallback(() => {
    const stage = stageRef.current;
    if (stage) {
      stage.container().style.cursor = activeTool === "pan" ? "grab" : "default";
    }

    if (panSessionRef.current) {
      panSessionRef.current = null;
      return;
    }

    if (selectionRect) {
      const selected = project.objects
        .filter((object) => object.visible && objectLayerVisible(object, layerMap))
        .filter((object) => rectsIntersect(selectionRect, objectBounds(object)))
        .map((object) => object.id);

      if (selectionRect.width > 4 || selectionRect.height > 4) {
        setSelection(selected);
      }
      setSelectionRect(null);
      selectionStartRef.current = null;
    }

    if (draftMeasurement) {
      if (Math.hypot(draftMeasurement.current.x - draftMeasurement.start.x, draftMeasurement.current.y - draftMeasurement.start.y) > 5) {
        addMeasurement(draftMeasurement.kind, draftMeasurement.start, draftMeasurement.current);
      }
      setDraftMeasurement(null);
    }

    window.requestAnimationFrame(syncTransformer);
  }, [activeTool, addMeasurement, draftMeasurement, layerMap, project.objects, selectionRect, setSelection, stageRef, syncTransformer]);

  const handleTouchStart = useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) {
        return;
      }

      event.evt.preventDefault();
      const world = screenToWorld(pointer, view);

      if (!isStageBackground(event.target)) {
        return;
      }

      if (activeTool === "ruler" || activeTool === "distance" || activeTool === "dimension" || activeTool === "room") {
        setDraftMeasurement({ kind: activeTool, start: world, current: world });
        return;
      }

      panSessionRef.current = { pointer, view };
      stage.container().style.cursor = "grabbing";
    },
    [activeTool, stageRef, view],
  );

  const handleTouchMove = useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!stage || !pointer) {
        return;
      }

      event.evt.preventDefault();

      if (panSessionRef.current) {
        const session = panSessionRef.current;
        setView({
          ...session.view,
          x: session.view.x + pointer.x - session.pointer.x,
          y: session.view.y + pointer.y - session.pointer.y,
        });
        return;
      }

      const world = screenToWorld(pointer, usePlannerStore.getState().view);
      setDraftMeasurement((current) => (current ? { ...current, current: world } : null));
    },
    [setView, stageRef],
  );

  const handleTouchEnd = useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      event.evt.preventDefault();
      const stage = stageRef.current;
      if (stage) {
        stage.container().style.cursor = activeTool === "pan" ? "grab" : "default";
      }

      if (panSessionRef.current) {
        panSessionRef.current = null;
      }

      if (draftMeasurement) {
        if (Math.hypot(draftMeasurement.current.x - draftMeasurement.start.x, draftMeasurement.current.y - draftMeasurement.start.y) > 5) {
          addMeasurement(draftMeasurement.kind, draftMeasurement.start, draftMeasurement.current);
        }
        setDraftMeasurement(null);
      }

      window.requestAnimationFrame(syncTransformer);
    },
    [activeTool, addMeasurement, draftMeasurement, stageRef, syncTransformer],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const stage = stageRef.current;
      if (!stage || !containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const world = screenToWorld({ x: event.clientX - rect.left, y: event.clientY - rect.top }, view);
      const assetId = event.dataTransfer.getData("application/planuf-asset");
      const presetId = event.dataTransfer.getData("application/planuf-preset");

      if (assetId) {
        const asset = ASSET_MAP.get(assetId);
        if (asset) {
          addObjectFromAsset(asset, world);
          window.requestAnimationFrame(syncTransformer);
        }
      } else if (presetId) {
        addObjectFromPreset(presetId, world);
        window.requestAnimationFrame(syncTransformer);
      }
    },
    [addObjectFromAsset, addObjectFromPreset, stageRef, syncTransformer, view],
  );

  const coneObjects = orderedObjects.filter(
    (object) =>
      object.visible &&
      objectLayerVisible(object, layerMap) &&
      ((object.type === "camera" && object.showCone) || (object.type === "light" && object.showBeam)),
  );

  const draftRect = draftMeasurement
    ? normalizeRect({
        x: draftMeasurement.start.x,
        y: draftMeasurement.start.y,
        width: draftMeasurement.current.x - draftMeasurement.start.x,
        height: draftMeasurement.current.y - draftMeasurement.start.y,
      })
    : null;

  return (
    <div
      className="h-full w-full touch-none bg-[#bfc5ce]"
      ref={containerRef}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <Stage
        height={size.height}
        ref={handleStageReady}
        width={size.width}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
      >
        <GridLayer canvas={project.canvas} height={size.height} view={view} width={size.width} />
        <Layer listening={false}>
          <Group scaleX={view.scale} scaleY={view.scale} x={view.x} y={view.y}>
            {coneObjects.map((object) => {
              const centre = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
              if (object.type === "camera") {
                return (
                  <Wedge
                    angle={object.viewAngle}
                    fill={object.coneColor}
                    key={`cone-${object.id}`}
                    opacity={object.coneOpacity}
                    radius={object.viewDistance}
                    rotation={object.rotation - object.viewAngle / 2 - 90}
                    x={centre.x}
                    y={centre.y}
                  />
                );
              }
              if (object.type === "light") {
                return (
                  <Wedge
                    angle={object.beamAngle}
                    fill={object.beamColor}
                    key={`beam-${object.id}`}
                    opacity={object.beamOpacity}
                    radius={object.beamLength}
                    rotation={object.rotation - object.beamAngle / 2 - 90}
                    x={centre.x}
                    y={centre.y}
                  />
                );
              }
              return null;
            })}
          </Group>
        </Layer>
        <Layer>
          <Group scaleX={view.scale} scaleY={view.scale} x={view.x} y={view.y}>
            {orderedObjects.map((object) => (
              <ObjectNode
                canvas={project.canvas}
                key={object.id}
                layerLocked={objectLayerLocked(object, layerMap)}
                layerVisible={objectLayerVisible(object, layerMap)}
                object={object}
                selected={selectedSet.has(object.id)}
                onBindNode={bindNode}
                onDragEnd={endObjectDrag}
                onDragMove={moveObjectDrag}
                onDragStart={startObjectDrag}
                onSelect={handleObjectSelect}
              />
            ))}
            <Transformer
              anchorStroke="#2563eb"
              borderDash={[5, 4]}
              borderStroke="#2563eb"
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"]}
              flipEnabled={false}
              ignoreStroke
              keepRatio={false}
              ref={transformerRef}
              rotateEnabled
              onTransformEnd={handleTransformEnd}
            />
            {draftMeasurement ? (
              <Rect
                dash={[7, 5]}
                fill="rgba(8,145,178,.06)"
                height={draftRect?.height ?? 0}
                stroke="#0891b2"
                strokeWidth={1 / view.scale}
                width={draftRect?.width ?? 0}
                x={draftRect?.x ?? 0}
                y={draftRect?.y ?? 0}
              />
            ) : null}
          </Group>
        </Layer>
        <GuidesLayer guides={guides} selection={selectionRect} view={view} />
      </Stage>
    </div>
  );
}
