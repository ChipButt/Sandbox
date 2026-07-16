import type { ReactNode } from "react";

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function PanelSection({ title, children, action }: PanelSectionProps) {
  return (
    <section className="border-b border-black/10">
      <div className="flex h-9 items-center justify-between gap-2 border-b border-black/5 px-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-700">{title}</h2>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="grid grid-cols-[94px_minmax(0,1fr)] items-center gap-2 text-[12px] text-ink-700">
      <span className="truncate">{label}</span>
      {children}
    </label>
  );
}

export const inputClassName =
  "h-7 w-full rounded border border-black/15 bg-white px-2 text-[12px] text-ink-900 shadow-sm transition focus:border-signal-blue";

export const buttonClassName =
  "inline-flex h-7 items-center justify-center gap-1.5 rounded border border-black/15 bg-white px-2 text-[12px] font-medium text-ink-800 shadow-sm transition hover:bg-ink-100 active:bg-[#dfe5eb] disabled:cursor-not-allowed disabled:opacity-45";
