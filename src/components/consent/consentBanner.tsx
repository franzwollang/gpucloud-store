'use client';

import { useAppTranslations } from '@/i18n';
import Image from 'next/image';

import CookieImg from '../../../public/assets/images/cookie.svg';
import { Button } from '../ui/button';
import {
  allConsentCookie,
  type ConsentCookie,
  defaultConsentCookie
} from './consentCookie';

type ConsentBannerProps = {
  openSettings: () => void;
  readConsentCookie: () => string | undefined;
  updateConsentCookie: (consentCookie: ConsentCookie) => void;
  updateGtmConsent: (consentCookie: ConsentCookie) => void;
  dismiss: () => void;
};

export default function ConsentBanner({
  openSettings,
  updateConsentCookie,
  updateGtmConsent,
  dismiss
}: ConsentBannerProps) {
  const t = useAppTranslations('UI.consent');

  return (
    <div className="relative h-full w-full">
      <div className="flex h-full w-full flex-col">
        <div className="m-6 mb-1 flex flex-grow items-center justify-start">
          <Image
            className="h-16 w-16 sm:h-24 sm:w-24 2xl:h-32 2xl:w-32"
            src={CookieImg}
            alt={t('cookieAlt')('A crumbling cookie.')()}
            priority
          />
          <h2 className="ml-[max(10%,2rem)] flex flex-col items-center sm:ml-[2rem]">
            <span>{t('bannerTitleLine1')('We Care About')()}</span>
            <span>{t('bannerTitleLine2')('Your Privacy')()}</span>
          </h2>
        </div>
        <div className="mx-8 flex flex-col justify-start gap-2 overflow-y-scroll pr-4 scrollbar-visible">
          <p>{t('bannerBody1')('We use cookies to personalise content and ads, to provide social media features and to analyse our traffic. We also share information about your use of our site with our social media, advertising and analytics partners who may combine it with other information that you’ve provided to them or that they’ve collected from your use of their services.')()}</p>
          <p>{t('bannerBody2')('You may accept or manage your choices by clicking below or at any time in the privacy policy page.')()}</p>
          <div>
            <a
              className="text-blue-500 underline"
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('privacyPolicy')('Privacy Policy')()}
            </a>
          </div>
        </div>
        <div className="m-2 mt-1 flex flex-grow flex-col items-center justify-center gap-1 pb-1 sm:flex-row-reverse">
          <Button
            className="w-48"
            onClick={() => {
              updateConsentCookie(allConsentCookie);
              updateGtmConsent(allConsentCookie);
              dismiss();
            }}
          >
            {t('acceptAll')('Accept All Cookies')()}
          </Button>
          <Button
            variant={'outline'}
            className="w-48"
            onClick={() => {
              openSettings();
              dismiss();
            }}
          >
            {t('customize')('Customize Settings')()}
          </Button>
          <Button
            variant={'outline'}
            className="w-48"
            onClick={() => {
              updateConsentCookie(defaultConsentCookie);
              dismiss();
            }}
          >
            {t('necessaryOnly')('Necessary Cookies Only')()}
          </Button>
        </div>
      </div>
    </div>
  );
}
