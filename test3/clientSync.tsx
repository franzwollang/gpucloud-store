'use client';

import { setCookie } from 'cookies-next';
import { OptionsType } from 'cookies-next/lib/types';
import { addSeconds } from 'date-fns';
import { useEffect } from 'react';

import { useBoundStore } from '@/stores/bound';
import { useUIStore } from '@/stores/ui';

export const defaultCookieOptions = (date: Date) => {
  return {
    // see https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html#name-cookie-lifetime-limits
    maxAge: addSeconds(date, 34560000)
  } as OptionsType;
};

type SyncComponentProps = {
  format: 'mobile' | 'desktop';
};

export default function ClientSync({ format }: SyncComponentProps) {
  const { savedFormat, setSavedFormat } = useUIStore((state) => ({
    savedFormat: state.format,
    setSavedFormat: state.setFormat
  }));

  // const { onboardingCompleted } = useBoundStore((state) => ({
  //   onboardingCompleted: state.onboardingCompleted
  // }));

  useEffect(() => {
    const updateCookies = [] as const;

    // sync values & refresh cookies maxAge
    // for (const [cookieName, cookieValue] of updateCookies) {
    //   setCookie(cookieName, cookieValue, defaultCookieOptions(new Date()));
    // }
  }, []);

  useEffect(() => {
    if (savedFormat !== format) {
      setSavedFormat(format);
    }
  }, [format]);

  return <></>;
}
