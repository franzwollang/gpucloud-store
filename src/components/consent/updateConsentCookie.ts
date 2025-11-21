"use server";

import { setCookie } from "cookies-next";
import { addDays } from "date-fns";
import { ConsentCookie } from "./consentCookie";
import { cookies } from "next/headers";

type UpdateConsentCookieParams = {
	consentCookie: ConsentCookie;
};

export default async function updateConsentCookie({
	consentCookie
}: UpdateConsentCookieParams) {
	setCookie("COOKIE_CONSENT", JSON.stringify(consentCookie), {
		cookies,
		expires: addDays(new Date(), 182)
	});
}
