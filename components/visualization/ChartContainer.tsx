'use client';
import { ReactNode } from 'react';

export function ChartContainer({ title, description, children, toolbar }: { title?: string; description?: string; children: ReactNode; toolbar?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {title && <h3 className="text-base font-semibold tracking-tight">{title}</h3>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {toolbar}
      </div>
      {children}
    </section>
  );
}
