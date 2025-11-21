import ProvidersServer from '@/components/providersServer';
import type { SupportedLocale } from '@/i18n';

interface ServerRootLayoutProps {
  params: Promise<{ locale: SupportedLocale }>;
  children: React.ReactNode;
}

export default async function ServerRootLayout({
  children,
  params
}: ServerRootLayoutProps) {
  const { locale } = await params;

  return (
    <>
      <ProvidersServer locale={locale}>{children}</ProvidersServer>
    </>
  );
}
