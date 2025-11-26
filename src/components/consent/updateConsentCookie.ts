'use server';

import { setCookie } from 'cookies-next';
import { addDays } from 'date-fns';
import { cookies } from 'next/headers';

import { type ConsentCookie } from './consentCookie';

type UpdateConsentCookieParams = {
  consentCookie: ConsentCookie;
};

export default async function updateConsentCookie({
  consentCookie
}: UpdateConsentCookieParams) {
  await setCookie('COOKIE_CONSENT', JSON.stringify(consentCookie), {
    cookies,
    expires: addDays(new Date(), 182)
  });
}
