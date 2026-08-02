# Open Issues

Active work only. History: `OPEN_ISSUES_LOG.jsonl`. Roadmap: `PLANNING.md`.

## Immediate UI Refinements

## Post-merge review findings (PR #3–#17 stack)

Defects found while reviewing merged tip `1c6b4ac` (local `pnpm typecheck` green).

1.  **Use-case “Add and Configure” duplicates plan items** (P0)
    - `UseCaseTemplatesModal` calls `addTemplateItems()` then opens configure; `UseCaseGpuConfigureLayer` always `addItem()` and never receives `configuringItemId` / `updateItem`.
    - Contact/header configure paths were fixed; this path was not.
    - Accept: configure updates the existing incomplete row(s) by uuid; no extra rows.

2.  **Catalog normalize collapses all offerings to `gpuCount: 1`** (P1)
    - `src/lib/catalog/normalize.ts` emits 1× SKUs only; configure then overwrites multi-GPU template counts to 1.
    - Generic feed SKUs (`h100`, `a100`) alias into SXM families; cheapest-wins + max-VRAM merge can misprice/mislabel (40GB price with 80GB display).
    - Accept: cluster sizes usable in configure; priced SKU matches displayed family/VRAM; prefer specific SXM SKUs over generic aliases when both exist.

3.  **`/api/perf-lab` is unauthenticated read/write** (P1)
    - Shared in-memory store; no auth, size, or rate limits; cross-tenant leakage on warm instances.
    - Accept: gate behind `NODE_ENV`/secret, or remove GET listing from production; bound POST body size.

4.  **M3.1 off-hero idle incomplete** (P2)
    - PageDirector `isNear`/`isActive` + dwell; CRT/spotlight/fog/lamp/carousel/motes/halo gated; all `EffectName` overrides wired. Remaining: confirm off-section work ≈ 0 on device baselines.
    - Accept: per M3.1 exit in `PLANNING.md`.

## Recommended Priorities

1.  **Animation Performance Program**
    - **Goal:** Determine which visual effects are viable, establish a measured frame budget, and make animation quality self-settling on the available device matrix (Samsung S21, Nothing Phone 4a, MacBook Pro M3).
    - **Method:** Instrument first with recoverable console and/or server-side scenario logs; expand `PageDirector` into the shared visibility source; remove invisible work; then introduce adaptive High / Medium / Low tiers before attempting a unified fog/lightning renderer.
    - **Benefit:** Existing polish can be retained or simplified based on evidence, and future effects can be added against known performance headroom.
    - **M3.0 progress:** Full scenario set + `runAll` (includes `off-hero-idle`), WebGL timer queries, effect overrides, `data-perf-lab` markers. Still open: device baselines on S21 / Nothing 4a / MBP M3 and top-contributor ID.
    - **M3.1 progress (partial):** MorphingText idle RAF teardown; fog/lightning RAF pause + DPR 1.25; Streetlamp pause-only; motes density 0 / 30 FPS; CRT warm-pause + spotlight `frameloop` gate; PageDirector hysteresis; Halo + Predator effect overrides wired. Still open: device baselines confirming near-zero off-section work.
    - **Roadmap:** `PLANNING.md` M3.0–M3.6.

2.  **Hybrid Forms (Architecture)** — remaining after layout + `updateItem` configure
    - **Goal:** Shared human/agent contact submit path.
    - **Remaining:** Map server Zod issues onto RHF `setError`; dullahan action-registry polish when swapping the in-repo stand-in (`dullahanUI/packages/dullahan-web`) for the real package; persist stub stays until M5.
    - **Insight:** Human clicks and AI tool calls should share the same validation and state transitions.

3.  **Catalog enrichment when API keys arrive** (post–M6 MVP)
    - **Goal:** Correct bare-metal labeling and stock without changing `GpuCatalog` shape.
    - **When keys land:** Shadeform `deployment_type=baremetal`; Latitude.sh `GET /plans?filter[gpu]=true`.
    - **Notes:** `src/server/catalog/enrichment.md`; keep gpurentalprices snapshot as fail-soft base.

## Animation performance program

Problem statement: The page mounts several independent continuous animation
systems without a common lifecycle or frame budget. It is not yet known which
effects can be preserved on target hardware, making further visual polish
risky.

Observed systems:

- Hero fog and lightning use separate full-DPR WebGL canvases. The fog shader
  is computationally expensive; RAF now stops while paused (contexts stay warm)
  and CSS gradient drift freezes off-section. Still no shared hysteresis/dwell.
- Hero lamp flicker, carousel auto-advance, and motes density now pause when
  the hero leaves the viewport; decorative Motion/Halo CSS may still run while
  mounted. Nine hero `MorphingText` instances remain.
- Five additional `MorphingText` instances run in availability cards. Morph RAF
  schedules only during morph/filter-fade (idle teardown done) and can be
  force-disabled via the `carouselMorphs` override; carousel turnover can still
  start many morphs together.
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
   **Partial:** hero fog/lightning RAF pause + lamp/carousel/motes/halo gate +
   MorphingText idle RAF teardown + CRT/spotlight gates + PageDirector
   `isNear`/`isActive` hysteresis + `off-hero-idle` scenario. Still need
   device confirmation of near-zero off-section work.
3. **Remove workload multipliers:** Cap backing DPR without reducing fog
   iteration depth; skip lightning draws between storms; put spotlight into
   demand mode; reduce Motes duty further; simplify CRT invalidation; remove
   per-frame React state from Predator / MorphingText filter fades.
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

## Complete singletonModal system (currently sketched)

Problem statement: Modal flows are inconsistent; singleton modal system is not completed.
Dependencies / Relations: Plan configure already uses `updateItem` by uuid; finishing singletonModal would still de-duplicate GpuModal state across header/contact/use-case.
Context:

- Prototype patterns now live in starter-pack (`references/nextjs-with-optional-python-server/singleton-modal.tsx.example`) and dullahan-web machine layer.
  Clues / relevant areas:
- `starter-pack/references/nextjs-with-optional-python-server/singleton-modal.tsx.example`
- `dullahanUI/packages/dullahan-web/src/core/machine/react.tsx`
- `OPEN_ISSUES.md` / `PLANNING.md` M1–M3 for follow-up and standardization goals

