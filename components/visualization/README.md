# PharmaLens Visualization UI V0.2

Frontend rendering layer for the canonical PharmaLens ChartSpec.

## Integration contract

The components expect the existing application to expose the shared `ChartSpec` type at `@/lib/visualization/chart-spec`. If the current repository uses another alias/path, keep the existing alias and change only the import path; do not create a parallel visualization model.

Install the renderer in the existing frontend only if it is not already present:

- `echarts`
- `echarts-for-react`

## Design rule

These components render presentation. They do not calculate pharmaceutical metrics. Analytics and business logic remain in the existing PharmaLens backend/engines.
