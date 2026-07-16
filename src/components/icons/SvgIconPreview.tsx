interface SvgIconPreviewProps {
  svg: string;
  color: string;
  className?: string;
}

export function SvgIconPreview({ svg, color, className = "" }: SvgIconPreviewProps) {
  return (
    <span
      aria-hidden="true"
      className={`block ${className}`}
      style={{ color }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
