// 'use client';

// import { GoogleTagManager } from '@next/third-parties/google';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { memo, useEffect, useState } from 'react';

// import PreloadGaConsent from '@/components/consent/preloadGaConsent';
// import useCookieConsentBanner from '@/components/consent/useCookieConsentBanner';
// import { CommandPalette } from '@/components/layout-navigation/commandPalette';
// import useLinks from '@/components/layout-navigation/useLinks';
// import SingletonModal from '@/components/singletonModal';
// import { Toaster } from '@/components/ui/sonner';
// import { SupportedLocale } from '@/i18n';
// import { usePathname } from '@/navigation';
// import { useBoundStore } from '@/stores/bound';
// import '@/styles/globals.css';

// const gtmId = process.env.NEXT_PUBLIC_GTM_ID || '';

// type ClientRootLayoutProps = {
//   children: React.ReactNode;
//   params: { locale: SupportedLocale };
// };

// const devMode = process.env.NODE_ENV === 'development';

// const SingletonModalMemo = memo(SingletonModal);

// export default function ClientRootLayout({
//   children,
//   params: { locale }
// }: ClientRootLayoutProps) {
//   const links = useLinks();
//   const pathname = usePathname();

//   useCookieConsentBanner('COOKIE_CONSENT');

//   useEffect(() => {
//     useBoundStore.persist.rehydrate();

//     // remove as soon as issue with typing of persist key on stores is resolved
//     // @ts-ignore
//     // useSessionStore.persist.rehydrate();
//   }, []);

//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 1000 * 60
//           }
//         }
//       })
//   );

//   return (
//     <>
//       <PreloadGaConsent consentCookieName="COOKIE_CONSENT" />
//       <GoogleTagManager gtmId={gtmId} />
//       <QueryClientProvider client={queryClient}>
//         {children}
//         <CommandPalette links={links} />
//         <SingletonModalMemo />
//         <Toaster />
//         {devMode && (
//           <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
//         )}
//       </QueryClientProvider>
//     </>
//   );
// }
