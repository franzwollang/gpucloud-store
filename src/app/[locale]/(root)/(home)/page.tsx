'use client';

import { Header } from '@/components/layout-navigation/header';

import { ContactSection } from './contactSection';
import { CTASection } from './ctaSection';
import { HeroSection } from './heroSection';
import { SpotlightCard } from './spotlightCard';

export default function TestPage() {
  return (
    <>
      <Header />
      <main className="bg-bg-page text-fg-main flex flex-col items-center justify-start gap-8 overflow-hidden">
        <HeroSection />
        <SpotlightCard />
        <CTASection />
        <ContactSection />
      </main>
    </>
  );
}
