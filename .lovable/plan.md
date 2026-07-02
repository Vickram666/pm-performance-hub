
# ACC Maturity Pass — Drill-Down, Churn Split, Explainability & Property-Centric Actions

Goal: turn the Azuro Command Center from a role-siloed dashboard into a **single connected operating system** where leaders drill from CEO → City → TL → PM → Property without switching mental models, every metric explains itself, and every action is grouped around the customer/property — not around the metric.

---

## 1. Synced drill-down across all roles (highest-impact change)

Today `/leadership`, `/city`, `/tl`, `/pm` are independent pages. We'll wire them into a single **scoped view** driven by URL params so any click deepens the same page, and a persistent breadcrumb (CEO › Bengaluru › TL Rohit › PM Neha › Prop P-0421) lets the user step back up.

- New `ScopeContext` (`?city=&tl=&pm=&propertyId=`) — read once, used by every aggregator.
- Every aggregator (`getCityHealth`, `getPMMatrix`, `getServiceRequests`, `getRentTracker`, `getInspections`, `getReRentingQueue`, `getFollowUps`, `getSystemHygiene`, `getChurnIntelligence`) accepts the same scope object and filters accordingly.
- Click behavior:
  - Leadership city row → pushes `?city=X` and switches to the **City** layout, same page shell.
  - City → TL row → `?city=X&tl=Y` → **TL** layout.
  - TL → PM row → adds `&pm=Z` → **PM** layout.
  - PM → property row → opens the existing `PropertyDetailModal` (already exists — reuse).
- Persistent `<ScopeBreadcrumb />` at the top with clickable crumbs to jump back up any level.
- Route consolidation: keep `/pm`, `/tl`, `/city`, `/leadership` for direct entry, but internal navigation happens by mutating scope params — no jarring page switches.

## 2. Churn split — Leadership/CEO only

Rebuild the churn section on `/leadership` (and reuse in scoped City view) into **three explicit blocks**:

1. **Renewal Churn** — lease-end churn: opportunities · renewed · lost · % · reasons.
2. **Re-Renting Churn** — post-move-out churn: move-outs · re-rented · lost to broker/self-rent/vacant → lost · avg vacant days · reasons.
3. **Total Portfolio Churn** — combined view: total exits, blended churn %, 6-mo sparkline, city leaderboard of worst offenders.

Gated: only visible when `role === 'leadership'` (already in `RoleContext`); City Lead sees blocks 1 + 2 for their city only; TL/PM don't see this section.

## 3. Universal explainability layer (the tooltip screenshot)

Every metric label, column header, and stage chip gets an inline `Info` icon that opens a compact popover with: **What it means · How it's calculated · Why it matters · Good/bad thresholds**.

- Extend the existing `Glossary` component with a full dictionary (SR TAT, SLA, Escalation, Churn types, Aging, Occupancy, Retention, CX, Renewal %, Chronic defaulter, Score pillars, Incentive bands, Re-rent stages, System hygiene, Follow-up SLA, etc.).
- Add a `<Explain id="..."/>` wrapper used everywhere — one line to add anywhere.
- Coverage sweep: every workbench header, every KPI pill, every stage badge, every score-impact chip.

## 4. Property-centric task grouping (one property, many tasks)

Today the PM inbox is a flat action list — if property P-0421 has late rent + overdue inspection + red renewal, the PM sees three disconnected rows. Change to:

- **Group-by toggle** on the PM Action Queue: `By Task` (current) ↔ `By Property` (new default when property has ≥2 open items).
- In `By Property` mode: expandable row per property showing all open tasks nested (SR, rent, inspection, renewal, re-rent, follow-up), a combined **customer impact** badge, and a single "Open property workspace" CTA.
- New `PropertyWorkspaceDrawer` — side drawer showing the property header + all open tasks with inline quick actions, so the PM resolves the whole customer in one place instead of ping-ponging between tables.

## 5. Service Request maturity (and Rent / Inspections parity)

The existing `ServiceRequestsPanel` shows list + journey. Mature it to match a real PMS:

- **Categories & sub-categories** column (Plumbing › Leakage, Electrical › Breaker, etc.) with filter.
- **Vendor assignment** column + inline "Assign vendor" quick action.
- **First-response SLA** vs **Resolution SLA** — two SLA timers per row (not just one).
- **Recurring/repeat SR flag** — auto-detect if same property had ≥2 SRs in 30 days, chip in list.
- **Customer sentiment** column (from mocked CSAT on close).
- **Reopen count** column.
- **Bulk actions** — select multiple SRs → bulk assign / bulk escalate.
- Same structural upgrades for Rent (add: partial-payment tracking, PDC status, waiver requests) and Inspections (add: checklist completion %, photo evidence count, follow-up SR auto-created).

## 6. Attention & action-orientation polish

- **Attention banner** on every scope: single sentence like *"3 red renewals + 2 SLA-breached SRs need action today"* with one-click filter.
- **Do-Next stack** — replace the passive "Priority queue" heading with an ordered numbered stack of the top 5 actions for the current scope. Every card ends in a verb button.
- **Idle-state nudge** — if no interaction for 60s, subtly pulse the top action.
- **Snooze / delegate** on every row (audit-logged), not just "Take Action".

## 7. Delivery order (each ships independently)

1. **ScopeContext + drill-down wiring** across the 4 ACC pages + shared breadcrumb. *(Foundation — unlocks everything else.)*
2. **Universal `<Explain>` + expanded glossary** — sweep every header/pill/chip.
3. **Leadership churn split into 3 blocks** + role gating.
4. **Property-centric grouping + PropertyWorkspaceDrawer** on `/pm` inbox.
5. **Service Request maturity columns + bulk actions**; then parity pass on Rent + Inspections.
6. **Attention banner + Do-Next stack + snooze/delegate**.

## 8. Explicitly out of scope this pass

- Real backend / persistence (still mock data).
- Real vendor directory (mocked list only).
- Real WhatsApp/Call integrations (stay as toast stubs).
- Redesign of Properties / Renewals / Leaderboard internals — reused as-is via drill-down.
- Any Owners / Tenants / Vendors / Comms Center full pages — those remain stubs from the previous pass.

## 9. Technical notes

- New: `src/context/ScopeContext.tsx`, `src/components/acc/ScopeBreadcrumb.tsx`, `src/components/acc/AttentionBanner.tsx`, `src/components/acc/DoNextStack.tsx`, `src/components/acc/PropertyWorkspaceDrawer.tsx`, `src/components/acc/Explain.tsx` (extends Glossary), `src/components/acc/churn/{RenewalChurn,ReRentChurn,TotalChurn}.tsx`, `src/components/acc/sr/BulkActionsBar.tsx`.
- Edits: `accAggregators.ts` (accept `Scope`), `accOperationsData.ts` (SR fields: vendor, subCategory, firstResponseAt, reopenCount, csat), all 4 ACC pages, `RoleContext`, `GlobalNav` (breadcrumb slot).
- No new dependencies. All colors via existing semantic tokens.

---

Approve to proceed and I'll ship in the order above — step 1 (scope drill-down) first since it's the foundation everything else builds on.
