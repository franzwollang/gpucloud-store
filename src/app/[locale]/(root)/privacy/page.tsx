import { getAppTranslations } from '@/i18n';

export default async function Privacy() {
  const t = await getAppTranslations('UI.legal');

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-fg-main text-3xl font-semibold">{t('privacyTitle')('Privacy')()}</h1>
      <p className="text-fg-soft mt-4 text-sm">{t('privacyStub')('Privacy policy content coming soon.')()}</p>
    </div>
  );
}
