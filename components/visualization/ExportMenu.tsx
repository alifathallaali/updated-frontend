'use client';

const formats = ['PNG', 'SVG', 'PDF', 'PPTX', 'XLSX', 'CSV'];
export function ExportMenu({ onSelect }: { onSelect?: (format: string) => void }) {
  return <div className="flex flex-wrap gap-2">{formats.map((f) => <button key={f} onClick={() => onSelect?.(f)} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">{f}</button>)}</div>;
}
