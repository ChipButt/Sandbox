import {
  ArrowDownToLine,
  ArrowUpToLine,
  CopyPlus,
  FlipHorizontal2,
  FlipVertical2,
  Lock,
  Unlock,
} from "lucide-react";
import type { CanvasSettings, PlanObject, PlanObjectPatch, RectBounds, RoomAreaId } from "../../types/project";
import { usePlannerStore } from "../../store/plannerStore";
import { Field, PanelSection, buttonClassName, inputClassName } from "../layout/Panel";
import {
  displayUnitsPerGridSquare,
  displayUnitsToPixels,
  createDefaultPerformanceArea,
  normalisedRoomDisplaySize,
  pixelsPerMetreForGridSquare,
  pixelsToDisplayUnits,
  roomAreaBounds,
  roomWithAreaBounds,
  unitLabel,
} from "../../utils/scale";

function toNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatInputNumber(value: number): number {
  if (Number.isInteger(value)) {
    return value;
  }

  return Math.abs(value) < 1 ? Number(value.toFixed(3)) : Number(value.toFixed(2));
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      className={inputClassName}
      max={max}
      min={min}
      step={step}
      type="number"
      value={formatInputNumber(value)}
      onChange={(event) => onChange(toNumber(event.target.value, value))}
    />
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded border border-black/10 bg-white px-2 py-1.5 text-[12px] text-ink-800">
      <span>{label}</span>
      <input className="h-4 w-4 accent-signal-blue" checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input className="h-7 w-9 rounded border border-black/15 bg-white p-0.5" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <input className={inputClassName} value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </Field>
  );
}

function DocumentProperties({ canvas }: { canvas: CanvasSettings }) {
  const project = usePlannerStore((state) => state.project);
  const selectedRoomArea = usePlannerStore((state) => state.selectedRoomArea);
  const selectRoomArea = usePlannerStore((state) => state.selectRoomArea);
  const setProjectName = usePlannerStore((state) => state.setProjectName);
  const setCanvas = usePlannerStore((state) => state.setCanvas);
  const currentUnitLabel = unitLabel(canvas.unit);
  const roomWidth = normalisedRoomDisplaySize(pixelsToDisplayUnits(canvas.room.width, canvas));
  const roomHeight = normalisedRoomDisplaySize(pixelsToDisplayUnits(canvas.room.height, canvas));
  const unitsPerSquare = displayUnitsPerGridSquare(canvas);
  const roomGridX = canvas.room.x / canvas.gridSize;
  const roomGridY = canvas.room.y / canvas.gridSize;
  const roomGridWidth = canvas.room.width / canvas.gridSize;
  const roomGridHeight = canvas.room.height / canvas.gridSize;
  const updateRoom = (room: Partial<CanvasSettings["room"]>): void => {
    setCanvas({
      room: {
        ...canvas.room,
        ...room,
      },
    });
  };
  const centreRoom = (): void => {
    updateRoom({
      x: (canvas.width - canvas.room.width) / 2,
      y: (canvas.height - canvas.room.height) / 2,
    });
  };
  const setUnitsPerSquare = (value: number): void => {
    setCanvas({
      pixelsPerUnit: pixelsPerMetreForGridSquare(canvas.gridSize, value, canvas.unit),
    });
  };
  const setRoomDisplaySize = (axis: "width" | "height", value: number): void => {
    updateRoom({
      [axis]: displayUnitsToPixels(value, canvas),
    });
  };
  const markPerformanceArea = (): void => {
    updateRoom({
      areaMode: "vertical",
      performanceArea: createDefaultPerformanceArea(canvas.room),
    });
    selectRoomArea("performance");
  };
  const areaButtonClassName = (area: RoomAreaId): string =>
    `${buttonClassName} ${selectedRoomArea === area ? "border-signal-blue bg-blue-50 text-signal-blue" : ""}`;

  return (
    <>
      <PanelSection title="Document Properties">
        <div className="grid gap-2">
          <Field label="Name">
            <input className={inputClassName} value={project.metadata.name} onChange={(event) => setProjectName(event.target.value)} />
          </Field>
          <Field label="Canvas W">
            <NumberInput min={400} value={canvas.width} onChange={(value) => setCanvas({ width: value })} />
          </Field>
          <Field label="Canvas H">
            <NumberInput min={400} value={canvas.height} onChange={(value) => setCanvas({ height: value })} />
          </Field>
          <Field label="Grid Size">
            <NumberInput min={4} value={canvas.gridSize} onChange={(value) => setCanvas({ gridSize: value })} />
          </Field>
          <ColorField label="Room Fill" value={canvas.background} onChange={(value) => setCanvas({ background: value })} />
          <Field label="Units">
            <select
              className={inputClassName}
              value={canvas.unit}
              onChange={(event) => setCanvas({ unit: event.target.value === "imperial" ? "imperial" : "metric" })}
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </Field>
          <Field label="1 square">
            <div className="flex items-center gap-2">
              <NumberInput min={0.001} step={0.01} value={unitsPerSquare} onChange={setUnitsPerSquare} />
              <span className="w-7 text-[12px] text-ink-600">{currentUnitLabel}</span>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <CheckboxField label="Grid" checked={canvas.gridVisible} onChange={(checked) => setCanvas({ gridVisible: checked })} />
            <CheckboxField label="Snap" checked={canvas.snapEnabled} onChange={(checked) => setCanvas({ snapEnabled: checked })} />
            <CheckboxField label="Objects" checked={canvas.snapToObjects} onChange={(checked) => setCanvas({ snapToObjects: checked })} />
            <CheckboxField label="Centres" checked={canvas.snapToCenters} onChange={(checked) => setCanvas({ snapToCenters: checked })} />
            <CheckboxField label="Guides" checked={canvas.smartGuides} onChange={(checked) => setCanvas({ smartGuides: checked })} />
          </div>
        </div>
      </PanelSection>
      <PanelSection
        action={
          <button className={buttonClassName} type="button" onClick={centreRoom}>
            Centre
          </button>
        }
        title="Room Areas"
      >
        <div className="grid gap-2">
          <CheckboxField label="Show Room" checked={canvas.room.visible} onChange={(checked) => updateRoom({ visible: checked })} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Room X Sq">
              <NumberInput step={1} value={roomGridX} onChange={(value) => updateRoom({ x: value * canvas.gridSize })} />
            </Field>
            <Field label="Room Y Sq">
              <NumberInput step={1} value={roomGridY} onChange={(value) => updateRoom({ y: value * canvas.gridSize })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={`Room W (${currentUnitLabel})`}>
              <NumberInput min={0.1} step={0.1} value={roomWidth} onChange={(value) => setRoomDisplaySize("width", value)} />
            </Field>
            <Field label={`Room H (${currentUnitLabel})`}>
              <NumberInput min={0.1} step={0.1} value={roomHeight} onChange={(value) => setRoomDisplaySize("height", value)} />
            </Field>
          </div>
          <Field label="Grid Count">
            <input className={inputClassName} readOnly value={`${formatInputNumber(roomGridWidth)} x ${formatInputNumber(roomGridHeight)} squares`} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <button className={areaButtonClassName("crew")} type="button" onClick={() => selectRoomArea("crew")}>
              Crew
            </button>
            <button
              className={areaButtonClassName("performance")}
              type="button"
              onClick={() => {
                if (canvas.room.performanceArea) {
                  selectRoomArea("performance");
                } else {
                  markPerformanceArea();
                }
              }}
            >
              {canvas.room.performanceArea ? "Performance" : "Mark Performance"}
            </button>
          </div>
          <Field label="Performance">
            <input className={inputClassName} value={canvas.room.performanceLabel} onChange={(event) => updateRoom({ performanceLabel: event.target.value })} />
          </Field>
          <Field label="Crew">
            <input className={inputClassName} value={canvas.room.crewLabel} onChange={(event) => updateRoom({ crewLabel: event.target.value })} />
          </Field>
          <ColorField label="Perf Color" value={canvas.room.performanceColor} onChange={(value) => updateRoom({ performanceColor: value })} />
          <ColorField label="Crew Color" value={canvas.room.crewColor} onChange={(value) => updateRoom({ crewColor: value })} />
        </div>
      </PanelSection>
    </>
  );
}

function RoomAreaProperties({ canvas, area }: { canvas: CanvasSettings; area: RoomAreaId }) {
  const setCanvas = usePlannerStore((state) => state.setCanvas);
  const room = canvas.room;
  const currentUnitLabel = unitLabel(canvas.unit);
  const isPerformance = area === "performance";
  const hasPerformanceArea = room.performanceArea !== null;
  const bounds = isPerformance && !hasPerformanceArea ? null : roomAreaBounds(room, area);
  const areaLabel = isPerformance ? room.performanceLabel : room.crewLabel;
  const areaColor = isPerformance ? room.performanceColor : room.crewColor;
  const updateRoom = (patch: Partial<CanvasSettings["room"]>): void => {
    setCanvas({
      room: {
        ...room,
        ...patch,
      },
    });
  };
  const markPerformanceArea = (): void => {
    updateRoom({
      areaMode: "vertical",
      performanceArea: createDefaultPerformanceArea(room),
    });
  };
  const updateAreaBounds = (nextBounds: RectBounds): void => {
    setCanvas({
      room: roomWithAreaBounds(room, area, nextBounds, canvas.gridSize),
    });
  };
  const updateAreaLabel = (value: string): void => {
    updateRoom(isPerformance ? { performanceLabel: value } : { crewLabel: value });
  };
  const updateAreaColor = (value: string): void => {
    updateRoom(isPerformance ? { performanceColor: value } : { crewColor: value });
  };
  const updateGridPosition = (axis: "x" | "y", value: number): void => {
    if (!bounds) {
      return;
    }

    const absoluteValue = isPerformance ? room[axis] + value * canvas.gridSize : value * canvas.gridSize;
    updateAreaBounds({
      ...bounds,
      [axis]: absoluteValue,
    });
  };
  const updateDisplaySize = (axis: "width" | "height", value: number): void => {
    if (!bounds) {
      return;
    }

    updateAreaBounds({
      ...bounds,
      [axis]: displayUnitsToPixels(value, canvas),
    });
  };
  const clearPerformanceArea = (): void => {
    updateRoom({ areaMode: "none", performanceArea: null });
  };
  const gridX = bounds ? (isPerformance ? (bounds.x - room.x) / canvas.gridSize : bounds.x / canvas.gridSize) : 0;
  const gridY = bounds ? (isPerformance ? (bounds.y - room.y) / canvas.gridSize : bounds.y / canvas.gridSize) : 0;
  const widthUnits = bounds ? normalisedRoomDisplaySize(pixelsToDisplayUnits(bounds.width, canvas)) : 0;
  const heightUnits = bounds ? normalisedRoomDisplaySize(pixelsToDisplayUnits(bounds.height, canvas)) : 0;

  return (
    <PanelSection title={isPerformance ? "Performance Area" : "Crew Area"}>
      <div className="grid gap-2">
        {isPerformance && !hasPerformanceArea ? (
          <button className={buttonClassName} type="button" onClick={markPerformanceArea}>
            Mark Performance
          </button>
        ) : null}
        <Field label="Label">
          <input className={inputClassName} value={areaLabel} onChange={(event) => updateAreaLabel(event.target.value)} />
        </Field>
        <ColorField label="Colour" value={areaColor} onChange={updateAreaColor} />
        {bounds ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Field label={isPerformance ? "Area X Sq" : "Room X Sq"}>
                <NumberInput step={1} value={gridX} onChange={(value) => updateGridPosition("x", value)} />
              </Field>
              <Field label={isPerformance ? "Area Y Sq" : "Room Y Sq"}>
                <NumberInput step={1} value={gridY} onChange={(value) => updateGridPosition("y", value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label={`Area W (${currentUnitLabel})`}>
                <NumberInput min={0.1} step={0.1} value={widthUnits} onChange={(value) => updateDisplaySize("width", value)} />
              </Field>
              <Field label={`Area H (${currentUnitLabel})`}>
                <NumberInput min={0.1} step={0.1} value={heightUnits} onChange={(value) => updateDisplaySize("height", value)} />
              </Field>
            </div>
            <Field label="Grid Count">
              <input
                className={inputClassName}
                readOnly
                value={`${formatInputNumber(bounds.width / canvas.gridSize)} x ${formatInputNumber(bounds.height / canvas.gridSize)} squares`}
              />
            </Field>
          </>
        ) : null}
        {isPerformance && hasPerformanceArea ? (
          <button className={buttonClassName} type="button" onClick={clearPerformanceArea}>
            Clear Performance
          </button>
        ) : null}
      </div>
    </PanelSection>
  );
}

function ActionButtons({ object }: { object?: PlanObject }) {
  const duplicateSelected = usePlannerStore((state) => state.duplicateSelected);
  const bringForward = usePlannerStore((state) => state.bringForward);
  const sendBackward = usePlannerStore((state) => state.sendBackward);
  const flipSelected = usePlannerStore((state) => state.flipSelected);
  const updateObject = usePlannerStore((state) => state.updateObject);
  const updateSelected = usePlannerStore((state) => state.updateSelected);
  const locked = object?.locked ?? false;

  return (
    <div className="grid grid-cols-2 gap-2">
      <button className={buttonClassName} type="button" onClick={duplicateSelected}>
        <CopyPlus className="h-3.5 w-3.5" />
        Duplicate
      </button>
      <button
        className={buttonClassName}
        type="button"
        onClick={() => {
          if (object) {
            updateObject(object.id, { locked: !object.locked });
          } else {
            updateSelected({ locked: true });
          }
        }}
      >
        {locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        {object ? (locked ? "Unlock" : "Lock") : "Lock"}
      </button>
      <button className={buttonClassName} type="button" onClick={bringForward}>
        <ArrowUpToLine className="h-3.5 w-3.5" />
        Forward
      </button>
      <button className={buttonClassName} type="button" onClick={sendBackward}>
        <ArrowDownToLine className="h-3.5 w-3.5" />
        Back
      </button>
      <button className={buttonClassName} type="button" onClick={() => flipSelected("x")}>
        <FlipHorizontal2 className="h-3.5 w-3.5" />
        Flip H
      </button>
      <button className={buttonClassName} type="button" onClick={() => flipSelected("y")}>
        <FlipVertical2 className="h-3.5 w-3.5" />
        Flip V
      </button>
    </div>
  );
}

function ObjectProperties({ object }: { object: PlanObject }) {
  const project = usePlannerStore((state) => state.project);
  const updateObject = usePlannerStore((state) => state.updateObject);

  const update = (patch: PlanObjectPatch): void => updateObject(object.id, patch);
  const scaleX = object.width / object.baseWidth;
  const scaleY = object.height / object.baseHeight;

  return (
    <PanelSection title="Object Properties">
      <div className="grid gap-2">
        <ActionButtons object={object} />
        <Field label="Name">
          <input className={inputClassName} value={object.name} onChange={(event) => update({ name: event.target.value })} />
        </Field>
        <Field label="Layer">
          <select className={inputClassName} value={object.layerId} onChange={(event) => update({ layerId: event.target.value })}>
            {project.layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="X">
            <NumberInput value={object.x} onChange={(value) => update({ x: value })} />
          </Field>
          <Field label="Y">
            <NumberInput value={object.y} onChange={(value) => update({ y: value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width">
            <NumberInput min={1} value={object.width} onChange={(value) => update({ width: object.type === "table" && object.tableShape === "round" ? value : value, height: object.type === "table" && object.tableShape === "round" ? value : object.height })} />
          </Field>
          <Field label="Height">
            <NumberInput min={1} value={object.height} onChange={(value) => update({ height: object.type === "table" && object.tableShape === "round" ? value : value, width: object.type === "table" && object.tableShape === "round" ? value : object.width })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Scale X">
            <NumberInput min={0.05} step={0.05} value={scaleX} onChange={(value) => update({ width: object.baseWidth * value })} />
          </Field>
          <Field label="Scale Y">
            <NumberInput min={0.05} step={0.05} value={scaleY} onChange={(value) => update({ height: object.baseHeight * value })} />
          </Field>
        </div>
        <Field label="Rotation">
          <NumberInput step={1} value={object.rotation} onChange={(value) => update({ rotation: value })} />
        </Field>
        <Field label="Opacity">
          <input className="h-7 w-full accent-signal-blue" max={1} min={0} step={0.01} type="range" value={object.opacity} onChange={(event) => update({ opacity: toNumber(event.target.value, object.opacity) })} />
        </Field>
        <ColorField label="Colour" value={object.stroke} onChange={(value) => update({ stroke: value })} />
        <ColorField label="Fill" value={object.fill === "transparent" ? "#ffffff" : object.fill} onChange={(value) => update({ fill: value })} />
        <Field label="Outline">
          <NumberInput min={0} value={object.strokeWidth} onChange={(value) => update({ strokeWidth: value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <CheckboxField label="Locked" checked={object.locked} onChange={(checked) => update({ locked: checked })} />
          <CheckboxField label="Visible" checked={object.visible} onChange={(checked) => update({ visible: checked })} />
        </div>

        {object.type === "camera" ? (
          <div className="grid gap-2 rounded border border-blue-200 bg-blue-50 p-2">
            <Field label="View Angle">
              <NumberInput min={5} max={170} value={object.viewAngle} onChange={(value) => update({ viewAngle: value })} />
            </Field>
            <Field label="Distance">
              <NumberInput min={20} value={object.viewDistance} onChange={(value) => update({ viewDistance: value })} />
            </Field>
            <ColorField label="Cone" value={object.coneColor} onChange={(value) => update({ coneColor: value })} />
            <Field label="Cone Opacity">
              <NumberInput min={0} max={1} step={0.05} value={object.coneOpacity} onChange={(value) => update({ coneOpacity: value })} />
            </Field>
            <CheckboxField label="Show Cone" checked={object.showCone} onChange={(checked) => update({ showCone: checked })} />
          </div>
        ) : null}

        {object.type === "light" ? (
          <div className="grid gap-2 rounded border border-amber-200 bg-amber-50 p-2">
            <Field label="Beam Angle">
              <NumberInput min={5} max={170} value={object.beamAngle} onChange={(value) => update({ beamAngle: value })} />
            </Field>
            <Field label="Beam Length">
              <NumberInput min={20} value={object.beamLength} onChange={(value) => update({ beamLength: value })} />
            </Field>
            <ColorField label="Beam" value={object.beamColor} onChange={(value) => update({ beamColor: value })} />
            <Field label="Beam Opacity">
              <NumberInput min={0} max={1} step={0.05} value={object.beamOpacity} onChange={(value) => update({ beamOpacity: value })} />
            </Field>
            <CheckboxField label="Show Beam" checked={object.showBeam} onChange={(checked) => update({ showBeam: checked })} />
          </div>
        ) : null}

        {(object.type === "wall" || object.type === "curved-wall" || object.type === "door" || object.type === "window") ? (
          <div className="grid gap-2 rounded border border-black/10 bg-white p-2">
            <Field label="Thickness">
              <NumberInput min={2} value={object.thickness} onChange={(value) => update({ thickness: value, height: value })} />
            </Field>
            {object.type === "curved-wall" ? (
              <Field label="Curvature">
                <NumberInput min={0.1} max={1.5} step={0.05} value={object.curvature} onChange={(value) => update({ curvature: value })} />
              </Field>
            ) : null}
          </div>
        ) : null}

        {object.type === "table" ? (
          <div className="grid gap-2 rounded border border-black/10 bg-white p-2">
            <Field label="Shape">
              <select className={inputClassName} value={object.tableShape} onChange={(event) => update({ tableShape: event.target.value === "round" ? "round" : "rect" })}>
                <option value="rect">Rectangular</option>
                <option value="round">Round</option>
              </select>
            </Field>
            <CheckboxField label="Keep proportions" checked={object.keepProportions} onChange={(checked) => update({ keepProportions: checked })} />
          </div>
        ) : null}

        <label className="grid gap-1 text-[12px] text-ink-700">
          <span>Notes</span>
          <textarea className={`${inputClassName} h-20 resize-none py-1.5`} value={object.notes} onChange={(event) => update({ notes: event.target.value })} />
        </label>
      </div>
    </PanelSection>
  );
}

function MultiObjectProperties({ count }: { count: number }) {
  const updateSelected = usePlannerStore((state) => state.updateSelected);

  return (
    <PanelSection title="Selection">
      <div className="grid gap-2">
        <p className="text-[12px] text-ink-600">{count} objects selected</p>
        <ActionButtons />
        <ColorField label="Colour" value="#2563eb" onChange={(value) => updateSelected({ stroke: value })} />
        <Field label="Opacity">
          <input className="h-7 w-full accent-signal-blue" max={1} min={0} step={0.01} type="range" defaultValue={1} onChange={(event) => updateSelected({ opacity: toNumber(event.target.value, 1) })} />
        </Field>
      </div>
    </PanelSection>
  );
}

export function PropertiesPanel() {
  const project = usePlannerStore((state) => state.project);
  const selectedIds = usePlannerStore((state) => state.selectedIds);
  const selectedRoomArea = usePlannerStore((state) => state.selectedRoomArea);
  const selectedObjects = project.objects.filter((object) => selectedIds.includes(object.id));

  if (selectedObjects.length === 0) {
    return (
      <>
        {selectedRoomArea ? <RoomAreaProperties area={selectedRoomArea} canvas={project.canvas} /> : null}
        <DocumentProperties canvas={project.canvas} />
      </>
    );
  }

  if (selectedObjects.length > 1) {
    return <MultiObjectProperties count={selectedObjects.length} />;
  }

  const object = selectedObjects[0];
  return object ? <ObjectProperties object={object} /> : <DocumentProperties canvas={project.canvas} />;
}
