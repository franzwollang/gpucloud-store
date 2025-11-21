'use client';

import { GoogleTagManager } from '@next/third-parties/google';
import { Inter as FontSans } from 'next/font/google';
import { use } from 'react';

import PreloadGaConsent from '@/components/consent/preloadGaConsent';
// import useCookieConsentBanner from "@/components/consent/useCookieConsentBanner";
// import NavBar from '@/components/layout-navigation/navbar';
import ProvidersClient from '@/components/providersClient';
import useDarkMode from '@/components/useDarkMode';
import type { SupportedLocale } from '@/i18n';
import { cn } from '@/lib/style';

import '../../../styles/globals.css';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? '';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
});

type ClientRootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: SupportedLocale }>;
};

export default function ClientRootLayout({
  children,
  params
}: ClientRootLayoutProps) {
  const { locale } = use(params);

  // useDarkMode();
  // useCommandPalette({ links });
  // useCookieConsentBanner("COOKIE_CONSENT");

  return (
    <html lang={locale}>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          fontSans.variable
        )}
      >
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
