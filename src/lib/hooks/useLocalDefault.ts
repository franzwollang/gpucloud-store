import { useEffect, useState } from 'react';

export function useLocalDefault<T>(state: T, defaultValue: T) {
  const [localState, setLocalState] = useState<T>(defaultValue);

  useEffect(() => {
    setLocalState(state);
  }, [state]);

  return localState;
}
