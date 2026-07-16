import type { AssetCategory, AssetDefinition, PlanObjectType } from "../types/project";
import { toTitleCase } from "./id";

export const ASSET_CATEGORIES: ReadonlyArray<{ id: AssetCategory; label: string }> = [
  { id: "cameras", label: "Cameras" },
  { id: "lighting", label: "Lighting" },
  { id: "furniture", label: "Furniture" },
  { id: "set-walls", label: "Set Walls" },
  { id: "architecture", label: "Architecture" },
  { id: "props", label: "Props" },
  { id: "audio", label: "Audio" },
  { id: "grip", label: "Grip" },
  { id: "people", label: "People" },
  { id: "misc", label: "Misc" },
];

const DEFAULT_ICON_COLOR = "#000000";

const DEFAULT_CATEGORY_COLOR: Record<AssetCategory, string> = {
  cameras: DEFAULT_ICON_COLOR,
  lighting: DEFAULT_ICON_COLOR,
  furniture: DEFAULT_ICON_COLOR,
  "set-walls": DEFAULT_ICON_COLOR,
  architecture: DEFAULT_ICON_COLOR,
  props: DEFAULT_ICON_COLOR,
  audio: DEFAULT_ICON_COLOR,
  grip: DEFAULT_ICON_COLOR,
  people: DEFAULT_ICON_COLOR,
  misc: DEFAULT_ICON_COLOR,
};

const rawSvgModules = import.meta.glob<string>("../assets/icons/**/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

function inferObjectType(category: AssetCategory, slug: string): PlanObjectType {
  if (category === "cameras") {
    return "camera";
  }

  if (category === "lighting") {
    return "light";
  }

  if (category === "set-walls") {
    if (slug.includes("curved")) {
      return "curved-wall";
    }
    if (slug.includes("door")) {
      return "door";
    }
    if (slug.includes("window")) {
      return "window";
    }
    return "wall";
  }

  if (category === "furniture" && slug.includes("table")) {
    return "table";
  }

  return "asset";
}

function inferSize(category: AssetCategory, slug: string): { width: number; height: number } {
  if (category === "set-walls") {
    if (slug.includes("corner")) {
      return { width: 130, height: 130 };
    }
    if (slug.includes("door") || slug.includes("window")) {
      return { width: 96, height: 28 };
    }
    return { width: 160, height: 22 };
  }

  if (category === "cameras") {
    return { width: 74, height: 74 };
  }

  if (category === "lighting") {
    return { width: 78, height: 78 };
  }

  if (category === "furniture") {
    if (slug.includes("sofa")) {
      return { width: 116, height: 72 };
    }
    if (slug.includes("table-rect") || slug.includes("desk")) {
      return { width: 112, height: 72 };
    }
    if (slug.includes("round")) {
      return { width: 92, height: 92 };
    }
  }

  if (category === "people") {
    return { width: 48, height: 48 };
  }

  return { width: 70, height: 70 };
}

function categoryLabel(category: AssetCategory): string {
  return ASSET_CATEGORIES.find((item) => item.id === category)?.label ?? toTitleCase(category);
}

function parseAsset(path: string, svg: string): AssetDefinition | null {
  const parts = path.split("/");
  const fileName = parts.at(-1);
  const category = parts.at(-2) as AssetCategory | undefined;

  if (!fileName || !category || !ASSET_CATEGORIES.some((item) => item.id === category)) {
    return null;
  }

  const slug = fileName.replace(/\.svg$/u, "");
  const size = inferSize(category, slug);

  return {
    id: `${category}/${slug}`,
    name: toTitleCase(slug),
    category,
    categoryLabel: categoryLabel(category),
    svg,
    path,
    defaultWidth: size.width,
    defaultHeight: size.height,
    objectType: inferObjectType(category, slug),
    defaultColor: DEFAULT_CATEGORY_COLOR[category],
  };
}

export const ASSETS: AssetDefinition[] = Object.entries(rawSvgModules)
  .map(([path, svg]) => parseAsset(path, svg))
  .filter((asset): asset is AssetDefinition => asset !== null)
  .sort((first, second) => {
    const categoryDelta =
      ASSET_CATEGORIES.findIndex((item) => item.id === first.category) -
      ASSET_CATEGORIES.findIndex((item) => item.id === second.category);

    return categoryDelta === 0 ? first.name.localeCompare(second.name) : categoryDelta;
  });

export const ASSET_MAP: ReadonlyMap<string, AssetDefinition> = new Map(
  ASSETS.map((asset) => [asset.id, asset]),
);

export function findAsset(assetId: string | undefined): AssetDefinition | undefined {
  return assetId ? ASSET_MAP.get(assetId) : undefined;
}

export function colouriseSvg(svg: string, stroke: string, strokeWidth: number): string {
  return svg
    .replaceAll("currentColor", stroke)
    .replace(/stroke-width="[^"]+"/gu, `stroke-width="${Math.max(0.5, strokeWidth)}"`);
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
