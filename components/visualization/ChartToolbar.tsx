'use client';

export function ChartToolbar({ onExport, onAddToReport }: { onExport?: () => void; onAddToReport?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted" onClick={onAddToReport}>Add to report</button>
      <button className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted" onClick={onExport}>Export</button>
    </div>
  );
}
