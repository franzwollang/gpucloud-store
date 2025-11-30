'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

interface UseQueryStateConfig<T extends z.ZodTypeAny> {
  schema: T;
  defaultValues: z.infer<T>;
}

/**
 * A hook to manage state synchronized with the URL query parameters.
 * @link https://angelhodar.com/blog/reusable-usequeryparams-hook-nextjs-validation-zod
 */
export function useQueryState<T extends z.ZodTypeAny>(
  config: UseQueryStateConfig<T>
): {
  queryParams: z.infer<T>;
  setQueryParams: (newParams: Partial<z.infer<T>>) => void;
} {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [queryParams, setQueryParamsState] = useState<z.infer<T>>(() => {
    const jsonParsedParams = [...searchParams.entries()].reduce(
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
      const jsonifiedParams = Object.entries(parsedQuery.data).reduce(
        (acc, [key, value]) => {
          return { ...acc, [key]: value ? JSON.stringify(value) : 'null' };
        },
        {}
      );

      setQueryParamsState(parsedQuery.data);

      const newUrlParams = new URLSearchParams(jsonifiedParams);

      window.history.pushState(
        null,
        '',
        `${pathname}?${newUrlParams.toString()}`
      );
    } else {
      // console.error('Validation failed:', parsedQuery.error);
    }
  };

  return {
    queryParams,
    setQueryParams
  };
}
