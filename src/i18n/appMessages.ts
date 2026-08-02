import enUS from '../../public/locales/en-US';

/** Default-lang message tree — sourced from `en-US` (literal-preserving). */
export type AppMessages = typeof enUS;

/**
 * Same key/structure as `AppMessages`, but every string leaf is widened to
 * `string`. Non-default locales `satisfies` this so missing/extra keys fail
 * typecheck without requiring English literal values.
 */
export type MessagesShape = DeepStringLeaves<AppMessages>;

type DeepStringLeaves<T> = T extends string
  ? string
  : T extends readonly (infer _U)[]
    ? { readonly [I in keyof T]: DeepStringLeaves<T[I]> }
    : T extends object
      ? { readonly [K in keyof T]: DeepStringLeaves<T[K]> }
      : T;
