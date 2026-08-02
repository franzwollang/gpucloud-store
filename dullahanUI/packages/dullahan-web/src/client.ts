/**
 * Temporary in-repo stand-in for DullahanUI `dullahan-web/client`.
 * Replace with the published / workspace-linked package when available;
 * do not grow this fork beyond what gpucloud-store already imports.
 */
export {
  ClientPageProvider,
  defineClientPageModel,
  type ClientPageProviderProps,
  type ClientPageModel
} from './core/page/clientPage';

export { defineHydratedScope } from './core/page/hydratedScope';
export { definePageTransition } from './core/page/pageTransition';
export { toUserMessage, fieldErrors } from './core/errors/format';

export type { PageTransitionDef } from './core/page/pageTransition';
export type {
  HydratedScopeDef,
  AnyHydratedScope,
  StateOfScope,
  SharedStateOf
} from './core/page/hydratedScope';
export type {
  DullahanResult,
  DullahanError,
  ValidationError,
  DomainError
} from './core/errors/types';
