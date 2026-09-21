import { ChartContainer } from "./ChartContainer";

export function VisualizationPack({ result }: { result: { charts: any[] } }) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {result.charts.map((chart) => <ChartContainer key={chart.chart_id} spec={chart} />)}
      </div>
    </section>
  );
}
