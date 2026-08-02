# dullahan-web (temporary stand-in)

**This folder is a temporary in-repo stand-in** for the real DullahanUI
`dullahan-web` package. It exists so Vercel/CI can install without the sibling
checkout at `../dullahanUI`.

## Scope

Only the transitive source needed by GPUCloud Store contact hybrid-forms:

- `createServerAction`
- `ClientPageProvider`, `defineClientPageModel`, `defineHydratedScope`,
  `definePageTransition`, `toUserMessage`

Do **not** grow this fork with new Dullahan features. When the real package is
published or available as a proper workspace dependency, delete this tree and
point `package.json` back at that package.

## Source

Sliced from DullahanUI `packages/dullahan-web` (errors / page / registry /
remote / server / minimal state+store). No XState, UI components, or Storybook.
