import { useState } from 'react';

export const useServerAction = <I extends Array<any>, O>(
  action: (...args: I) => Promise<O>,
  initialState: Awaited<O>
) => {
  const [state, setState] = useState(initialState);

  const execute = async (...args: I) => {
    const result = await action(...args);
    setState(result);
    return result;
  };

  return [state, execute] as const;
};
