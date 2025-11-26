'use client';

import { GoogleTagManager } from '@next/third-parties/google';
import { use } from 'react';

import PreloadGaConsent from '@/components/consent/preloadGaConsent';
// import useCookieConsentBanner from "@/components/consent/useCookieConsentBanner";
// import NavBar from '@/components/layout-navigation/navbar';
import ProvidersClient from '@/components/providersClient';
import useThemeMode from '@/components/useThemeMode';
import { cn } from '@/lib/style';

import '../../../styles/globals.css';
import { fontBody, fontDisplay, fontMono, fontUi } from '../../fonts';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? '';

type ClientRootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default function ClientRootLayout({
  children,
  params
}: ClientRootLayoutProps) {
  const { locale } = use(params);

  console.log('locale in client layout: ', locale);

  useThemeMode();
  // useCommandPalette({ links });
  // useCookieConsentBanner("COOKIE_CONSENT");

  return (
    <html
      lang={locale}
      className={cn(
        'scroll-smooth',
        [
        fontDisplay.variable,
        fontUi.variable,
        fontBody.variable,
        fontMono.variable
        ].join(' ')
      )}
      data-theme="dark"
    >
      <body className={cn('bg-background min-h-screen font-sans antialiased')}>
        <PreloadGaConsent consentCookieName="COOKIE_CONSENT" />
        <GoogleTagManager gtmId={gtmId} />
        <ProvidersClient>
          {/* <NavBar /> */}
          {children}
        </ProvidersClient>
      </body>
    </html>
  );
}
