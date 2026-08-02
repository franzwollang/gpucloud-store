import { useTranslations as baseUseTranslations } from 'next-intl';
import { getTranslations as baseGetTranslations } from 'next-intl/server';

import type {
  LeafPaths,
  PathValue,
  PathValueWithIndices,
  Paths
} from '@/lib/typing';

import type { AppMessages } from './appMessages';

type MessageTree = Record<string, unknown>;

type HasIcuParams<S extends string> = S extends `${string}{${string}`
  ? true
  : false;

type TranslationValues = Record<string, string | number | Date>;

/** Union of string leaf values under a message subtree (default locale). */
export type DefaultLangLeaves<M extends MessageTree> = PathValueWithIndices<
  M,
  LeafStringPaths<M>
>;

/** Default-lang string at key `K`. */
export type DefaultLangValue<
  M extends MessageTree,
  K extends string
> = PathValueWithIndices<M, K> & string;

/** Dot paths whose resolved value is a `string`. */
export type LeafStringPaths<M extends MessageTree> = {
  [P in LeafPaths<Paths<M>> & string]: PathValueWithIndices<M, P> extends string
    ? P
    : never;
}[LeafPaths<Paths<M>> & string];

/** Dot paths whose resolved value is not a `string` (for `t.raw`). */
export type RawMessagePaths<M extends MessageTree> = {
  [P in LeafPaths<Paths<M>> & string]: PathValueWithIndices<M, P> extends string
    ? never
    : P;
}[LeafPaths<Paths<M>> & string];

type FinishTranslateArgs<D extends string> = HasIcuParams<D> extends true
  ? [values: TranslationValues]
  : [];

/**
 * Three-call translator:
 *   t('hero.title')('GPUCloud')()
 *   t('haloSearch.gpuCluster')('{count} GPU cluster')({ count })
 *
 * 1) key — infers path
 * 2) default-lang literal — IntelliSense + exact match
 * 3) ICU values or empty `()`
 */
type AppTranslateFn<M extends MessageTree> = <
  K extends LeafStringPaths<M> & string
>(
  key: K
) => <D extends DefaultLangValue<M, K>>(
  defaultText: D
) => (...args: FinishTranslateArgs<D>) => string;

export type AppTranslator<M extends MessageTree> = AppTranslateFn<M> & {
  raw: <K extends RawMessagePaths<M> & string>(
    key: K
  ) => PathValueWithIndices<M, K>;
};

type NamespaceMessages<NS extends Paths<AppMessages> | undefined> =
  NS extends Paths<AppMessages> ? PathValue<AppMessages, NS> : AppMessages;

type BaseTranslator = ReturnType<typeof baseUseTranslations>;

function wrapTranslator<M extends MessageTree>(
  baseT: BaseTranslator
): AppTranslator<M> {
  const translate = ((key: string) => {
    return (_defaultText: string) => {
      return (...args: [TranslationValues?]) => {
        return baseT(key, args[0] as never);
      };
    };
  }) as AppTranslateFn<M>;

  return Object.assign(translate, {
    raw: ((key: string) => baseT.raw(key) as unknown) as AppTranslator<M>['raw']
  });
}

export function useAppTranslations<
  const NS extends Paths<AppMessages> | undefined = undefined
>(namespace?: NS): AppTranslator<NamespaceMessages<NS>> {
  const baseT = baseUseTranslations(namespace as never);
  return wrapTranslator<NamespaceMessages<NS>>(baseT);
}

export async function getAppTranslations<
  const NS extends Paths<AppMessages> | undefined = undefined
>(namespace?: NS): Promise<AppTranslator<NamespaceMessages<NS>>> {
  const baseT = await baseGetTranslations(namespace as never);
  return wrapTranslator<NamespaceMessages<NS>>(baseT);
}
