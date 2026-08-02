# Open Issues

Active work only. History: `OPEN_ISSUES_LOG.jsonl`. Roadmap: `PLANNING.md`.

## Immediate UI Refinements

## Recommended Priorities

1.  **Animation Performance Program**
    - **Goal:** Determine which visual effects are viable, establish a measured frame budget, and make animation quality self-settling on the available device matrix (Samsung S21, Nothing Phone 4a, MacBook Pro M3).
    - **Method:** Instrument first with recoverable console and/or server-side scenario logs; expand `PageDirector` into the shared visibility source; remove invisible work; then introduce adaptive High / Medium / Low tiers before attempting a unified fog/lightning renderer.
    - **Benefit:** Existing polish can be retained or simplified based on evidence, and future effects can be added against known performance headroom.
    - **M3.0 progress:** Full scenario set + `runAll`, WebGL timer queries (frame EWMA fallback), overrides for fog/lightning/lamp/particles/carouselMorphs/crt/spotlight, `data-perf-lab` markers. Still open: device baselines on S21 / Nothing 4a / MBP M3 and top-contributor ID.
    - **Roadmap:** `PLANNING.md` M3.0–M3.6.

2.  **Hybrid Forms (Architecture)** — remaining after layout + `updateItem` configure
    - **Goal:** Shared human/agent contact submit path.
    - **Remaining:** Map server Zod issues onto RHF `setError`; dullahan action-registry polish when the package is available in-env; persist stub stays until M5.
    - **Insight:** Human clicks and AI tool calls should share the same validation and state transitions.

3.  **Live GPU catalog ingest (indicative market prices)**
    - **Goal:** Replace fictional `public/data.ts` offerings with real indicative rental prices for the MVP funnel.
    - **Near-term:** Ingest [gpurentalprices.com](https://gpurentalprices.com/data) daily snapshot; curated bare-metal-leaning provider map; muted `via gpurentalprices.com` attribution.
    - **Pending keys (in the works):** Shadeform (`deployment_type=baremetal`) and Latitude.sh plans/stock — enrich when available; do not block the free-feed MVP.
    - **Roadmap:** `PLANNING.md` M6.

## Use-case detail modal lags on open/interaction

Problem statement: The use-case detail modal feels laggy; likely re-render or expensive component work.
Context:

- Modal renders templates, tradeoff bars, and conditionally renders `GpuModal`.
- Also runs fairly heavy `useMemo` computations for GPU combinations and risk metrics (similar to `halo-search`).
  Clues / relevant areas:
- `src/components/modals/UseCaseTemplatesModal.tsx`
  - Template list render + tradeoff bars
  - Embedded `GpuModal` and duplicated modal state/logic
- `src/lib/useCaseTemplates.ts` (template data size)

## Animation performance program

Problem statement: The page mounts several independent continuous animation
systems without a common lifecycle or frame budget. It is not yet known which
effects can be preserved on target hardware, making further visual polish
risky.

Observed systems:

- Hero fog and lightning use separate full-DPR WebGL canvases. The fog shader
  is computationally expensive; both RAF chains remain scheduled while paused
  (draws skip when paused; lightning now respects the same pause clock).
- The hero also runs Motes/tsParticles, lamp flicker, carousel intervals,
  multiple decorative Motion layers, and nine `MorphingText` instances.
- Five additional `MorphingText` instances run in availability cards. Morph RAF
  idles when not morphing and can be force-disabled via the `carouselMorphs`
  override; carousel turnover can still start many morphs together.
- The CRT applies SVG displacement/posterization to live DOM while repeatedly
  animating whole-subtree blur/text-shadow and several scanline layers.
- The spotlight's R3F canvas renders continuously even when unchanged or
  offscreen.
- Halo and Predator are interaction-focused but still need shared policy,
  reduced-motion handling, and lower per-frame React work.

Performance target:

- Validate only on the available real-device matrix (do not expand beyond what
  we can physically retest):
  - Samsung Galaxy S21
  - Nothing Phone (4a)
  - MacBook Pro M3
- Use adaptive High / Medium / Low tiers that settle from measured runtime
  frame cost rather than relying only on static device detection.
- Healthy target: p95 frame interval ≤ 20 ms, fewer than 5% of frames over
  25 ms, and no animation-caused long tasks over 50 ms.
- Minimum Low tier: stable 30 FPS presentation without repeated frames over
  50 ms.
- Perf harness must produce recoverable logs: structured browser-console
  summaries (and/or downloadable dump) and/or a server-side ingest of scenario
  JSON. Phone runs must not require a tethered desktop DevTools session to
  keep the data.

Phased resolution:

1. **Instrument and isolate:** Add development-only effect toggles, deterministic
   scenarios, frame/long-task telemetry, WebGL timing where supported,
   production-build baselines on S21 / Nothing Phone (4a) / MBP M3, and a
   recoverable console and/or server logging path for those runs.
   **Partial:** toggles + full scenario set + WebGL timer hooks +
   console/download/POST path exist under `src/lib/animation/` and
   `src/app/api/perf-lab/`; device baselines + top-contributor ID still open.
2. **Stop invisible work:** Expand `PageDirector` / UI store into a shared
   section visibility policy with hysteresis, dwell time, tab visibility, and
   reduced motion. Keep WebGL resources warm while stopping draws and RAF work.
3. **Remove workload multipliers:** Cap backing DPR without reducing fog
   iteration depth; skip lightning draws between storms; put spotlight into
   demand mode; stop idle morph RAF; reduce Motes duty; simplify CRT
   invalidation; remove per-frame React state from Predator.
4. **Add self-settling quality:** Introduce an `AnimationDirector` that degrades
   quickly after sustained misses, upgrades slowly after sustained headroom,
   and changes one quality dimension at a time.
5. **Run a fog bake-off:** Compare adaptive low-resolution live fog, low-rate
   live fog with temporal interpolation, precomputed playback with live
   lightning, and shader algebra/precision optimization. Preserve the current
   raymarch depth until these options are measured.
6. **Prototype unified atmosphere:** Only after fog viability is proven, compare
   one density-aware WebGL2 fog/lightning renderer against the best simpler
   variant. Retain the unified version only if it wins in cost or visual
   coupling.
7. **Protect the budget:** Require every continuous effect to define section
   gating, reduced-motion behavior, scalable knobs, and a Low-tier
   representation; add automated scenarios and release checks on the three
   available devices with recoverable console/server traces.

Decision policy:

- Keep live fog if it meets the Medium-tier budget after spatial/duty-cycle
  optimization.
- Use precomputed fog as a fallback if live fog cannot settle on lower tiers.
- Scrap the effect only if neither live nor baked variants meet Low-tier
  requirements without unacceptable visual loss.
- Do not unmount/recreate WebGL contexts at viewport boundaries; doing so can
  replace steady-state cost with shader compilation jank.
- Use visibility hysteresis rather than random jitter. Treat each section's
  effects as one workload group so related layers activate coherently.

Acceptance criteria:

- [ ] The reported jank is reproducible and its top contributors are measured
      independently on S21, Nothing Phone (4a), and MBP M3.
- [ ] Scenario traces from each device are recoverable via browser console
      (and/or download) and/or server-side ingest without tethered DevTools.
- [ ] Offscreen animation work approaches zero without visibility flapping or
      return-to-section compile hitches.
- [ ] Medium tier passes the performance contract with all major sections
      intact.
- [ ] The adaptive controller converges without visible quality oscillation.
- [ ] Fog viability is decided through measured prototype comparisons.
- [ ] New visual effects are admitted only when measured Medium-tier headroom
      remains.
- [ ] High / Medium / Low behavior and sustained thermal results are documented
      with archived traces from the three devices.

Primary areas:

- `src/components/layout-navigation/links.tsx`
- `src/stores/ui.ts`
- `src/lib/animation/` (new diagnostics/policy modules)
- `src/components/ui/fog.tsx`
- `src/components/ui/morphing-text.tsx`
- `src/components/ui/motes.tsx`
- `src/components/ui/streetlamp.tsx`
- `src/components/flickeringCards.tsx`
- `src/components/ui/spotlight-area.tsx`
- `src/components/ui/canvas-reveal-effect.tsx`
- `src/components/ui/predator-button.tsx`
- `src/components/ui/click-burst.tsx`
- `src/app/[locale]/(root)/(home)/availabilitySection.tsx`

Detailed sequencing and milestone gates: `PLANNING.md` M3.0–M3.6.

## Replace mock GPU catalog with live indicative prices

Problem statement: All GPU pricing, providers, and offerings are hand-authored
fiction in `public/data.ts`. The funnel needs real (or near-real) market list
prices as an MVP until an internal curated deal book (bulk, allocation,
contractual overflow) exists.

Motivation / pointers:

- Types: `src/types/gpu.ts` (`GpuCatalog`, `provisioningType`, `PriceEstimate`).
- Consumers: search, availability, `GpuModal`, plan → contact (all import
  `gpuCatalog` from `public/data.ts`).
- Risk metrics / marketing copy stay curated (`docs/SCORING.md`, existing
  descriptions) — public feeds do not supply them.
- Almost no public aggregator labels bare-metal vs VM; use a curated provider →
  `provisioningType` map until richer APIs are wired.

Near-term approach (available data now):

1. Ingest [gpurentalprices.com](https://gpurentalprices.com/data) daily snapshot
   (`/api/latest.json` and/or GitHub mirror). CC BY 4.0 for today’s snapshot;
   attribution required. Daily lag is acceptable.
2. Optional spike/compare: GridStackHub `GET /api/gpu-pricing` (no auth).
3. Filter with a bare-metal / neocloud–leaning provider allowlist; deprioritize
   community-marketplace noise unless explicitly wanted.
4. Normalize feed rows → `GpuCatalog`; keep `isIndicative: true`; server- or
   build-side only; fail soft to last-good snapshot.
5. Compliance: minimal muted credit near catalog UI, e.g. small text
   `via gpurentalprices.com` (not a loud banner).

Pending (keys in the works — do not block MVP):

- **Shadeform** — `GET /instances/types`; filter `deployment_type=baremetal`.
- **Latitude.sh** — `GET /plans?filter[gpu]=true` for bare-metal specs, pricing,
  and `stock_level`.

Out of scope for this issue:

- Presenting list prices as our contracted rates.
- Replacing risk metrics or plan-store identity work.
- Browser-side keys/scrapers; paid aggregator ToS (ComputePrices / GPUs.io)
  until legal review says otherwise.

Acceptance criteria:

- [ ] Catalog-driven UI shows real indicative `$/hr` prices from an ingested
      snapshot (not fictional `provider-a`… names as the sole source).
- [ ] Curated allowlist + `provisioningType` map documents bare-metal bias.
- [ ] Muted `via gpurentalprices.com` (or active primary source) attribution is
      visible on relevant surfaces.
- [ ] Ingest failure retains last-good catalog; no client-exposed secrets.
- [ ] When Shadeform / Latitude keys arrive, enrichment can plug in without
      changing the `GpuCatalog` shape.

Primary areas:

- `public/data.ts` (replace / generate)
- `src/types/gpu.ts`
- New ingest adapter (e.g. `src/server/catalog/` or build script)
- Catalog consumers under `src/components/search/`, availability, modals
- Attribution placement in those surfaces

Roadmap: `PLANNING.md` M6.

## Complete singletonModal system (currently sketched)

Problem statement: Modal flows are inconsistent; singleton modal system is not completed.
Dependencies / Relations: Plan configure already uses `updateItem` by uuid; finishing singletonModal would still de-duplicate GpuModal state across header/contact/use-case.
Context:

- Prototype patterns now live in starter-pack (`references/nextjs-with-optional-python-server/singleton-modal.tsx.example`) and dullahan-web machine layer.
  Clues / relevant areas:
- `starter-pack/references/nextjs-with-optional-python-server/singleton-modal.tsx.example`
- `dullahanUI/packages/dullahan-web/src/core/machine/react.tsx`
- `OPEN_ISSUES.md` / `PLANNING.md` M1–M3 for follow-up and standardization goals

