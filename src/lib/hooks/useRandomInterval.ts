import { useCallback, useEffect, useRef } from 'react';
import { rangeRandom } from '../math';

export default function useRandomInterval(
  callback: () => void,
  minDelay: number | null,
  maxDelay: number | null
) {
  const timeoutId = useRef<number | null>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof minDelay === 'number' && typeof maxDelay === 'number') {
      const handleTick = () => {
        const nextTickAt = rangeRandom(minDelay, maxDelay);
        timeoutId.current = window.setTimeout(() => {
          savedCallback.current();
          handleTick();
        }, nextTickAt);
      };

      handleTick();
    }
    return () => window.clearTimeout(timeoutId.current || undefined);
  }, [minDelay, maxDelay]);

  const cancel = useCallback(function () {
    window.clearTimeout(timeoutId.current || undefined);
  }, []);

  return cancel;
}
