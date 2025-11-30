import { useEffect, useState } from 'react';

export default function useCheckIfMac() {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    try {
      if (window) {
        const test = /mac/i.test(navigator.userAgent || navigator.platform);
        setIsMac(test);
      }
    } catch (error) {}
  }, []);

  return isMac;
}
