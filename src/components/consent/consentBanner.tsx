'use client';

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import CookieImg from '../../../public/assets/images/cookie.svg';
import { Button } from '../ui/button';
import {
  allConsentCookie,
  ConsentCookie,
  consentCookieModel,
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
  readConsentCookie,
  updateConsentCookie,
  updateGtmConsent,
  dismiss
}: ConsentBannerProps) {
  const t = useTranslations();

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="flex-grow m-6 mb-1 flex items-center justify-start">
          <Image
            className="w-16 h-16 sm:w-24 sm:h-24 2xl:w-32 2xl:h-32"
            src={CookieImg}
            alt="A crumbling cookie."
            priority
          />
          <h2 className="flex flex-col items-center ml-[max(10%,2rem)] sm:ml-[2rem]">
            <span>We Care About</span>
            <span>Your Privacy</span>
          </h2>
        </div>
        <div className="overflow-y-scroll mx-8 flex flex-col justify-start gap-2">
          <p>
            We use cookies to personalise content and ads, to provide social
            media features and to analyse our traffic. We also share information
            about your use of our site with our social media, advertising and
            analytics partners who may combine it with other information that
            you’ve provided to them or that they’ve collected from your use of
            their services.
          </p>
          <p>
            You may accept or manage your choices by clicking below or at any
            time in the privacy policy page.
          </p>
          <div>
            <a
              className="text-blue-500 underline"
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center flex-col sm:flex-row-reverse m-2 mt-1 pb-1 gap-1">
          <Button
            className="w-48"
            onClick={() => {
              updateConsentCookie(allConsentCookie);
              updateGtmConsent(allConsentCookie);
              dismiss();
            }}
          >
            Accept All Cookies
          </Button>
          <Button
            variant={'outline'}
            className="w-48"
            onClick={() => {
              openSettings();
              dismiss();
            }}
          >
            Customize Settings
          </Button>
          <Button
            variant={'outline'}
            className="w-48"
            onClick={() => {
              updateConsentCookie(defaultConsentCookie);
              dismiss();
            }}
          >
            Necessary Cookies Only
          </Button>
        </div>
      </div>
    </div>
  );
}
