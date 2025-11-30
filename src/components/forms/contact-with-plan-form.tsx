'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { BaseSearch, type GpuOption } from '@/components/search/BaseSearch';
import { GpuModal } from '@/components/search/GpuModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/style';
import type { PlanItem } from '@/stores/plan';
import { usePlanStore } from '@/stores/plan';
import type { Provider } from '@/types/gpu';

import { gpuCatalog } from '../../../public/data';

const createContactFormSchema = (
  items: PlanItem[],
  validationMessages: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    messageOrConfigs: string;
  }
) =>
  z
    .object({
      name: z.string().min(1, validationMessages.nameRequired),
      company: z.string().optional(),
      email: z
        .string()
        .min(1, validationMessages.emailRequired)
        .email(validationMessages.emailInvalid),
      role: z.string().optional(),
      message: z.string().optional()
    })
    .refine(
      data => {
        const hasConfigs = items.length > 0;
        const hasMessage = data.message && data.message.trim().length > 0;
        return hasConfigs || hasMessage;
      },
      {
        message: validationMessages.messageOrConfigs,
        path: ['message']
      }
    );

type ContactFormData = z.infer<ReturnType<typeof createContactFormSchema>>;

export function ContactWithPlanForm() {
  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state management
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [currentDialogOption, setCurrentDialogOption] =
    useState<GpuOption | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const t = useTranslations('TEST.contactForm');
  const searchT = useTranslations('TEST.haloSearch');
  const validation = useTranslations('TEST.contactForm.validation');
  const items = usePlanStore(state => state.items);
  const removeItem = usePlanStore(state => state.removeItem);
  const addItem = usePlanStore(state => state.addItem);

  // Computed values for GpuModal
  const currentGpuType = currentDialogOption?.type ?? '';
  const availableRegions = currentDialogOption?.availableRegions ?? [];

  const availableCombinations = useMemo(() => {
    if (!currentDialogOption || !selectedRegion) return [];

    // Get GPU family from catalog
    const gpuFamily = gpuCatalog.gpus.find(
      gpu => gpu.model === currentDialogOption.type
    );

    if (!gpuFamily) return [];

    // Group offerings by provider and transform to expected format
    const providerMap = new Map<string, Provider>();

    gpuFamily.offerings.forEach(offering => {
      const providerId = offering.providerId;
      const providerInfo = gpuCatalog.providers.find(p => p.id === providerId);

      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          id: providerId,
          name: providerInfo?.name ?? providerId,
          location: offering.regions[0]?.locationLabel ?? 'Unknown',
          supportedSizes: [offering.gpuCount],
          specs: `${offering.nodeSpecs.vcpus} vCPU • ${Math.round((offering.nodeSpecs.memoryGB / 1024) * 10) / 10} TB RAM • ${offering.nodeSpecs.localStorageTB} TB NVMe`,
          regions: offering.regions.map(r => ({
            name: r.locationLabel,
            price: `From $${r.price?.hourlyFrom?.toFixed(2)}/hr`,
            riskMetrics: offering.riskMetrics
          })),
          leadTime: offering.regions[0]?.leadTimeDays
            ? `${offering.regions[0].leadTimeDays.min}-${offering.regions[0].leadTimeDays.max} days`
            : '1-3 days',
          minTerm:
            offering.commercial.minTerm.unit === 'monthly'
              ? `${offering.commercial.minTerm.minimumUnits === 1 ? 'Monthly' : `${offering.commercial.minTerm.minimumUnits}-month`}`
              : 'Monthly',
          shortDetails: gpuFamily.shortDetails,
          details: `Provider: ${providerInfo?.description ?? 'High-performance GPU infrastructure'}`
        });
      } else {
        // Add additional GPU count if not present
        const existingProvider = providerMap.get(providerId)!;
        if (!existingProvider.supportedSizes.includes(offering.gpuCount)) {
          existingProvider.supportedSizes.push(offering.gpuCount);
          existingProvider.supportedSizes.sort((a, b) => a - b);
        }
        // Add regions from this offering
        offering.regions.forEach(region => {
          if (
            !existingProvider.regions.some(r => r.name === region.locationLabel)
          ) {
            existingProvider.regions.push({
              name: region.locationLabel,
              price: `From $${region.price?.hourlyFrom?.toFixed(2)}/hr`,
              riskMetrics: offering.riskMetrics
            });
          }
        });
      }
    });

    const providers = Array.from(providerMap.values());

    return providers
      .map((provider: Provider) => ({
        provider: {
          ...provider,
          // Ensure the provider has the expected structure
          specs: provider.specs ?? `${provider.name} GPU specs`,
          leadTime: provider.leadTime ?? 'Contact for details',
          minTerm: provider.minTerm ?? 'Contact for details',
          shortDetails: provider.shortDetails ?? provider.details ?? '',
          details: provider.details ?? provider.shortDetails ?? ''
        },
        sizes: provider.supportedSizes.filter(
          (size: number) =>
            currentDialogOption.availableSizes.includes(size) &&
            provider.regions.some(r => r.name === selectedRegion)
        )
      }))
      .filter(combination => combination.sizes.length > 0);
  }, [currentDialogOption, selectedRegion, t]);

  const regionRiskMetrics =
    selectedRegion && selectedProvider
      ? (() => {
          const region = selectedProvider.regions.find(
            r => r.name === selectedRegion
          );
          if (!region?.riskMetrics) return undefined;

          // Provide defaults for missing risk metrics
          return {
            naturalDisaster: region.riskMetrics.naturalDisaster ?? 3,
            electricityReliability:
              region.riskMetrics.electricityReliability ?? 3,
            fireRisk: region.riskMetrics.fireRisk ?? 3,
            securityBreach: region.riskMetrics.securityBreach ?? 3,
            powerEfficiency: region.riskMetrics.powerEfficiency ?? 3,
            costEfficiency: region.riskMetrics.costEfficiency ?? 3,
            networkReliability: region.riskMetrics.networkReliability ?? 3,
            coolingCapacity: region.riskMetrics.coolingCapacity ?? 3
          };
        })()
      : undefined;

  const handleDialogClose = () => {
    setDialogIndex(null);
    setCurrentDialogOption(null);
    setSelectedRegion(null);
    setSelectedProvider(null);
    setSelectedSize(null);
  };

  const handleRegionSelect = (region: string | null) => {
    setSelectedRegion(region);
    setSelectedProvider(null);
    setSelectedSize(null);
  };

  const handleProviderSizeSelect = (
    provider: Provider | null,
    size: number | null
  ) => {
    setSelectedProvider(provider);
    setSelectedSize(size);
  };

  const validationMessages = {
    nameRequired: validation('nameRequired'),
    emailRequired: validation('emailRequired'),
    emailInvalid: validation('emailInvalid'),
    messageOrConfigs: validation('messageOrConfigs')
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(createContactFormSchema(items, validationMessages))
  });

  const onSubmit = async (data: ContactFormData) => {
    setFormStatus({ type: 'loading', message: '' });

    try {
      const payload = {
        name: data.name.trim(),
        company: data.company?.trim() ?? '',
        email: data.email.trim(),
        role: data.role?.trim() ?? '',
        message: data.message?.trim() ?? '',
        planItems: items // Include plan items in submission
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormStatus({
          type: 'success',
          message: t('status.success')
        });
        reset();
      } else {
        let errorMessage = t('status.error');
        try {
          const responseData = (await response.json()) as { error?: string };
          if (responseData.error) errorMessage = responseData.error;
        } catch {
          // Use default error message
        }
        setFormStatus({ type: 'error', message: errorMessage });
      }
    } catch (err) {
      console.error(err);
      setFormStatus({
        type: 'error',
        message: t('status.networkError')
      });
    }
  };

  return (
    <div className="grid gap-7 lg:grid-cols-2">
      {/* Left side - Search + Plan items */}
      <div className="text-fg-soft">
        <div className="mb-6">
          <h3 className="text-fg-main mb-3 text-sm font-medium">
            {t('search.title')}
          </h3>
          <BaseSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSelectOption={(index, option) => {
              setCurrentDialogOption(option);
              setDialogIndex(0);
            }}
            modalEnabled={true}
            selectedOption={currentDialogOption}
            onSelectedOptionChange={setCurrentDialogOption}
          />

          {dialogIndex !== null && currentDialogOption && (
            <GpuModal
              dialogIndex={dialogIndex}
              onDialogClose={handleDialogClose}
              currentDialogOption={currentDialogOption}
              currentGpuType={currentGpuType}
              availableRegions={availableRegions}
              selectedRegion={selectedRegion}
              onRegionSelect={handleRegionSelect}
              availableCombinations={availableCombinations}
              selectedProvider={selectedProvider}
              selectedSize={selectedSize}
              onProviderSizeSelect={handleProviderSizeSelect}
              regionRiskMetrics={regionRiskMetrics}
              onAddToPlan={config => {
                addItem({
                  title: config.type,
                  specs: `${config.size} GPU cluster`,
                  price: 'Contact for pricing',
                  details: `Provider: ${config.provider.name} (${config.provider.location})`
                });
                handleDialogClose();
              }}
              t={searchT}
            />
          )}
        </div>

        {/* Plan items - always visible */}
        <div className="border-border/40 bg-bg-surface/50 rounded-lg border p-4">
          <h4 className="text-fg-main mb-1 text-sm font-medium">
            {t('selected.title', { count: items.length })}
          </h4>
          <p className="text-fg-muted mb-3 text-xs">{t('selected.subtitle')}</p>

          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item: PlanItem) => (
                <div
                  key={item.id}
                  className="border-border/30 bg-bg-page/50 flex items-start justify-between gap-2 rounded border p-2"
                >
                  <div className="flex-1">
                    <div className="text-fg-main text-xs font-medium">
                      {item.title}
                    </div>
                    <div className="text-fg-muted mt-0.5 text-[10px]">
                      {t('selected.quantity', {
                        quantity: item.quantity,
                        price: item.price
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-fg-muted hover:text-fg-main rounded p-0.5 transition"
                    aria-label={t('selected.remove')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-fg-muted py-4 text-center text-xs">
              {t('selected.empty')}
            </p>
          )}

          <p className="text-fg-muted mt-3 text-xs">{t('selected.hint')}</p>
        </div>

        <div className="mt-6">
          <p className="text-fg-main mb-2 text-sm font-medium">
            {t('help.title')}
          </p>
          <ul className="mb-4 ml-4 space-y-1 text-sm">
            <li>{t('help.items.infrastructure')}</li>
            <li>{t('help.items.cluster')}</li>
            <li>{t('help.items.hybrid')}</li>
          </ul>

          <p className="text-fg-muted text-sm">{t('help.description')}</p>

          <p className="text-fg-muted text-sm">
            {t('help.emailIntro')}{' '}
            <a
              href={`mailto:${t('help.emailAddress')}`}
              className="text-ui-active-soft font-medium hover:underline"
            >
              {t('help.emailAddress')}
            </a>
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-border/40 bg-bg-surface/50 rounded-2xl border p-5 shadow-lg"
      >
        <div className="mb-6 space-y-2">
          <h3 className="text-fg-main text-lg font-semibold">
            {t('form.title')}
          </h3>
          <p className="text-fg-soft text-sm">{t('form.subtitle')}</p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="name"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.name')}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t('form.placeholders.name')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-ui-danger mt-1 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="company"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.company')}
            </Label>
            <Input
              id="company"
              type="text"
              placeholder={t('form.placeholders.company')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('company')}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="email"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('form.placeholders.email')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-ui-danger mt-1 text-xs">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="role"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.role')}
            </Label>
            <Input
              id="role"
              type="text"
              placeholder={t('form.placeholders.role')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('role')}
            />
          </div>
        </div>

        <div className="mb-4">
          <Label
            htmlFor="message"
            className="text-fg-soft mb-1.5 block text-xs font-medium"
          >
            {t('form.labels.message')}
          </Label>
          <Textarea
            id="message"
            placeholder={t('form.placeholders.message')}
            className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20 min-h-[120px]"
            {...register('message')}
          />
          {errors.message && (
            <p className="text-ui-danger mt-1 text-xs">
              {errors.message.message}
            </p>
          )}
        </div>

        <div className="text-fg-muted mb-4 text-xs">{t('form.footnote')}</div>

        {formStatus.message && (
          <div
            className={cn(
              'mb-3 min-h-[1.2em] text-sm',
              formStatus.type === 'error' && 'text-ui-danger',
              formStatus.type === 'success' && 'text-ui-success'
            )}
            role="alert"
            aria-live="polite"
          >
            {formStatus.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-ui-active-soft hover:bg-ui-active w-full rounded-lg px-6 py-3 text-sm font-medium text-white transition"
        >
          {isSubmitting ? t('submit.sending') : t('submit.default')}
        </Button>
      </form>
    </div>
  );
}
