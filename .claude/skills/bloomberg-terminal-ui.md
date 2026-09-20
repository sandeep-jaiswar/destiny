# Bloomberg Terminal UI Design System

Guidelines for building new panels and components for the destiny terminal.

## Dark Theme Palette

All colors defined in `apps/terminal/app/globals.css`. Use Tailwind color tokens:

```css
:root {
  --bg-primary: #09090b;    /* zinc-950 */
  --bg-secondary: #18181b;  /* zinc-900 */
  --bg-tertiary: #27272a;   /* zinc-800 */
  
  --border: #3f3f46;        /* zinc-700 */
  --border-subtle: #27272a; /* zinc-800 */
  
  --text-primary: #fafafa;  /* zinc-50 */
  --text-secondary: #a1a1a6; /* zinc-400 */
  --text-muted: #71717a;    /* zinc-500 */
  
  --positive: #4ade80;      /* green-400 */
  --negative: #f87171;      /* red-400 */
  --neutral: #a1a1a6;       /* zinc-400 */
}
```

Apply via Tailwind classes: `bg-zinc-950`, `text-zinc-400`, etc.

## Core Primitives

All in `packages/ui/src/`:

### Panel

Bordered container with optional title bar. Always dark.

```tsx
<Panel title="Symbol Info">
  {/* content */}
</Panel>
```

CSS: `border-zinc-800 bg-zinc-950` with `bg-zinc-900` title bar.

### MonoNumber

Monospace numeric display with tabular-nums alignment, ±coloring.

```tsx
<MonoNumber value={12345.67} decimals={2} size="md" />  /* green if positive, red if negative */
<MonoNumber value={-1.5} change={-1.5} />               /* shows percentage change */
```

**Key**: always use `font-mono` + `tabular-nums` for decimal alignment.

### DataGrid

Sortable table with keyboard navigation (arrow keys, enter to select).

```tsx
const columns: DataGridColumn<MyData>[] = [
  { key: "symbol", label: "Symbol", width: "80px" },
  {
    key: "price",
    label: "Price",
    render: (v) => <MonoNumber value={v} decimals={2} />
  }
];

<DataGrid data={rows} columns={columns} onRowClick={handleSelect} maxHeight="200px" />
```

Striped rows, hover highlight, selected row highlight.

### CommandInput

Styled text input for command entry.

```tsx
<CommandInput
  value={input}
  onChange={setInput}
  onSubmit={(val) => console.log(val)}
  placeholder="Enter symbol..."
/>
```

Focus: `focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600`.

## Panel Conventions

### Watchlist (Left Sidebar)

- Fixed width (col-span-2 in 12-column grid)
- Persistent in `localStorage` (key: `"watchlist"`)
- Each row is clickable, sets active symbol
- Add/remove buttons

### Chart Panel (Center, Large)

- Flex-1 to fill available height
- Placeholder for lightweight-charts integration
- Volume histogram below candlesticks

### Quote Panel (Right, Top)

- Dense key-value grid, 2 columns
- All numerics via `<MonoNumber>`
- Reads from `/api/equity/[symbol]/quote`

### Movers Grid (Right, Bottom)

- Sortable DataGrid
- Columns: Symbol, Price, Volume, % Change
- Reads from `/api/market/movers` (future endpoint)

## Layout Grid

Terminal layout is 12-column CSS Grid:

```tsx
<div className="grid grid-cols-12 gap-1 p-1">
  {/* Watchlist: cols 1-2 */}
  <div className="col-span-2">
    <Watchlist />
  </div>
  
  {/* Chart: cols 3-7 */}
  <div className="col-span-5">
    <ChartPanel />
  </div>
  
  {/* Right sidebar: cols 8-12 */}
  <div className="col-span-5 flex flex-col gap-1">
    <div className="h-1/3">
      <QuotePanel />
    </div>
    <div className="h-2/3">
      <MoversGrid />
    </div>
  </div>
</div>
```

Proportions:
- Watchlist: narrow sidebar (2/12 ≈ 17%)
- Chart: main focus (5/12 ≈ 42%)
- Quote + Movers: right panel (5/12 ≈ 42%)

## Typography

- **Body**: `font-sans` (system font), `text-sm`, `text-zinc-300`
- **Labels**: `text-xs`, `text-zinc-500`, uppercase for headers
- **Numeric**: `font-mono`, `text-sm`, **always `tabular-nums` via `style={{ fontVariantNumeric: "tabular-nums" }}`**
- **Titles**: `font-mono`, `text-xs`, `font-semibold`

## Responsive

Primary breakpoint: 12-column grid is fixed-width for a terminal (no responsive shrinking).

For mobile (future): consider a stacked layout with modal/tab-based panels.

## Component Reuse

- **TerminalContext**: `useTerminal()` hook for active symbol, date range
- **@destiny/duckdb-lake**: for API calls (`equity.getOhlc()`, etc.)
- **@repo/ui**: primitives (Panel, MonoNumber, DataGrid, CommandInput)

## Adding a New Panel

1. Create `apps/terminal/app/components/panels/MyPanel.tsx`
2. Import `{ useTerminal }` for context, `{ Panel, MonoNumber }` from `@repo/ui`
3. Fetch data from `/api/my-endpoint` in `useEffect`
4. Wrap content in `<Panel title="My Panel">`
5. Register in `apps/terminal/app/(terminal)/layout.tsx` grid

Example:

```tsx
import { useTerminal } from "../../context/terminal-context";
import { Panel, MonoNumber } from "@repo/ui";

export const MyPanel: React.FC = () => {
  const { activeSymbol } = useTerminal();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(`/api/my-endpoint/${activeSymbol}`).then(r => r.json()).then(setData);
  }, [activeSymbol]);
  
  return (
    <Panel title={`My Panel — ${activeSymbol}`}>
      {data && <div>{/* render */}</div>}
    </Panel>
  );
};
```

## Performance

- **Watchlist polling**: 15s interval (EOD-cadence data, no need for faster)
- **Chart auto-refresh**: on symbol change only (manual date-range selection)
- **Quote polling**: on symbol change + 30s interval
- **API caching**: Next.js `revalidate` on slow-changing data (`/api/market/*`, `/api/meta/*`)

## Future: lightweightCharts Integration

See `.claude/skills/lightweight-charts.md` for chart integration patterns. Chart panels currently stub out the candlestick area and volume histogram — wire up v5 API once ready.
