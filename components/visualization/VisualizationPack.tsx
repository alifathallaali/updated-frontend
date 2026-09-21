'use client';
import { ChartContainer } from './ChartContainer';
import { ChartToolbar } from './ChartToolbar';
import { PharmaChart } from './PharmaChart';
import type { ChartSpec } from '@/lib/visualization/chart-spec';

export function VisualizationPack({ charts, onExport, onAddToReport }: { charts: ChartSpec[]; onExport?: (chart: ChartSpec) => void; onAddToReport?: (chart: ChartSpec) => void }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {charts.map((chart) => (
        <ChartContainer key={chart.chartId} title={chart.meta?.title} description={chart.meta?.description}
          toolbar={<ChartToolbar onExport={() => onExport?.(chart)} onAddToReport={() => onAddToReport?.(chart)} />}>
          <PharmaChart spec={chart} />
        </ChartContainer>
      ))}
    </div>
  );
}
