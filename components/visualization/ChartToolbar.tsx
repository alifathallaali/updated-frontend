"use client";

export function ChartToolbar({ onExport, onAddToReport }: {
  onExport?: (format: string) => void;
  onAddToReport?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => onExport?.("png")}>Export</button>
      <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onAddToReport}>Add to report</button>
    </div>
  );
}
