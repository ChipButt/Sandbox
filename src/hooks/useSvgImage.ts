import { useEffect, useMemo, useState } from "react";
import { colouriseSvg, svgToDataUrl } from "../utils/assets";

export function useSvgImage(svg: string, stroke: string, strokeWidth: number): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const dataUrl = useMemo(() => svgToDataUrl(colouriseSvg(svg, stroke, strokeWidth)), [stroke, strokeWidth, svg]);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = dataUrl;

    return () => {
      nextImage.onload = null;
    };
  }, [dataUrl]);

  return image;
}
