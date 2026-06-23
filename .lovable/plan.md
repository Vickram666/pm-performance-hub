
# Azuro Command Center (ACC) — Build Plan

Transform today's PM-centric dashboard into a unified, role-based **operational command center** while preserving the current Azuro visual identity (sidebar nav, typography, card system, calm enterprise palette). The product becomes "mission control for property operations" — every screen answers: *what needs attention, what's delayed, what's at risk, what's next.*

---

## 1. Information architecture

Introduce a role switcher in `GlobalNav` (PM · TL · City Lead · Leadership). Role drives default landing dashboard; URLs are deep-linkable.

```text
/  → role-aware redirect
/pm                  Property Manager Command Center
/tl                  Team Lead War Room
/city                City Lead Strategic View
/leadership          CEO / Leadership Snapshot
/properties, /renewals, /leaderboard  (existing, kept)
```

A new **Operational Summary Bar** (sticky, shared component) sits under the header on every role dashboard with role-scoped KPIs (Tasks, Escalations, Renewals, Re-renting, SLA breaches, Follow-ups, High-risk).

---

## 2. Shared design system additions

Keep current tokens. Add:

- `--urgency-critical / high / medium / low` (subtle, desaturated — no flashy reds)
- `OperationalCard`, `KpiPill`, `UrgencyDot`, `SlaTimer`, `QuickActions` (call / WhatsApp / note / status) — all reusable
- `SectionHeader` with right-aligned filters
- `PipelineFunnel` (stages → counts → click-through)
- `AgingBadge` (e.g. "12d aging") for escalations, vacancies, follow-ups

All new components live in `src/components/acc/` so existing PM dashboard remains untouched until cut-over.

---

## 3. Role dashboards — scope per screen

### 3.1 Property Manager (`/pm`) — *Operational Inbox*
1. **Sticky Summary Bar** — 7 KPI pills
2. **Today's Critical Actions Queue** (primary) — prioritized task list: property, owner/tenant, action, SLA timer, urgency, recommended next step, inline Quick Actions
3. **Escalation Risk Panel** — repeat SRs, angry owners, delayed inspections, payment issues, churn risk; severity + aging
4. **Renewal Pipeline Widget** — funnel: upcoming → negotiation → owner aligned → tenant aligned → high risk → churn → closed
5. **Re-Renting Pipeline** — move-out → vacant → broker assigned → owner self-rent → lost; vacancy aging
6. **Daily Follow-Up Center** — pending callbacks, owner/tenant comms, confirmations

Replaces today's `Index.tsx` for PM role. Existing `MyDayActionFeed`, `ScoreSimulator`, etc. move into a secondary "My Score" tab to preserve incentive functionality without crowding the command surface.

### 3.2 Team Lead (`/tl`) — *War Room*
1. City Operational Health Overview (portfolio, escalations, SLA%, renewals, vacancy%, churn, PM workload)
2. **PM Performance Matrix** — sortable grid (Name, Portfolio, Tasks, Escalations, SLA%, Renewals, Churn risk, CSAT, Overdue); highlight overloaded / underperforming
3. Escalation Command Center — aging-sorted
4. Re-Renting Control Tower — vacant inventory + broker efficiency + leakage
5. Renewal Conversion Funnel

### 3.3 City Lead (`/city`) — *Strategic*
1. Multi-city KPI cards (occupancy, churn, renewals, escalations, CSAT, PM efficiency, growth)
2. **Churn Intelligence** — split: Renewal Churn vs Re-renting Churn, each with root-cause breakdown
3. **Operational Heatmap** — weak cities × dimensions
4. Team Coaching & Review — training gaps, recurring failures, follow-up quality

### 3.4 Leadership (`/leadership`) — *Executive*
1. Company Operational Snapshot (one row of large KPIs)
2. **City Ranking Dashboard** — sortable by retention, SLA, renewals, CX, escalations, churn
3. Churn Intelligence Engine — trends, city/PM churn, root causes, retention efficiency
4. Leadership Review Center — weekly (escalation/renewal/city) + monthly (quality/PM/retention/portfolio) review queues

---

## 4. Data layer

No backend. Extend `src/data/` with derived aggregators (pure functions over existing `propertyData`, `renewalData`, `leaderboardData`):

- `getOperationalSummary(role, scope)` → KPI bar
- `getCriticalActions(pmId)` → prioritized task list (synthesized from late rent, red renewals, pending reports, SR SLA, follow-ups)
- `getEscalations(scope)` with aging
- `getReRentingPipeline(scope)`
- `getCityHealth()`, `getPMMatrix()`, `getChurnIntelligence()`, `getCityRanking()`

Each derives from existing mock data so all 4 dashboards stay internally consistent.

---

## 5. UX rules

- One primary action per row, secondary actions in hover/overflow
- Urgency communicated via left-border accent + small dot, not background flood
- Aging shown as "12d" pills, never raw timestamps in lists
- Drill-down: every KPI and funnel stage is clickable → filtered detail view
- All tables share `useSortableData` + `SortableHeader`
- Mobile: summary bar scrolls horizontally; sections stack; quick actions collapse into a sheet

---

## 6. Out of scope (this pass)

- Real WhatsApp / call integrations (buttons are stubs that toast "Initiated …")
- Backend persistence of notes/status changes beyond current sessionStorage pattern
- New auth / role permissions (role switcher is a client-side selector for now)
- Redesigning Properties / Renewals / Leaderboard internals (they're linked from ACC but unchanged)

---

## 7. Delivery order

1. Design tokens + shared ACC primitives (`OperationalCard`, `KpiPill`, `SlaTimer`, `AgingBadge`, `PipelineFunnel`, `QuickActions`, `OperationalSummaryBar`)
2. Role switcher in `GlobalNav` + routes in `App.tsx` + role context (`useRole` via localStorage)
3. `/pm` Command Center (highest value — replaces today's landing for PM role; old dashboard preserved at `/pm/score`)
4. `/tl` War Room
5. `/city` Strategic
6. `/leadership` Executive
7. Cross-link drill-downs into existing Properties / Renewals pages with prefiltered query params

Each step ships independently and the app remains usable between steps.

---

## Technical notes

- New folder: `src/components/acc/{primitives,pm,tl,city,leadership}/`
- New pages: `src/pages/acc/{PMCommand,TLWarRoom,CityStrategic,LeadershipSnapshot}.tsx`
- Role context: `src/context/RoleContext.tsx` (localStorage-backed, default `pm`)
- New tokens added to `src/index.css` under existing semantic group; **no hardcoded colors** in components
- Charts: continue with `recharts`; heatmap built with a simple CSS grid (no new dep)
- All new tables reuse `useSortableData` / `SortableHeader`
- Quick-action stubs use `sonner` toasts already wired up

Estimated footprint: ~25 new files, ~3 edits (`GlobalNav`, `App.tsx`, `index.css`). No dependency additions.

---

Approve to start with **step 1 (design primitives) + step 2 (role switcher + routes) + step 3 (`/pm` Command Center)** in the first build pass, then iterate TL → City → Leadership in subsequent passes.
