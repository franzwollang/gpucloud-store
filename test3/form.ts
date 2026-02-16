import { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Makes a Next server action compatible with React Hook Form
 * See https://github.com/react-hook-form/react-hook-form/issues/10391
 */
export function rhfWithAction<T extends Array<any>, F extends FieldValues>(
  rhfFormTrigger: UseFormReturn<F>['trigger'],
  action: <S extends any | void>(...args: T) => Promise<S>
) {
  return async (...args: T) => {
    const valid = await rhfFormTrigger();

    if (valid) {
      return await action(...args);
    }
  };
}
