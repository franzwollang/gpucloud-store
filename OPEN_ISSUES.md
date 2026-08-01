# Open Issues

Active work only. History: `OPEN_ISSUES_LOG.jsonl`. Roadmap: `PLANNING.md`.

## Immediate UI Refinements

- make color usage consistent across entire page; currently some obvious inconsistencies in button color/border/hover state and card/box backgrounds

- Simplify the container/box for the CRT effect; keep the "container" more flat/in-line with the design style of the rest of the site.

- switch the column order of the use-case modal (e.g put the templates list on the left and the details on the right)

- completely remove CTA section but preserve included animations as independent components/modules.

- Add a permanent CTA button next to the plan/basket button in the header; add a line separator between the lang picker/dark mode button and the CTA button / plan/basket button. Make the CTA button show loading state and transient text/imagery whenever anything is added to the plan/basket.

- Make the grid background of the "what happens next" section more dark/occluded (like the current bottom of the occlusion gradient) to ensure it feels more "background-y" and doesn't steal attention when the spotlight effect isn't active

- Audit remaining hard-coded warm accent lights/shadows (non-`--color-lamp-*` usages) and add cold-white/blue lamp accents where surfaces still look underlit.

## Recommended Priorities

1.  **Animation Performance Program**
    - **Goal:** Determine which visual effects are viable, establish a measured frame budget, and make animation quality self-settling on the available device matrix (Samsung S21, Nothing Phone 4a, MacBook Pro M3).
    - **Method:** Instrument first with recoverable console and/or server-side scenario logs; expand `PageDirector` into the shared visibility source; remove invisible work; then introduce adaptive High / Medium / Low tiers before attempting a unified fog/lightning renderer.
    - **Benefit:** Existing polish can be retained or simplified based on evidence, and future effects can be added against known performance headroom.
    - **Roadmap:** `PLANNING.md` M3.0–M3.6.

2.  **Hybrid Forms (Architecture)**
    - **Goal:** Finish AI/agent-ready contact submit path on top of existing core.
    - **Done so far:** `src/core/contact/*` Zod + page model; stub `submitContactAction`; sticky form layout.
    - **Remaining:** dullahan-web action registry + map server Zod issues to RHF `setError` (blocked in cloud VMs without the sibling package).
    - **Insight:** Human clicks and AI tool calls must share the same validation/transitions.

3.  **UI Polish (Interaction)**
    - **Goal:** High-visibility "trust" improvements.
    - **Tasks:** Add "shaking" animation to the plan basket (use-case "Configure Template →" anchors already shipped).

4.  **Live GPU catalog ingest (indicative market prices)**
    - **Goal:** Replace fictional `public/data.ts` offerings with real indicative rental prices for the MVP funnel.
    - **Near-term:** Ingest [gpurentalprices.com](https://gpurentalprices.com/data) daily snapshot; curated bare-metal-leaning provider map; muted `via gpurentalprices.com` attribution.
    - **Pending keys (in the works):** Shadeform (`deployment_type=baremetal`) and Latitude.sh plans/stock — enrich when available; do not block the free-feed MVP.
    - **Roadmap:** `PLANNING.md` M6.

## Locale files out of sync with `en-US`

Problem statement: Non-`en-US` locale JSON files are missing keys or structure present in `public/locales/en-US.json`, leading to missing translation entries or runtime fallbacks.
Context:

- The app uses `next-intl` (`src/app/[locale]/layout.tsx`, `src/i18n/*`) and expects consistent message trees.
- Recent sections (availability, use-case templates, plan updates) add new keys under `TEST.*` and `UI.*`.
  Clues / relevant areas:
- `public/locales/en-US.json` (source of truth; newest additions)
- Other locale files in `public/locales/*.json` that likely lag behind
- `src/i18n/index.ts` / `src/i18n/request.ts` for message loading

## Lamp card “Skip Cards” button positioned off screen

Problem statement: The skip button that appears in the lamp/flickering cards carousel is rendered too far outside the visible area.
Context:

- The flickering carousel is used in the hero section (`src/app/[locale]/(root)/(home)/heroSection.tsx`).
- Skip button is absolutely positioned to the left or right of the cards container.
  Clues / relevant areas:
- `src/components/flickeringCards.tsx`:
  - Skip button near lines ~876+: absolute positioning uses `left-[calc(100%+1rem)]` / `right-[calc(100%+1rem)]`
  - Likely off-screen for smaller widths or when container is already near viewport edges

## Lamp card auto-scroll continues during focus/hover interactions

Problem statement: The carousel auto-scroll continues when focus is on the skip button, skip menu, or exit button; it should pause on any hover/focus within the section (including tab-only controls).
Context:

- Auto-advance is controlled by `isUserInteractingRef` and a 10s interval.
- Focus/hover tracking only marks interaction when focus is within the cards container.
  Clues / relevant areas:
- `src/components/flickeringCards.tsx`:
  - Auto-advance interval uses `isUserInteractingRef` around ~696
  - `isUserInteractingRef` set on focus/blur of `cardsContainerRef` only
  - Skip button and indicator/exit controls live outside the cards container, so they don’t block auto-advance

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

## Improve “item added to plan” animation (badge sway)

Problem statement: Current plan badge bump animation is too subtle; desired effect is a “shaking/swaying” quantity badge.
Context:

- The basket icon uses `isBumped` to apply a ring and scale effect.
  Clues / relevant areas:
- `src/components/layout-navigation/header.tsx`
  - `isBumped` state + effect tied to `itemCount` (lines ~70–81)
  - Badge styling uses `scale-110` + glow when bumped

## Animation performance program

Problem statement: The page mounts several independent continuous animation
systems without a common lifecycle or frame budget. It is not yet known which
effects can be preserved on target hardware, making further visual polish
risky.

Observed systems:

- Hero fog and lightning use separate full-DPR WebGL canvases. The fog shader
  is computationally expensive; lightning currently ignores the hero's pause
  state; both RAF chains remain scheduled while idle.
- The hero also runs Motes/tsParticles, lamp flicker, carousel intervals,
  multiple decorative Motion layers, and nine `MorphingText` instances.
- Five additional `MorphingText` instances run in availability cards. Each
  instance currently owns a perpetual RAF, and carousel turnover can start nine
  blur/filter morphs together.
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
- `src/app/[locale]/(root)/(home)/availabilitySection.tsx`
- `src/app/[locale]/(root)/(home)/ctaSection.tsx`

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
Dependencies / Relations: Simplifying/streamlining modal management (e.g., fixing the "Plan drawer Configure flow" issue above) is semi-dependent on finishing this framework.
Context:

- Prototype patterns now live in starter-pack (`references/nextjs-with-optional-python-server/singleton-modal.tsx.example`) and dullahan-web machine layer.
  Clues / relevant areas:
- `starter-pack/references/nextjs-with-optional-python-server/singleton-modal.tsx.example`
- `dullahanUI/packages/dullahan-web/src/core/machine/react.tsx`
- `OPEN_ISSUES.md` / `PLANNING.md` M1–M3 for follow-up and standardization goals

