"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ChartSpec = {
  chart_type: string;
  title: string;
  description?: string | null;
  x_key?: string | null;
  series: Array<{ data_key: string; label: string; unit?: string | null }>;
  data: Record<string, unknown>[];
};

function toOption(spec: ChartSpec) {
  const categories = spec.x_key ? spec.data.map((row) => row[spec.x_key!]) : [];
  const isCategory = ["bar", "line", "area"].includes(spec.chart_type);
  return {
    tooltip: { trigger: isCategory ? "axis" : "item" },
    legend: { top: 0 },
    grid: { left: 24, right: 24, top: 44, bottom: 28, containLabel: true },
    xAxis: spec.chart_type === "scatter" ? { type: "value" } : { type: "category", data: categories },
    yAxis: { type: "value" },
    series: spec.series.map((s) => ({
      name: s.label,
      type: spec.chart_type === "area" ? "line" : spec.chart_type,
      smooth: spec.chart_type === "line" || spec.chart_type === "area",
      areaStyle: spec.chart_type === "area" ? {} : undefined,
      data: spec.chart_type === "scatter"
        ? spec.data.map((row) => [row[spec.x_key ?? "x"], row[s.data_key]])
        : spec.data.map((row) => row[s.data_key]),
    })),
  };
}

export function PharmaChart({ spec }: { spec: ChartSpec }) {
  return (
    <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold">{spec.title}</h3>
        {spec.description && <p className="text-sm text-muted-foreground">{spec.description}</p>}
      </div>
      <ReactECharts option={toOption(spec)} style={{ height: 360, width: "100%" }} notMerge lazyUpdate />
    </div>
  );
}
