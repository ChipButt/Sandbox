import type Konva from "konva";
import type { AssetDefinition, CanvasSettings, PlanObject, PlanufProject } from "../types/project";
import { findAsset } from "./assets";
import { downloadTextFile } from "./file";
import { formatMeasurement } from "./geometry";
import { roomAreaBounds } from "./scale";

export interface PngExportOptions {
  transparent: boolean;
  pixelRatio: number;
  fileName: string;
}

function triggerDataUrlDownload(dataUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

export function exportStageToPng(stage: Konva.Stage, options: PngExportOptions): void {
  const previousFill = stage.container().style.backgroundColor;
  const backgroundNodes = stage.find(".canvas-background");
  const gridNodes = stage.find(".canvas-grid");
  const roomNodes = [...stage.find(".room-area-fill"), ...stage.find(".room-area-label"), ...stage.find(".room-area-border")];
  const hiddenNodes = [...backgroundNodes, ...gridNodes, ...roomNodes];
  const previousVisibility = hiddenNodes.map((node) => node.visible());
  if (options.transparent) {
    stage.container().style.backgroundColor = "transparent";
    hiddenNodes.forEach((node) => node.visible(false));
  }

  stage.draw();
  const dataUrl = stage.toDataURL({
    pixelRatio: options.pixelRatio,
    mimeType: "image/png",
  });

  stage.container().style.backgroundColor = previousFill;
  hiddenNodes.forEach((node, index) => node.visible(previousVisibility[index] ?? true));
  stage.draw();
  triggerDataUrlDownload(dataUrl, options.fileName);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function assetSvg(object: PlanObject): string {
  const asset: AssetDefinition | undefined = findAsset(object.assetId);
  return asset?.svg ?? object.assetSvg ?? "";
}

function objectToSvg(object: PlanObject, canvas: CanvasSettings): string {
  if (!object.visible) {
    return "";
  }

  const opacity = object.opacity.toFixed(3);
  const transform = `translate(${object.x + object.width / 2} ${object.y + object.height / 2}) rotate(${object.rotation}) scale(${object.flipX ? -1 : 1} ${object.flipY ? -1 : 1}) translate(${-object.width / 2} ${-object.height / 2})`;

  if (object.type === "measurement") {
    const length = Math.hypot(object.width, object.height);
    const label = object.label || formatMeasurement(length, canvas);
    return `<g opacity="${opacity}"><line x1="${object.x}" y1="${object.y}" x2="${object.x + object.width}" y2="${object.y + object.height}" stroke="${object.stroke}" stroke-width="${object.strokeWidth}" marker-start="url(#arrow)" marker-end="url(#arrow)"/><text x="${object.x + object.width / 2}" y="${object.y + object.height / 2 - 8}" fill="${object.stroke}" font-size="18" text-anchor="middle">${escapeXml(label)}</text></g>`;
  }

  if (object.type === "wall") {
    return `<rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" rx="2" fill="${object.stroke}" opacity="${opacity}" transform="rotate(${object.rotation} ${object.x + object.width / 2} ${object.y + object.height / 2})"/>`;
  }

  if (object.type === "curved-wall") {
    const path = `M ${object.x} ${object.y + object.height} Q ${object.x + object.width * object.curvature} ${object.y - object.height * 3} ${object.x + object.width} ${object.y + object.height}`;
    return `<path d="${path}" fill="none" stroke="${object.stroke}" stroke-width="${object.thickness}" stroke-linecap="round" opacity="${opacity}" transform="rotate(${object.rotation} ${object.x + object.width / 2} ${object.y + object.height / 2})"/>`;
  }

  if (object.type === "table" && object.tableShape === "round") {
    return `<ellipse cx="${object.x + object.width / 2}" cy="${object.y + object.height / 2}" rx="${object.width / 2}" ry="${object.height / 2}" fill="${object.fill}" stroke="${object.stroke}" stroke-width="${object.strokeWidth}" opacity="${opacity}" transform="rotate(${object.rotation} ${object.x + object.width / 2} ${object.y + object.height / 2})"/>`;
  }

  const rawSvg = assetSvg(object).replaceAll("currentColor", object.stroke);
  const encoded = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(rawSvg)))}`;
  const image = `<image href="${encoded}" x="0" y="0" width="${object.width}" height="${object.height}" preserveAspectRatio="none"/>`;

  return `<g opacity="${opacity}" transform="${transform}">${image}</g>`;
}

function roomToSvg(canvas: CanvasSettings): string {
  const { room } = canvas;

  if (!room.visible) {
    return `<rect x="0" y="0" width="${canvas.width}" height="${canvas.height}" fill="${canvas.background}"/>`;
  }

  const crewBounds = roomAreaBounds(room, "crew");
  const performanceBounds = room.performanceArea ? roomAreaBounds(room, "performance") : null;
  const performanceSvg = performanceBounds
    ? `<rect x="${performanceBounds.x}" y="${performanceBounds.y}" width="${performanceBounds.width}" height="${performanceBounds.height}" fill="${room.performanceColor}" opacity=".7" stroke="#38bdf8" stroke-width="1"/>
  <text x="${performanceBounds.x + performanceBounds.width / 2}" y="${performanceBounds.y + 46}" fill="${room.labelColor}" font-size="26" text-anchor="middle">${escapeXml(room.performanceLabel)}</text>`
    : "";

  return `<rect x="${crewBounds.x}" y="${crewBounds.y}" width="${crewBounds.width}" height="${crewBounds.height}" fill="${canvas.background}" stroke="#334155" stroke-width="3"/>
  <rect x="${crewBounds.x}" y="${crewBounds.y}" width="${crewBounds.width}" height="${crewBounds.height}" fill="${room.crewColor}" opacity=".55"/>
  <text x="${crewBounds.x + crewBounds.width / 2}" y="${crewBounds.y + crewBounds.height - 30}" fill="${room.labelColor}" font-size="26" text-anchor="middle">${escapeXml(room.crewLabel)}</text>
  ${performanceSvg}
  <rect x="${crewBounds.x}" y="${crewBounds.y}" width="${crewBounds.width}" height="${crewBounds.height}" fill="none" stroke="#334155" stroke-width="3"/>`;
}

export function projectToSvg(project: PlanufProject): string {
  const { canvas } = project;
  const background = canvas.background === "transparent" ? "" : roomToSvg(canvas);
  const objects = project.objects.map((object) => objectToSvg(object, canvas)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2"/>
    </marker>
  </defs>
  ${background}
  ${objects}
</svg>`;
}

export function exportProjectSvg(project: PlanufProject): void {
  downloadTextFile(`${project.metadata.name.replace(/\s+/gu, "-").toLowerCase()}.svg`, projectToSvg(project), "image/svg+xml");
}

export async function exportStageToPdf(stage: Konva.Stage, project: PlanufProject, size: "a4" | "a3"): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: size,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const image = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
  pdf.addImage(image, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
  pdf.save(`${project.metadata.name.replace(/\s+/gu, "-").toLowerCase()}-${size.toUpperCase()}.pdf`);
}
