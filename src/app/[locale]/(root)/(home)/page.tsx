'use client';

import { Header } from '@/components/layout-navigation/header';
import { PageDirector } from '@/components/layout-navigation/links';
import { SiteFooter } from '@/components/layout-navigation/footer';

import { ContactSection } from './contactSection';
import { HeroSection } from './heroSection';
import { AvailabilitySection } from './availabilitySection';
import { SpotlightCard } from './spotlightCard';
import { UseCaseSection } from './useCaseSection';

export default function TestPage() {
  return (
    <>
      <Header />
      <PageDirector />
      <main className="bg-bg-page text-fg-main flex flex-col items-center justify-start gap-6 overflow-hidden">
        <HeroSection />
        <AvailabilitySection />
        <UseCaseSection />
        <SpotlightCard />
        <ContactSection />
        <SiteFooter className="w-full" />
      </main>
    </>
  );
}
