# Issues

## Recommended Priorities

1.  **Normalize the Plan Store (Data Integrity)**
    - **Goal:** Make the plan store source-agnostic. Stop tracking "quick pick" vs "template".
    - **Method:** Use `uuid` for stable identity. Compute status dynamically: `status = getMissingFields(item).length > 0 ? 'incomplete' : 'complete'`.
    - **Fixes:** The "configure replaces item" bug and simplifies the "needs configuration" logic.

2.  **Viewport Manager (Performance)**
    - **Goal:** Centralize scroll/visibility tracking to tame heavy animations.
    - **Method:** Expand `links.tsx` into a "Page Director" that broadcasts `activeSection`.
    - **Benefit:** `Fog`, `Streetlamp`, etc. subscribe to this single source of truth and unmount/pause when not in the active section.

3.  **Hybrid Forms (Architecture)**
    - **Goal:** Future-proof the Contact Form for AI/Agent interaction.
    - **Method:** Adopt the `test3` (Server Actions + State Machine) pattern.
    - **Insight:** This ensures human clicks and AI tool calls use the exact same validation and state transitions.

4.  **UI Polish (Interaction)**
    - **Goal:** High-visibility "trust" improvements.
    - **Tasks:** Add "Configure Template →" anchors to use-case cards; add "shaking" animation to the plan basket.

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

## Featured availability cards: remove the icon

Problem statement: Featured availability cards include an icon that adds unnecessary visual noise.
Context:

- Availability cards are rendered in the home page availability section.
  Clues / relevant areas:
- `src/app/[locale]/(root)/(home)/availabilitySection.tsx`:
  - `Cpu` icon rendered near card title

## Use-case cards need a clearer interaction surface

Problem statement: Use-case cards are clickable, but the interaction is not obvious; users may not realize they need to click the card.
Context:

- Current UI uses a full-card `<button>` with no explicit CTA.
- **Proposed Solution:**
  - Keep the **whole card** as the click target (Fitts's Law).
  - Add a visual anchor at the bottom: "Configure Template →".
  - Ensure hovering the card triggers the hover state of the anchor link to reinforce the relationship.
    Clues / relevant areas:
- `src/app/[locale]/(root)/(home)/useCaseSection.tsx`:
  - Card is a `<button>`; no visible “view details” / “choose” CTA

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

## Plan items should not display “quick pick” / “template” labels

Problem statement: Plan should only contain items that are fully configured or partially configured, without origin labels (e.g., “Template:” or “Quick pick:”).
Context:

- “Quick pick” titles are generated in the availability section.
- “Template” titles are generated in the use-case modal.
  Clues / relevant areas:
- `src/app/[locale]/(root)/(home)/availabilitySection.tsx`
  - Uses `tPlan('quickPickTitle', { model })` for plan items
- `src/components/modals/UseCaseTemplatesModal.tsx`
  - Adds items with `title: Template: ...`

## Plan drawer “Configure” flow appears to replace items

Problem statement: Configuring an item appears to replace or overwrite the existing entry rather than “completing” it in a standardized way.
Dependencies / Relations: Addressing this comprehensively may benefit from the "singletonModal system" (below) to standardize how modals interact with the plan store.
Context:

- Plan store de-dupes by `title` (same title increments quantity).
- **Proposed Solution (Normalized Plan):**
  - Assign a `uuid` to every plan item.
  - Stop using "titles" for identity.
  - When "Configuring", pass the `uuid` to the modal.
  - The modal action becomes `updateItem(uuid, changes)` instead of `delete` + `add`.
  - Compute "needs configuration" dynamically based on missing fields (`region`, `provider`, etc.) rather than origin type.
    Clues / relevant areas:
- `src/stores/plan.ts`
  - `addItem` merges by `title` (no merge of specs/details)
- `src/components/layout-navigation/header.tsx`
  - `handleConfigureItem` opens `GpuModal`
  - `onAddToPlan` adds a configured item and decrements the placeholder
  - If titles collide, specs/details may remain from the placeholder

## Contact form layout: long plan list can push the form out of view

Problem statement: In the contact section, when the left-side "selected configurations" / plan summary grows tall (many items), it can stretch downward so far that the right-side contact form is no longer visible within the section, undermining conversion.
Context:

- The contact UI appears to be a two-column layout: plan/config selections on the left, form on the right with a constrained/fixed height.
- When the left column becomes taller than the available viewport, the user can scroll the left content but loses the right column form (or has to scroll awkwardly to find it again).
- **Desired behavior:** The form column should "float" / remain visible as the user scrolls through a long configurations list (e.g., via `position: sticky` or a scroll container strategy), so the form effectively “follows you”.
  Clues / relevant areas:
- `src/components/forms/contact-with-plan-form.tsx`
- `src/app/[locale]/(root)/(home)/contactSection.tsx` (if it composes the contact + plan form layout)
- Any wrappers applying fixed heights / overflow, e.g. Tailwind classes like `h-*`, `max-h-*`, `overflow-y-auto`, `sticky`, `top-*`

## Fog canvas animation is too resource intensive

Problem statement: The fog effect is still too heavy; optimizations risk breaking the look.
Context:

- Fog uses WebGL + custom shaders (lightning layer + volumetric noise) and runs continuously.
  Clues / relevant areas:
- `src/components/ui/fog.tsx`
  - WebGL shader with configurable `shaderIterations`, `shaderResolutionScale`, `shaderFpsCap`
  - Continuous `requestAnimationFrame` + large canvas sizes

## Add IntersectionObservers so animations only run when visible

Problem statement: Animations should pause when offscreen to reduce CPU/GPU cost.
Dependencies / Relations: Semi-dependent on finishing the "links system" (below) to leverage a centralized observer pattern rather than ad-hoc observers.
Context:

- Several components animate continuously even when not visible.
- **Proposed Solution (Viewport Manager):**
  - Do not add individual observers to every component.
  - Use the central `links.tsx` system to broadcast the `activeSection`.
  - Components like `Fog` subscribe to `useStore(s => s.activeSection)` and unmount/pause when their section is not active.
    Clues / relevant areas:
- `src/components/ui/fog.tsx` (canvas + shader animation loop)
- `src/components/ui/streetlamp.tsx` (lamp flicker + motes)
- `src/components/flickeringCards.tsx` (auto-advance interval + morphing text)
- `src/components/ui/spotlight-area.tsx` + `src/components/ui/canvas-reveal-effect.tsx` (canvas-based reveal)
- CTA uses IntersectionObserver already (`src/app/[locale]/(root)/(home)/ctaSection.tsx`) as a pattern to follow

## Complete `links.tsx` system (i18n anchors + ToC + IO)

Problem statement: Links/anchors are not standardized; need an i18n-aware “location” system with integrated IntersectionObservers and URL updates.
Dependencies / Relations: This system is a prerequisite for the "Add IntersectionObservers" and "Pause animations" tasks (above/below), as it provides the location-aware infrastructure.
Context:

- There is a partial links config + hook + UI store for visibility.
- **Goal:** Evolve this into a "Page Director" / "Viewport Manager" that acts as the single source of truth for "Where is the user?"
- Anchor IDs are stored as i18n strings, but there’s no standardized observer to update URL/ToC state.
  Clues / relevant areas:
- `src/components/layout-navigation/links.tsx`
  - `linksConfig` with `textKey` + `intlAnchorKey`
  - `PageAnchor` helper (just sets `id` and scroll class)
- `src/components/layout-navigation/useLinks.tsx`
  - Translates `intlAnchorKey` into runtime anchor strings
- `src/stores/ui.ts`
  - `visibilities.anchors` array used by navbar for highlighting
- `src/components/layout-navigation/navbar.tsx`
  - Uses `visibilities.anchors` to highlight active link

## Complete singletonModal system (currently sketched)

Problem statement: Modal flows are inconsistent; singleton modal system is not completed.
Dependencies / Relations: Simplifying/streamlining modal management (e.g., fixing the "Plan drawer Configure flow" issue above) is semi-dependent on finishing this framework.
Context:

- Prototype exists in `test1` with commented scaffolding, dialog/drawer switching, and store-driven templates.
  Clues / relevant areas:
- `test1/singletonModal.tsx`, `test1/ui.ts`, `test1/layout.tsx` (commented)
- `ISSUES.md` for follow-up and standardization goals

## After links/anchors IO system, pause animations when not visible

Problem statement: Once the location/IntersectionObserver system is in place, use it as the centralized mechanism to pause heavy animations.
Context:

- This is a follow-on integration once the links/ToC system provides consistent visibility state.
  Clues / relevant areas:
- `src/stores/ui.ts` (central visibility store candidate)
- Components listed in the IntersectionObserver issue above

## Ongoing

### `test1/` — singletonModal prototype

Context:

- Commented sketches for a standardized modal wrapper with dialog/drawer switching and a UI store.
  Clues / relevant areas:
- `test1/singletonModal.tsx`, `test1/ui.ts`, `test1/layout.tsx`

### `test2/` — hybrid client/server page framework sketch

Context:

- Page “model” pattern split into `serverOnly` / `shared` / `clientOnly`
- `PageShell` uses React Query prefetching + `HydrationBoundary` and per-page Zustand store
- **Assessment:** A standardized pattern providing essential extensibility and flexibility.
- **Strategic Value:** Intended to work in tandem with the `test3` patterns to form the backbone of the state-machine driven / LLM API architecture.
  Clues / relevant areas:
- `test2/lib/pageModel.ts`, `test2/commonPageState.ts`
- `test2/lib/pageShell.tsx`, `test2/lib/pageShellClient.tsx`
- `test2/globalStore.ts`, `test2/app/layout.tsx`
- Example pages: `test2/app/users/*`, `test2/app/projects/*`
- Future ideas: `test2/todos.md` (server actions, cookie/storage syncing, hybrid state machine, partial hydration)

### `test3/` — hybrid server actions + forms experiments

Context:

- Minimal client hook for server actions and structured submission state.
- RHF helper for server actions; cookie/store sync scaffolding.
- **Assessment:** The "Gold Standard" for forms.
- **Key Insight:** The "Server Action as State Transition" pattern is critical for future **LLM/Agent interaction**. It ensures that whether a human clicks a button or an AI agent calls a tool, the business logic, validation, and state updates are identical.
  Clues / relevant areas:
- `test3/useServerAction.tsx`, `test3/types.ts`, `test3/actions.tsx`
- `test3/form.ts`, `test3/clientSync.tsx`, `test3/page.tsx`
