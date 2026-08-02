# Planning — GPUCloud Store

Marketing + lead-capture funnel for a GPU capacity broker. Optimize this phase for
**conversion trust** (plan integrity + contact submit) and **perf of heavy visuals**.

## Status board

| ID | Milestone | Status |
|---|---|---|
| M0 | Agent continuity (rules + artifacts) | `done` |
| M1 | Plan store integrity | `done` |
| M2 | Contact / hybrid forms | `in progress` |
| M3 | Animation performance program | `in progress` |
| M4 | UI polish & locale parity | `in progress` |
| M5 | Lead persistence (optional Prisma/CRM) | `not started` |
| M6 | Live GPU catalog ingest (indicative market prices) | `done` |

## Milestones

### M0 — Agent continuity
**Exit:** `.cursor/rules` describe this repo; `PLANNING.md`, `OPEN_ISSUES.md`,
`SCRATCHPAD.json`, and logs exist and are cross-linked.
**Done** this session (rules retarget + seed artifacts).

### M1 — Plan store integrity
**Goal:** Source-agnostic plan items with stable identity and derived status.
**Exit criteria:**
- Every plan item has a `uuid`; identity is not title/origin.
- Status = incomplete iff required fields missing (no “quick pick” / “template” labels).
- Configure flow updates by uuid (`updateItem`) — no delete+add replace bug.
**Done:** `src/stores/plan.ts` uuid ids + structured merge keys; `getMissingPlanFields` /
`needsConfiguration`; header + contact configure paths call `updateItem`.

### M2 — Contact / hybrid forms
**Goal:** Contact + plan submit path shared by human UI and future agent/tool calls.
**Exit criteria:**
- Zod schemas + page model under `src/core/contact/`.
- Server action submit path under `src/server/actions/` (dullahan-web patterns when ready).
- Contact layout keeps the form usable with long plan lists (sticky/scroll strategy).
**Progress:** Core schemas + `submitContactAction` stub + page model exist; layout uses
peer columns with a flex-growing scrollable plan list; configure uses `updateItem`;
server Zod/domain issues map to RHF `setError` via `applyContactServerErrors`.
**Remaining:** dullahan registry polish (needs package in env); README contact API
note; persist deferred to M5.

### M3 — Animation performance program
**Goal:** Establish a measured animation budget, eliminate invisible work, and
progressively evolve the visual effects into an adaptive system. This milestone
exists to answer whether the current visual direction is viable before more
polish is built on top of it.

**Target:** Adaptive High / Medium / Low effect tiers validated on the only
available real-device matrix:
- Samsung Galaxy S21 (Android phone)
- Nothing Phone (4a) (Android phone)
- MacBook Pro M3 (desktop/laptop reference)

**Performance contract:**
- Healthy target: p95 frame interval ≤ 20 ms, fewer than 5% of frames over
  25 ms, no animation-caused long tasks over 50 ms, and responsive input during
  a 60-second scroll/interaction run.
- Soft animation budget: approximately 6 ms combined GPU work and 3 ms
  main-thread work per displayed frame.
- Low tier must sustain a stable 30 FPS presentation without repeated frames
  over 50 ms.
- Benchmark production builds on all three devices above; do not invent a
  broader matrix than what we can physically retest.
- Every perf run must emit recoverable logs: either browser console (copyable /
  downloadable structured summaries) and/or a server-side ingest endpoint that
  stores scenario traces. Phone sessions must not depend on desktop DevTools
  remaining attached.
- Preserve the fog's raymarch iteration depth initially. Reduce wasted work,
  spatial resolution, and duty cycle before changing the computation that
  defines its appearance.

#### M3.0 — Performance laboratory
**Goal:** Make the reported jank reproducible and attributable.
**Work:**
- Add development-only effect overrides for fog, lightning, particles, lamp,
  carousel morphs, CRT, spotlight, halo, and CTA effects.
- Capture frame intervals, dropped frames, long tasks, active RAF/timer counts,
  WebGL contexts, backing resolution/DPR, and current quality tier.
- Use WebGL timer queries where supported; use frame-time EWMA as the fallback.
- Define deterministic scenarios: idle hero, lightning burst,
  hero-to-availability scroll, carousel turnover, CRT visible, spotlight hover,
  and CTA interaction.
- Ship a recoverable logging path for device runs: structured console dump
  (and optional download) plus optional server POST of scenario JSON so S21 /
  Nothing Phone traces can be pulled without tethered debugging.
**Status:** Harness expanded — full scenario set (`idle-hero`, `lightning-burst`,
`off-hero-idle`, `hero-to-availability-scroll`, `carousel-turnover`,
`crt-visible`, `spotlight-hover`, `header-cta-interaction`) via
`window.__gpuPerfLab.run` / `runAll`; WebGL timer queries
(`EXT_disjoint_timer_query*`) with frame-time fallback; effect overrides wired
for fog/lightning/lamp/particles/carouselMorphs/crt/spotlight. Still needed:
device baselines on S21 / Nothing Phone (4a) / MBP M3 and top-contributor ID
from those traces.
**Exit:** The top two contributors are identified on each of S21, Nothing Phone
(4a), and MBP M3, and the jank can be reproduced on demand with recoverable
logs.

#### M3.1 — Stop invisible and idle work
**Goal:** Remove wasted work without intentionally changing visible output.
**Progress (partial):** MorphingText schedules RAF only during morph/filter-fade;
fog/lightning cancel RAF while paused (GL contexts kept warm); CSS fog drift
freezes when paused; lamp/carousel/motes gated on hero `isActive`; CRT warm-pause
+ spotlight `frameloop` gate; Halo Motion/CSS gated via `halo` override + hero
`active`; Predator respects `predator` override; `off-hero-idle` scenario.
`PageDirector` publishes per-anchor `isNear`/`isActive` (300px near margin,
600ms exit dwell) plus `pageVisible` / `prefersReducedMotion`; fog prewarms on
`isNear`.
**Still open:**
- Confirm off-section GPU samples ≈ 0 on device baselines after fog draw
  gate moved from `isNear` → `isActive` (tall hero anchor was keeping near true).
**Exit:** Offscreen animation work approaches zero, boundary scrolling does not
flap, and returning to a section has no visible time jump or compile hitch.

#### M3.2 — Remove workload multipliers
**Goal:** Preserve the design while reducing avoidable GPU/paint pressure.
**Progress (partial):** Fog/lightning backing DPR capped at 1 + default spatial
scale 0.55 (iteration count unchanged); fog ~12 Hz; lightning skips
`drawArrays` between storm clusters (idle poll ~4 Hz, clear once).
**Still open:**
- Shared fog/lightning scheduler/resize path (still two RAF loops).
- Motes High/Medium/Low duty; spotlight demand mode; CRT text-shadow /
  scan-band / filter shrink; Predator per-frame transform out of React state.
**Exit:** Medium tier meets the performance contract with all sections intact.
At this point additional visual work may continue against measured headroom.

#### M3.3 — Self-settling quality controller
**Goal:** Adapt to real runtime cost instead of relying only on device labels.
**Work:**
- Add an `AnimationDirector` with declarative High / Medium / Low controls.
- Feed it rolling frame-time EWMA, dropped-frame rate, long tasks, and available
  effect GPU timings.
- Degrade after 1–2 seconds of sustained misses; require 10–20 seconds of
  headroom before upgrading; enforce a cooldown between changes.
- Change one dimension at a time: backing resolution, then update rate, then
  secondary decorations. Do not oscillate fog iteration count.
- Seed the initial tier from coarse device hints, but let runtime measurements
  settle the tier for the session.
**Exit:** Repeated scenarios converge without visible quality flapping or
repeated upgrade/downgrade cycles.

#### M3.4 — Fog viability bake-off
**Goal:** Decide the fog's future from bounded prototypes and measurements.
**Variants:**
- Current 100-iteration fog at adaptive low spatial resolution and upscale.
- Live fog evaluated at 6–10 Hz with cheap temporal interpolation.
- Periodic precomputed fog video/texture playback with live lightning.
- Algebra/precision optimization of the live shader without reducing visual
  iteration depth.
**Exit:** Keep live fog if it meets Medium-tier budget. Use a baked fallback
where live rendering cannot settle. Scrap the fog only if neither live nor
baked approaches meet Low-tier requirements without unacceptable visual loss.

#### M3.5 — Unified atmosphere renderer
**Goal:** Replace the two-canvas implementation only if the unified design
outperforms the winning fog prototype.
**Work:**
- Prototype one WebGL2 `HeroAtmosphere` canvas with shared clock, resize,
  quality policy, and composition.
- Render adaptive-resolution fog density/color to a framebuffer and let
  lightning consume the same density representation.
- Skip the lightning pass outside storms; use temporal accumulation and
  upscaling before one final composite.
- Preserve static and baked fallbacks for unsupported or persistently
  over-budget devices.
**Exit:** The unified renderer beats the best M3.4 variant in combined GPU time
or materially improves visual coupling. Otherwise retain the simpler winner.

#### M3.6 — Budget-aware polish and regression protection
**Goal:** Make remaining headroom an explicit product constraint.
**Work:**
- Every continuous effect declares priority, scalable knobs, reduced-motion
  behavior, section gating, and a Low-tier representation.
- New effects require before/after traces and may not consume reserved Medium
  tier headroom.
- Add automated deterministic scenarios with broad CI thresholds, plus unit
  tests for hysteresis, controller convergence, cleanup, and tab visibility.
- Retain sustained/thermal testing on S21, Nothing Phone (4a), and MBP M3 as
  the release gate; keep scenario logs recoverable via console and/or server.
**Exit:** Two consecutive runs on each of the three devices pass without
unexplained quality oscillation, and the final High / Medium / Low effect
matrix documents remaining headroom with archived traces.

**Primary areas:** `src/components/layout-navigation/links.tsx`,
`src/stores/ui.ts`, `src/lib/animation/`, `src/components/ui/fog.tsx`,
`src/components/ui/morphing-text.tsx`, `src/components/ui/motes.tsx`,
`src/components/ui/canvas-reveal-effect.tsx`, and the home sections.
**Open issue:** Animation performance program.

### M4 — UI polish & locale parity
**Goal:** High-visibility trust polish + consistent i18n trees.
**Exit criteria:**
- Immediate UI refinements in `OPEN_ISSUES.md` cleared or consciously deferred.
- Non-`en-US` locales match `en-US` key structure (or documented lag with owners).
**Progress:** Locale key trees match `en-US`; cold-lamp accents + funnel
`cta`/`outline` Button variants + `surface-*` utilities; footer/contact/modal
borders aligned to `border-border/60`; lamp skip repositioned and auto-advance
pauses on section hover/focus.
**Progress:** Use-case modal unmounts when closed; template scroll uses
`IntersectionObserver` (no 90-frame settle RAF); GpuModal configure path lives in
lazy `UseCaseGpuConfigureLayer`.
**Open issues:** Remaining M4 polish as new Immediate items; singletonModal still sketched.

### M5 — Lead persistence (optional)
**Goal:** Persist quote requests when env/DB is configured.
**Exit criteria:** Prisma (or CRM) path behind env flags; `.env.example` documents vars;
no hard dependency for local marketing-only runs.
**Depends on:** M2 submit path stable.

### M6 — Live GPU catalog ingest
**Goal:** Replace fictional offerings in `public/data.ts` with indicative real-market
GPU rental prices (up to ~1 day lag OK), biased toward bare-metal / neocloud
providers, while keeping the quote-driven funnel and curated risk/copy overlays.

**Context:** Public feeds expose on-demand/spot list prices, not private bulk,
allocation, or overflow contracts (those stay the long-term curated deal book).
Almost no aggregator labels bare-metal vs VM; provider allowlists + static
`provisioningType` maps bridge that until richer APIs are wired.

**Near-term (keys pending):**
- Primary feed: [gpurentalprices.com](https://gpurentalprices.com/data) daily
  snapshot (`/api/latest.json` and/or GitHub mirror) — free, CC BY 4.0 for today’s
  snapshot, attribution required.
- Third feed (landed): [GridStackHub](https://gridstackhub.ai/developers)
  `GET /api/gpu-pricing` — on-demand rows with gpu counts/regions; CC BY 4.0.
- Curated provider allowlist / denylist favoring bare-metal-leaning neoclouds;
  static provider → `provisioningType` map (`bare-metal` vs `virtual-machine`).
- Normalize into existing `GpuCatalog` (`src/types/gpu.ts`); keep `riskMetrics`,
  marketing copy, and lead-time/min-term overlays curated.
- Server- or build-side ingest only; last-good snapshot on failure; keep
  `isIndicative: true`.
- Minimal compliance footer / credit: muted small text e.g. `via gpurentalprices.com`
  near catalog-driven surfaces (search, availability, modals as needed).

**Blocked / in the works (do not block near-term on these):**
- **Shadeform** API key — `GET /instances/types` with `deployment_type`
  (`vm` \| `container` \| `baremetal`); best single feed for bare-metal filtering.
- **Latitude.sh** API key — `GET /plans?filter[gpu]=true` for native bare-metal
  specs, USD hour/month, and `stock_level`.

**Later options (after ToS / need):** GPUs.io (paid normalized feed),
gpucloudprices.com (free API but ToS discourages republishing compiled dataset),
ComputePrices (free tier but ToS restricts competing comparison products),
Lambda `instance-types` for live capacity on Lambda SKUs only. End state:
internal deal book as catalog source; public feeds become market context /
fallback.

**Exit criteria:**
- Catalog consumers read a generated / ingested `gpuCatalog` (not hand-authored
  fictional providers) with real indicative `$/hr` prices.
- Bare-metal-leaning providers are prioritized via allowlist + `provisioningType`
  map (documented as curated until Shadeform/Latitude land).
- Attribution footer present and muted; prices remain clearly indicative.
- Ingest fails soft to last-good snapshot; no browser-side keys or scrapers.
- When Shadeform and/or Latitude keys arrive: enrichment path documented or
  wired without rewriting the catalog shape.

**Decision (2026-08-02):** Three free CC BY feeds (gpurentalprices + gpucloudcompare +
gridstackhub) are **sufficient as the marketing-site market-context placeholder** until
Shadeform/Latitude keys land; those keyed APIs are themselves a placeholder until an
internal deal book (bulk on-demand SLAs / allotments). Do not add more free scrapers
for coverage (gpucloudprices deferred on ToS + overlap). Gaps that remain intentional:
firm bare-metal labeling, live stock, and resellable SLA pricing.

**Done:** `public/data.ts` normalizes committed snapshots from gpurentalprices,
gpucloudcompare, and gridstackhub via `src/lib/catalog/`; curated allowlist +
`provisioningType` map; `pnpm catalog:ingest` fail-soft refresh; muted attribution on
hero/availability/footer; enrichment notes in `src/server/catalog/enrichment.md`.
Follow-up when keys arrive: OPEN_ISSUES “Catalog enrichment when API keys arrive”.

## Sequencing notes

1. Finish or stabilize **M2** contact work already in the tree before large UI churn.
2. Prefer **M1** before more plan-drawer UX — identity bugs compound polish work.
3. **M3** starts with measurement and lifecycle fixes before any shader rewrite;
   avoid scattering per-component observers or prematurely removing effects.
4. **M4** can interleave small items once M1/M2 aren’t thrashing shared components.
5. **M5** only when product wants stored leads (see `README.md` env notes).
6. **M6** can run in parallel with M1/M2 once an ingest adapter + attribution are
   scoped; do not wait on Shadeform/Latitude keys for the gpurentalprices MVP.

## Related docs

- Product overview: `README.md`
- Positioning: `docs/playbook.md`
- Open work: `OPEN_ISSUES.md`
- Catalog types: `src/types/gpu.ts`; mock source: `public/data.ts`
