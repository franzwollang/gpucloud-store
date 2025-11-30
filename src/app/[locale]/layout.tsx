import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Viewport } from 'next/types';

const devMode = process.env.NODE_ENV === 'development';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

interface ServerRootLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

export default async function ServerRootLayout({
  children,
  params
}: ServerRootLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <>
      <NextIntlClientProvider key={locale} messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
