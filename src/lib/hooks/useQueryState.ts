'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

type QueryRecord = Record<string, unknown>;

interface UseQueryStateConfig<T extends z.ZodType<QueryRecord>> {
  schema: T;
  defaultValues: z.infer<T>;
}

/**
 * A hook to manage state synchronized with the URL query parameters.
 * @link https://angelhodar.com/blog/reusable-usequeryparams-hook-nextjs-validation-zod
 */
export function useQueryState<T extends z.ZodType<QueryRecord>>(
  config: UseQueryStateConfig<T>
): {
  queryParams: z.infer<T>;
  setQueryParams: (newParams: Partial<z.infer<T>>) => void;
} {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [queryParams, setQueryParamsState] = useState<z.infer<T>>(() => {
    const jsonParsedParams = [...searchParams.entries()].reduce<QueryRecord>(
      (acc, [key, value]) => {
        try {
          return { ...acc, [key]: JSON.parse(value) };
        } catch {
          return acc;
        }
      },
      {}
    );

    const initialParse = config.schema.safeParse({
      ...config.defaultValues,
      ...jsonParsedParams
    });
    return initialParse.success ? initialParse.data : config.defaultValues;
  });

  const setQueryParams = (newParams: Partial<z.infer<T>>) => {
    const mergedParams = { ...queryParams, ...newParams };

    const parsedQuery = config.schema.safeParse(mergedParams);

    if (parsedQuery.success) {
      const jsonifiedParams = Object.entries(
        parsedQuery.data as QueryRecord
      ).reduce<Record<string, string>>((acc, [key, value]) => {
        return { ...acc, [key]: value ? JSON.stringify(value) : 'null' };
      }, {});

      setQueryParamsState(parsedQuery.data);

      const newUrlParams = new URLSearchParams(jsonifiedParams);

      window.history.pushState(
        null,
        '',
        `${pathname}?${newUrlParams.toString()}`
      );
    }
  };

  return {
    queryParams,
    setQueryParams
  };
}
