"use client";

import Script from "next/script";
import { defaultConsentCookie } from "./consentCookie";

type PreloadGaConsentProps = {
	consentCookieName: string;
};

export default function PreloadGaConsent({
	consentCookieName
}: PreloadGaConsentProps) {
	return (
		<Script id="preload-default-ga-consent" strategy="beforeInteractive">
			{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}

					const cookies = Object.fromEntries(document.cookie.split('; ').map(v=>v.split(/=(.*)/s).map(decodeURIComponent)))

					const consentCookie = JSON.parse(cookies["${consentCookieName}"] || '{}')

					if(cookies["${consentCookieName}"]){
						gtag('consent', 'default', consentCookie);
					} else {
						gtag('consent', 'default', ${JSON.stringify(defaultConsentCookie)});
					}
				`}
		</Script>
	);
}
