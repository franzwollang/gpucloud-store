import { getCookie, hasCookie } from "cookies-next";
import { useEffect } from "react";

import ConsentBanner from "@/components/consent/consentBanner";
import updateConsentCookie from "@/components/consent/updateConsentCookie";

import { useUIStore } from "../../stores/ui";
import { ConsentCookie } from "./consentCookie";
import ConsentSettings from "./consentSettings";

export default function useCookieConsentBanner(consentCookieName: string) {
  const [setSingletonModalShow, setSingletonModalContent] = useUIStore(
    (state) => [state.setSingletonModalShow, state.setSingletonModalContent],
  );

  const consentUIArgs = {
    readConsentCookie: () => {
      return getCookie(consentCookieName);
    },
    updateConsentCookie: (consentCookie: ConsentCookie) => {
      updateConsentCookie({ consentCookie });
    },
    updateGtmConsent: (consentCookie: ConsentCookie) => {
      // @ts-ignore
      gtag("consent", "update", consentCookie);
    },
  };

  useEffect(() => {
    if (!hasCookie(consentCookieName)) {
      toast.custom(
        (t) => (
          <ConsentBanner
            {...consentUIArgs}
            openSettings={() => {
              setSingletonModalContent(() => ConsentSettings(consentUIArgs));
              setSingletonModalShow(true);
            }}
            dismiss={() => {
              toast.dismiss(t);
            }}
          />
        ),
        {
          duration: Infinity,
          position: "bottom-left",
          dismissible: false,
          className:
            "h-[90vh] w-[90vw] md:w-[70vw] md:h-[50vh] xl:w-[50vw] 2xl:w-[30vw] 2xl:h-[30vh]",
        },
      );
    }
  }, []);

  return null;
}
