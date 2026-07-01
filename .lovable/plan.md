# ACC → Operational Workbench Repivot

Shift the Azuro Command Center from "modern SaaS dashboard" to a **compact, table-first, execution-focused operations workbench** — the feel of an enterprise PMS, not an analytics tool. This pass reworks visual density, layout hierarchy, and adds missing modules across PM, TL, City Lead, and Leadership.

---

## 1. Global density & design system pass

Applies everywhere — one change, broad effect.

- New workbench tokens in `index.css`: `--wb-row-h` (32px), `--wb-header-h` (36px), tighter font scale (`text-[13px]` default in tables), muted enterprise blue/gray palette (retain existing semantic tokens, add `--wb-surface`, `--wb-border-strong`, `--wb-zebra`).
- New primitives in `src/components/acc/primitives/`:
  - `WorkbenchTable` — dense zebra table, sticky header, sortable, inline actions column, no card wrapper by default.
  - `WorkbenchSection` — compact section header (36px) with inline filters right-aligned; replaces the current padded `OperationalCard` for list-heavy sections.
  - `InlineQuickActions` — icon-only Call/WhatsApp/Note/Escalate/Done row (24×24).
  - `SlaTimer`, `AgingBadge`, `SeverityChip` — compact chip variants (20px height).
- Kill oversized KPI cards. Replace top KPI strip with a **single-line sticky operational header bar** (~44px) showing: Portfolio · Actions · Escalations · SLA Breaches · Renewals Due · Churn Risk · role/city/PM/date selectors · search · notifications.
- Remove hero paddings, big gradients, and decorative charts from all `/pm`, `/tl`, `/city`, `/leadership` pages.

## 2. Sidebar expansion

Extend `GlobalNav` into the full operational nav (compact, collapsible, icon-first). New routes (stubs where content isn't ready — link to filtered existing pages when possible):

```text
Dashboard · Properties · Renewals · Re-Renting · Service Requests ·
Escalations · Inspections · Payments · Owners · Tenants · Vendors ·
Communication Center · Churn Intelligence · Team Reviews · Reports · Settings
```

Most of the new items deep-link into the ACC panels with a preset filter (SR → PM SR panel scoped globally, Escalations → escalation panel, etc.). Only add new pages for the ones with no home today: Re-Renting, Owners, Tenants, Vendors, Communication Center, Churn Intelligence, Team Reviews, Reports, Settings — thin stub pages this pass, styled with the workbench primitives.

## 3. `/pm` — Daily Operations Inbox

Rework `PMCommand.tsx` into a workbench:

- **Top bar** (sticky): compact KPI strip + period + filters (already exist — restyle only).
- **Section A (dominant) — Today's Critical Action Queue**: single dense `WorkbenchTable`. Columns: Property · Tenant · Owner · Task · Category · Priority · Aging · Due · Last Follow-up · SLA · Next Action · Actions. Inline row expand for score impact + audit. Retain existing Expected/Flagged tabs as chips above the table, not tabs.
- **Section B — Escalation & Risk**: compact risk rows with severity + aging + SLA timer.
- **Section C — Renewal Pipeline**: horizontal stage strip (Upcoming → Discussion → Owner Aligned → Tenant Aligned → High Risk → Churn → Closed) with counts + click-to-filter; no funnel chart.
- **Section D — Re-Renting Queue**: dense table sorted by Days Vacant. Columns: Property · Owner · Move-out date · Days vacant · Stage (move-out/vacant/broker/self-rent/lost) · Broker · Next action.
- **Section E — Follow-Up Center**: pending callbacks/comms table with aging + quick actions.
- **Right rail (280px)**: stacked compact widgets — PM workload, SLA%, Active escalations, High-risk properties, Follow-up completion%, Occupancy health. No large charts.

SR / Rent / Inspections panels remain as sub-tabs but re-skinned to `WorkbenchTable`.

## 4. `/tl` — City Operations War Room

- Compact city health KPI strip (single line).
- **PM Performance Matrix** — dense sortable table with the columns listed in the prompt; row highlight for overloaded/underperforming.
- **Escalation Command Center** — aging-sorted table.
- **System Hygiene Tracker** (new) — overdue inspections, missing follow-ups, stale tasks, delayed updates, incomplete agreements, unresolved move-outs. One workbench table with a type column.
- **Renewal + Re-Renting visibility** — two compact tables side-by-side.

## 5. `/city` — Strategic Retention

- Multi-city comparison matrix (dense).
- **Churn Dashboard** split into two sub-sections with tables (not charts):
  - Renewal Churn: opportunities · renewed · lost · % · loss reasons breakdown.
  - Re-Renting Churn: move-outs · re-rented · lost · avg vacant days · broker vs self-rent · city leakage.
- **Operational Risk Heatmap** — CSS grid heatmap (city × dimension), muted color scale.
- **Leadership Review Center** — weekly + monthly review queues as compact lists.

## 6. `/leadership` — Executive Control

- Company snapshot single-line KPI bar.
- **City Ranking Table** — sortable by every KPI.
- **Churn Intelligence Engine** — company-wide tables (renewal churn, re-renting churn, PM churn, root causes, 6-mo trend as sparkline column).
- **Operational Risk Radar** — compact list of weak cities / overloaded teams / declining PMs / high-risk portfolios with drill-through.

## 7. Data layer

Extend `src/data/accAggregators.ts` and `accOperationsData.ts`:

- `getReRentingQueue(scope)` — move-out → vacant → broker/self-rent → lost, with vacant aging.
- `getFollowUps(scope)` — pending callbacks/comms.
- `getSystemHygiene(scope)` — cross-source hygiene issues for TL.
- `getChurnIntelligence(scope)` — split renewal vs re-renting with reason breakdowns.
- `getCityMatrix()` / `getCityRanking()` — dense per-city rollups.
- `getPMMatrix(cityId)` — TL PM matrix with all columns.
- All derived from existing property mock data — no new seeded fixtures beyond what's needed.

## 8. Out of scope this pass

- Real integrations (Call/WhatsApp remain toast stubs).
- Deep pages for Owners/Tenants/Vendors/Communication Center/Reports/Settings — stubs only, styled with the new primitives.
- Backend / persistence changes.
- Redesign of Properties, Renewals, Leaderboard internals — reachable via sidebar links, unchanged internally.

## 9. Delivery order

1. Design tokens + `WorkbenchTable`/`WorkbenchSection`/`InlineQuickActions` primitives + compact header bar.
2. Sidebar expansion with stub routes.
3. `/pm` rework (biggest lift, highest value).
4. `/tl` rework + System Hygiene Tracker.
5. `/city` churn split + heatmap.
6. `/leadership` city ranking + churn engine + risk radar.

Each step ships independently; the app stays usable between steps.

## 10. Technical notes

- New files: ~15 (primitives, stub pages, hygiene/churn/re-renting aggregators, new panels).
- Edits: sidebar, all 4 ACC pages, `index.css`, `accAggregators.ts`, `accOperationsData.ts`.
- No new dependencies. Continue using `recharts` only for the tiny sparklines in ranking tables.
- Every table reuses `useSortableData` + `SortableHeader`; no ad-hoc sorting.
- Strict no-hardcoded-colors rule: all workbench chrome via new semantic tokens.

---

Approve to proceed. I'll ship in the delivery order above — starting with **steps 1–3** (density system, sidebar, `/pm` rework) in the first build pass, then TL → City → Leadership in follow-ups.
