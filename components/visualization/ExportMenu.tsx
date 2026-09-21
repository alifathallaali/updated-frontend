"use client";

const formats = ["png", "svg", "pdf", "pptx", "xlsx"];

export function ExportMenu({ onExport }: { onExport: (format: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {formats.map((format) => (
        <button key={format} className="rounded-md border px-3 py-1.5 text-sm" onClick={() => onExport(format)}>
          {format.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
