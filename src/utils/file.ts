import { isPlanufProject } from "../types/guards";
import type { PlanufProject } from "../types/project";

export const PLANUF_EXTENSION = "planufset";
export const AUTOSAVE_KEY = "planuf-set-planner.autosave.v1";

export function serialiseProject(project: PlanufProject): string {
  return JSON.stringify(project, null, 2);
}

export function parseProjectFile(source: string): PlanufProject {
  const parsed: unknown = JSON.parse(source);

  if (!isPlanufProject(parsed)) {
    throw new Error("This file is not a valid Planuf Set Planner project.");
  }

  return parsed;
}

export function downloadTextFile(fileName: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function projectFileName(project: PlanufProject): string {
  const safeName = project.metadata.name
    .trim()
    .replace(/[^\w\s-]/gu, "")
    .replace(/\s+/gu, "-")
    .toLowerCase();

  return `${safeName || "planuf-set"}.${PLANUF_EXTENSION}`;
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the selected file."));
      }
    });
    reader.addEventListener("error", () => reject(new Error("Could not read the selected file.")));
    reader.readAsText(file);
  });
}
