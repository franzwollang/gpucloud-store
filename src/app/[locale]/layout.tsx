import ProvidersServer from '@/components/providersServer';
import type { SupportedLocale } from '@/i18n';

interface ServerRootLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

export default async function ServerRootLayout({
  children,
  params
}: ServerRootLayoutProps) {
  const { locale } = await params;

  console.log('locale in server layout: ', locale);

  return (
    <>
      <ProvidersServer locale={locale as SupportedLocale}>
        {children}
      </ProvidersServer>
    </>
  );
}
