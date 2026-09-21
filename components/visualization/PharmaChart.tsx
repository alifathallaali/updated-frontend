'use client';

import dynamic from 'next/dynamic';
import type { EChartsOption } from 'echarts';
import type { ChartSpec } from '@/lib/visualization/chart-spec';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

function toOption(spec: ChartSpec): EChartsOption {
  const rows = spec.data ?? [];
  const xKey = spec.xKey;
  const labels = rows.map((r: any) => r[xKey]);
  const series = (spec.series ?? []).map((s: any) => ({
    name: s.label ?? s.dataKey,
    type: spec.chartType === 'line' ? 'line' : spec.chartType === 'scatter' ? 'scatter' : 'bar',
    data: rows.map((r: any) => r[s.dataKey]),
    smooth: spec.chartType === 'line',
    emphasis: { focus: 'series' },
  }));
  return {
    title: { text: spec.meta?.title, subtext: spec.meta?.description },
    tooltip: { trigger: spec.chartType === 'scatter' ? 'item' : 'axis' },
    legend: series.length > 1 ? { top: 8 } : undefined,
    grid: { left: 48, right: 24, top: 72, bottom: 44, containLabel: true },
    xAxis: { type: spec.chartType === 'scatter' ? 'value' : 'category', data: spec.chartType === 'scatter' ? undefined : labels },
    yAxis: { type: 'value' },
    series,
  };
}

export function PharmaChart({ spec }: { spec: ChartSpec }) {
  return <ReactECharts option={toOption(spec) as any} notMerge lazyUpdate style={{ height: 360, width: '100%' }} />;
}
