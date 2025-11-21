import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout-navigation/footer';
import { getTranslations } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ContactForm } from '@/components/forms/contactForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('HOME');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Home() {
  const t = await getTranslations('HOME');

  return (
    <>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="grid-overlay" />
        <div className="neon-orb orb-1" />
        <div className="neon-orb orb-2" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 pb-16 pt-6">
        {/* Hero Section */}
        <section id="hero" className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-16">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-[0.2em] text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 shadow-[0_0_12px_rgba(0,255,255,0.8)]" />
                {t('hero.eyebrow')}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight tracking-tight">
                {t('hero.headline')}{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-pink-500 bg-clip-text text-transparent">
                  {t('hero.headlineHighlight')}
                </span>
              </h1>

              <p className="text-base text-slate-300 max-w-2xl mb-6">{t('hero.subtitle')}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/16 to-transparent text-cyan-200"
                >
                  {t('hero.tags.consulting')}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/16 to-transparent text-cyan-200"
                >
                  {t('hero.tags.orchestration')}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/16 to-transparent text-cyan-200"
                >
                  {t('hero.tags.hybrid')}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/16 to-transparent text-cyan-200"
                >
                  {t('hero.tags.sourcing')}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 items-center mb-5">
                <Button
                  asChild
                  className="rounded-full px-6 py-3 uppercase tracking-widest text-sm bg-linear-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-[0_0_22px_rgba(0,255,255,0.9),0_0_46px_rgba(0,0,0,0.9)] hover:shadow-[0_0_30px_rgba(0,255,255,1),0_0_52px_rgba(0,0,0,1)] hover:from-cyan-400 hover:to-pink-500 transition-all duration-200"
                >
                  <Link href="#contact">{t('hero.cta.primary')}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full px-6 py-3 uppercase tracking-widest text-sm border-cyan-400/50 bg-gradient-radial from-cyan-400/5 to-transparent text-slate-300 hover:border-pink-500/80 hover:bg-gradient-radial hover:from-pink-500/16 hover:to-transparent hover:shadow-[0_0_18px_rgba(255,46,168,0.8),0_0_32px_rgba(0,0,0,0.9)] transition-all duration-200"
                >
                  <Link href="#about">{t('hero.cta.secondary')}</Link>
                </Button>
              </div>

              <div className="text-xs text-slate-400">{t('hero.meta')}</div>
            </div>

            {/* Hero Card */}
            <Card className="relative rounded-3xl p-5 bg-linear-to-br from-cyan-400/20 via-slate-950/90 to-slate-950/90 border-cyan-400/35 shadow-[0_0_24px_rgba(0,255,255,0.4),0_0_48px_rgba(0,0,0,0.95)] overflow-hidden hero-card">
              <CardContent className="p-0 relative z-10">
                <div className="flex items-center gap-2 mb-3 text-sm uppercase tracking-[0.18em] text-cyan-300">
                  {t('hero.card.title')}
                  <Badge className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/16 bg-black/40 text-cyan-200">
                    {t('hero.card.badge')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-slate-950/85 border border-cyan-400/35 shadow-[0_0_14px_rgba(0,255,255,0.45)]">
                    <div className="text-[0.65rem] uppercase text-slate-400 tracking-widest mb-1">
                      {t('hero.card.metrics.utilization.label')}
                    </div>
                    <div className="text-lg font-semibold">
                      {t('hero.card.metrics.utilization.value')}
                    </div>
                    <div className="text-[0.68rem] text-slate-500 mt-0.5">
                      {t('hero.card.metrics.utilization.sub')}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/85 border border-cyan-400/35 shadow-[0_0_14px_rgba(0,255,255,0.45)]">
                    <div className="text-[0.65rem] uppercase text-slate-400 tracking-widest mb-1">
                      {t('hero.card.metrics.spend.label')}
                    </div>
                    <div className="text-lg font-semibold">{t('hero.card.metrics.spend.value')}</div>
                    <div className="text-[0.68rem] text-slate-500 mt-0.5">
                      {t('hero.card.metrics.spend.sub')}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-300">
                  {t('hero.card.footnote')}{' '}
                  <span className="text-pink-300">{t('hero.card.footnoteHighlight')}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">
              {t('about.eyebrow')}
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t('about.title')}</h2>
            <p className="text-base text-slate-400 max-w-2xl">{t('about.subtitle')}</p>
          </div>

          <div className="grid gap-7 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="mb-4 text-slate-300">{t('about.text.intro')}</p>
              <p className="mb-4 text-slate-300">{t('about.text.mission')}</p>
              <p className="mb-4 text-slate-300">{t('about.text.approach')}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-xs rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/10 to-transparent text-cyan-200"
                >
                  {t('about.pills.strategy')}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-xs rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/10 to-transparent text-cyan-200"
                >
                  {t('about.pills.design')}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-xs rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/10 to-transparent text-cyan-200"
                >
                  {t('about.pills.network')}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-xs rounded-full border-cyan-400/30 bg-gradient-radial from-cyan-400/10 to-transparent text-cyan-200"
                >
                  {t('about.pills.optimization')}
                </Badge>
              </div>
            </div>

            <Card className="rounded-2xl p-4 bg-linear-to-br from-slate-900/95 via-slate-900/90 to-slate-950/90 border-cyan-400/40 shadow-[0_0_22px_rgba(0,255,255,0.4),0_0_32px_rgba(0,0,0,0.9)]">
              <CardContent className="p-0">
                <h3 className="text-sm uppercase tracking-[0.16em] text-cyan-300 mb-3">
                  {t('about.card.title')}
                </h3>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 shadow-[0_0_10px_rgba(0,255,255,0.7)] shrink-0 mt-2" />
                    <span>
                      <strong>{t('about.card.items.orchestration.title')}</strong>{' '}
                      {t('about.card.items.orchestration.text')}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 shadow-[0_0_10px_rgba(0,255,255,0.7)] shrink-0 mt-2" />
                    <span>
                      <strong>{t('about.card.items.hybrid.title')}</strong>{' '}
                      {t('about.card.items.hybrid.text')}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 shadow-[0_0_10px_rgba(0,255,255,0.7)] shrink-0 mt-2" />
                    <span>
                      <strong>{t('about.card.items.sourcing.title')}</strong>{' '}
                      {t('about.card.items.sourcing.text')}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 shadow-[0_0_10px_rgba(0,255,255,0.7)] shrink-0 mt-2" />
                    <span>
                      <strong>{t('about.card.items.alignment.title')}</strong>{' '}
                      {t('about.card.items.alignment.text')}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">
              {t('contact.eyebrow')}
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t('contact.title')}</h2>
            <p className="text-base text-slate-400 max-w-2xl">{t('contact.subtitle')}</p>
          </div>

          <div className="grid gap-7 lg:grid-cols-2">
            <div className="text-slate-300">
              <p className="mb-4">{t('contact.text.intro')}</p>

              <p className="mb-2">{t('contact.text.helpTitle')}</p>
              <ul className="ml-4 mb-4 space-y-1 text-sm">
                <li>{t('contact.text.helpItems.ai')}</li>
                <li>{t('contact.text.helpItems.startups')}</li>
                <li>{t('contact.text.helpItems.companies')}</li>
              </ul>

              <p className="mb-4">{t('contact.text.response')}</p>

              <div className="text-sm text-slate-400 mt-2">
                {t('contact.text.email')}{' '}
                <a
                  href="mailto:shrey@gpucloud.store"
                  className="text-cyan-300 font-medium hover:underline"
                >
                  {t('contact.text.emailAddress')}
                </a>
                .
              </div>
            </div>

            <ContactForm
              translations={{
                name: t('contact.form.name'),
                company: t('contact.form.company'),
                email: t('contact.form.email'),
                role: t('contact.form.role'),
                message: t('contact.form.message'),
                hint: t('contact.form.hint'),
                submit: t('contact.form.submit'),
                submitting: t('contact.form.submitting'),
                success: t('contact.form.success'),
                error: t('contact.form.error'),
                networkError: t('contact.form.networkError'),
                submitError: t('contact.form.submitError'),
              }}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

