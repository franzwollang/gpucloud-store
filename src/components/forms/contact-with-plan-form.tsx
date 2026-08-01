'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { BaseSearch, type GpuOption } from '@/components/search/BaseSearch';
import { GpuModal } from '@/components/search/GpuModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  contactPageModel,
  createContactFormSchema,
  type ContactFormData
} from '@/core/contact';
import { needsConfiguration } from '@/lib/plan/missingPlanFields';
import { cn } from '@/lib/style';
import { toUserMessage } from 'dullahan-web/client';
import type { PlanItem } from '@/stores/plan';
import { usePlanStore } from '@/stores/plan';
import type { Provider } from '@/types/gpu';

import { gpuCatalog } from '../../../public/data';

const buildGpuOption = (model: string): GpuOption | null => {
  const gpu = gpuCatalog.gpus.find(entry => entry.model === model);
  if (!gpu) return null;

  const availableSizes = new Set<number>();
  const availableRegions = new Set<string>();

  gpu.offerings.forEach(offering => {
    availableSizes.add(offering.gpuCount);
    offering.regions.forEach(region => {
      availableRegions.add(region.locationLabel);
    });
  });

  return {
    type: gpu.model,
    description: gpu.description,
    shortDetails: gpu.shortDetails,
    availableSizes: Array.from(availableSizes).sort((a, b) => a - b),
    availableRegions: Array.from(availableRegions).sort()
  };
};

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
  const [searchSelectedOption, setSearchSelectedOption] =
    useState<GpuOption | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [dialogOrigin, setDialogOrigin] = useState<
    'search' | 'configure' | null
  >(null);
  const [configuringItemId, setConfiguringItemId] = useState<string | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const t = useTranslations('TEST.contactForm');
  const contactT = useTranslations('TEST.contact');
  const searchT = useTranslations('TEST.haloSearch');
  const validation = useTranslations('TEST.contactForm.validation');
  const {
    execute: submitContact,
    pending: submitPending,
    message: submitErrorMessage
  } = contactPageModel.useTransition('submit');
  const items = usePlanStore(state => state.items);
  const removeItem = usePlanStore(state => state.removeItem);
  const addItem = usePlanStore(state => state.addItem);
  const decrementItem = usePlanStore(state => state.decrementItem);
  const hasIncomplete = useMemo(
    () => items.some(item => needsConfiguration(item)),
    [items]
  );
  const itemsSignature = useMemo(
    () =>
      items
        .map(
          item =>
            `${item.id}:${item.quantity}:${item.gpuModel ?? ''}:${item.gpuCount ?? ''}:${item.region ?? ''}:${item.provider?.name ?? ''}`
        )
        .join('|'),
    [items]
  );
  const tPlan = useTranslations('UI.plan');

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

  const handleConfigureItem = (item: PlanItem) => {
    if (!item.gpuModel) return;
    const option = buildGpuOption(item.gpuModel);
    if (!option) return;
    setSearchSelectedOption(null);
    setSelectedRegion(null);
    setSelectedProvider(null);
    setSelectedSize(null);
    setCurrentDialogOption(option);
    setDialogIndex(0);
    setDialogOrigin('configure');
    if (item.gpuCount) {
      setSelectedSize(item.gpuCount);
    }
    setConfiguringItemId(item.id);
  };

  const handleDialogClose = () => {
    setDialogIndex(null);
    setCurrentDialogOption(null);
    setSelectedRegion(null);
    setSelectedProvider(null);
    setSelectedSize(null);
    setConfiguringItemId(null);
    if (dialogOrigin === 'search') {
      setSearchSelectedOption(null);
    }
    setDialogOrigin(null);
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

  const planItemCountRef = useRef(items.length);
  planItemCountRef.current = items.length;
  const formSchema = useMemo(
    () =>
      createContactFormSchema(() => planItemCountRef.current, {
        nameRequired: validation('nameRequired'),
        emailRequired: validation('emailRequired'),
        emailInvalid: validation('emailInvalid'),
        messageOrConfigs: validation('messageOrConfigs')
      }),
    [validation]
  );
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    control,
    formState: { errors, isSubmitting, submitCount }
  } = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange'
  });
  const showErrors = submitCount > 0 || formStatus.type === 'error';
  const formValues = useWatch({
    control,
    name: ['name', 'company', 'email', 'role', 'message']
  });
  const prevFormValuesRef = useRef<typeof formValues | null>(null);
  const prevItemsSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    void trigger();
  }, [items, trigger]);

  useEffect(() => {
    const prevValues = prevFormValuesRef.current;
    const prevSignature = prevItemsSignatureRef.current;
    const valuesChanged =
      !!prevValues &&
      formValues.some((value, index) => value !== prevValues[index]);
    const itemsChanged =
      !!prevSignature && prevSignature !== itemsSignature;

    if ((valuesChanged || itemsChanged) && formStatus.type === 'error') {
      setFormStatus({ type: 'idle', message: '' });
    }

    prevFormValuesRef.current = formValues;
    prevItemsSignatureRef.current = itemsSignature;
  }, [formValues, itemsSignature, formStatus.type]);

  const onSubmit = async (data: ContactFormData) => {
    setFormStatus({ type: 'loading', message: '' });

    const payload = {
      name: data.name.trim(),
      company: data.company?.trim() ?? '',
      email: data.email.trim(),
      role: data.role?.trim() ?? '',
      message: data.message?.trim() ?? '',
      planItems: items
    };

    const result = await submitContact(payload);

    if (result.ok) {
      setFormStatus({
        type: 'success',
        message: t('status.success')
      });
      reset();
      return;
    }

    setFormStatus({
      type: 'error',
      message: submitErrorMessage ?? toUserMessage(result.error) ?? t('status.error')
    });
  };

  return (
    <div className="grid gap-5 lg:h-full lg:min-h-0 lg:grid-cols-2 lg:items-stretch lg:overflow-hidden">
      {/* Left — title + form stays visible while plan list scrolls */}
      <div className="flex min-h-0 flex-col lg:sticky lg:top-0 lg:max-h-full lg:self-start lg:overflow-y-auto">
        <div className="mb-4 shrink-0">
          <div className="text-fg-soft mb-1 text-[11px] tracking-[0.18em] uppercase">
            {contactT('eyebrow')}
          </div>
          <h2 className="text-fg-main mb-1 text-lg font-semibold">
            {contactT('title')}
          </h2>
          <p className="text-fg-soft text-xs leading-relaxed">
            {contactT('subtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="contactFormSurface border-border/40 bg-bg-surface/50 shrink-0 rounded-2xl border p-4 shadow-lg"
        >
          <div className="mb-4 space-y-1.5">
            <h3 className="text-fg-main text-lg font-semibold">
              {t('form.title')}
            </h3>
          </div>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="name"
              className="text-fg-soft mb-1 block text-xs font-medium"
            >
              {t('form.labels.name')}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t('form.placeholders.name')}
              className={cn(
                'border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20',
                showErrors &&
                  errors.name &&
                  'border-ui-danger/60 focus-visible:border-ui-danger focus-visible:ring-ui-danger/20'
              )}
              {...register('name')}
            />
            {showErrors && errors.name && (
              <p className="text-ui-danger mt-1 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="company"
              className="text-fg-soft mb-1 block text-xs font-medium"
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

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="email"
              className="text-fg-soft mb-1 block text-xs font-medium"
            >
              {t('form.labels.email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('form.placeholders.email')}
              className={cn(
                'border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20',
                showErrors &&
                  errors.email &&
                  'border-ui-danger/60 focus-visible:border-ui-danger focus-visible:ring-ui-danger/20'
              )}
              {...register('email')}
            />
            {showErrors && errors.email && (
              <p className="text-ui-danger mt-1 text-xs">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="role"
              className="text-fg-soft mb-1 block text-xs font-medium"
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

        <div className="mb-3">
          <Label
            htmlFor="message"
            className="text-fg-soft mb-1 block text-xs font-medium"
          >
            {t('form.labels.message')}
          </Label>
          <Textarea
            id="message"
            placeholder={t('form.placeholders.message')}
            className={cn(
              'border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20 min-h-[112px] resize-none',
              showErrors &&
                (errors.message || formStatus.type === 'error') &&
                'border-ui-danger/60 focus-visible:border-ui-danger focus-visible:ring-ui-danger/20'
            )}
            {...register('message')}
          />
          {showErrors && errors.message && (
            <p className="text-ui-danger mt-1 text-xs">
              {errors.message.message}
            </p>
          )}
          {formStatus.type === 'error' && (
            <p className="text-ui-danger mt-1 text-xs">{formStatus.message}</p>
          )}
        </div>

        <div className="text-fg-muted mb-3 text-xs">{t('form.footnote')}</div>

        {formStatus.type === 'success' && (
          <div
            className="text-ui-success mb-3 min-h-[1.2em] text-sm"
            role="status"
            aria-live="polite"
          >
            {formStatus.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || submitPending}
          className="bg-ui-active-soft hover:bg-ui-active w-full rounded-lg px-6 py-2.5 text-sm font-medium text-white transition"
        >
          {isSubmitting || submitPending ? t('submit.sending') : t('submit.default')}
        </Button>
        </form>
      </div>

      {/* Right — search + plan list fills remaining height and scrolls */}
      <div className="text-fg-soft flex min-h-0 flex-col lg:h-full lg:overflow-hidden lg:pr-2">
        <div className="mb-4 shrink-0">
          <h3 className="text-fg-main mb-2 text-sm font-medium">
            {t('search.title')}
          </h3>
          <BaseSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSelectOption={(index, option) => {
              setCurrentDialogOption(option);
              setDialogIndex(0);
              setDialogOrigin('search');
            }}
            modalEnabled={true}
            selectedOption={searchSelectedOption}
            onSelectedOptionChange={setSearchSelectedOption}
            renderInput={props => (
              <div className="relative">
                <div className="border-border bg-bg-page focus-within:border-ui-active-soft focus-within:ring-ui-active-soft/30 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-border)_70%,transparent),0_12px_24px_-20px_color-mix(in_srgb,var(--color-bg-page)_70%,transparent)] relative flex h-12 items-center gap-2 rounded-lg border px-3 transition focus-within:ring-2">
                  <input
                    ref={props.ref}
                    type="text"
                    name="search"
                    placeholder={props.placeholder}
                    className="placeholder:text-fg-muted/70 text-fg-main h-full w-full bg-transparent text-sm outline-none"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={props.value}
                    onChange={props.onChange}
                    onKeyDown={props.onKeyDown}
                    onClick={props.onClick}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                  />
                </div>
              </div>
            )}
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
                  const updates = {
                    title: config.type,
                    specs: `${config.size} GPU cluster`,
                    price: 'Contact for pricing',
                    details: `Provider: ${config.provider.name} (${config.provider.location})`,
                    gpuModel: config.type,
                    gpuCount: config.size,
                    region: selectedRegion ?? undefined,
                    provider: {
                      id: config.provider.id,
                      name: config.provider.name,
                      location: config.provider.location
                    }
                  };
                  addItem(updates);
                  if (configuringItemId) {
                    decrementItem(configuringItemId);
                  }
                  handleDialogClose();
                }}
                t={searchT as unknown as (key: string) => string}
              />
            )}
        </div>

        {/* Plan items — fill remaining column height; scroll inside the list */}
        <div className="border-border/40 bg-bg-surface/50 flex min-h-0 flex-col rounded-lg border p-3 lg:flex-1">
          <h4 className="text-fg-main mb-1 shrink-0 text-sm font-medium">
            {t('selected.title', { count: items.length })}
          </h4>

          <div className="border-border/40 bg-bg-page/30 scrollbar-visible min-h-[12rem] max-h-[min(42vh,24rem)] overflow-y-auto rounded-md border p-2 pr-3 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-ui-active-soft)_8%,transparent),inset_0_10px_14px_-10px_color-mix(in_srgb,var(--color-bg-page)_80%,transparent)] lg:max-h-none lg:min-h-0 lg:flex-1">
            {items.length > 0 ? (
              <div className="space-y-1.5">
                {items.map((item: PlanItem) => {
                  const isIncomplete = needsConfiguration(item);
                  return (
                  <div
                    key={item.id}
                    className={cn(
                      'border-border/30 bg-bg-page/50 flex items-stretch justify-between gap-2 rounded border p-2',
                      isIncomplete && 'border-ui-warning/50'
                    )}
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
                      {isIncomplete && (
                        <div className="text-ui-warning mt-1 text-[10px] font-medium">
                          {tPlan('missingDetails')}
                        </div>
                      )}
                    </div>
                    <div className="flex h-full flex-col items-end justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-fg-muted hover:text-fg-main rounded p-0.5 transition"
                        aria-label={t('selected.remove')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {isIncomplete && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-border/60 text-fg-main hover:bg-ui-active-soft/10 h-6 px-2 text-[10px]"
                          onClick={() => handleConfigureItem(item)}
                        >
                          {tPlan('configure')}
                        </Button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-fg-muted py-4 text-center text-xs">
                {t('selected.empty')}
              </p>
            )}
          </div>

          {hasIncomplete && (
            <p className="text-fg-muted mt-2 shrink-0 text-xs">
              {t('selected.confirmDuringCall')}
            </p>
          )}
          <p className="text-fg-muted mt-1 shrink-0 text-xs">{t('selected.hint')}</p>
        </div>

        <div className="mt-4 shrink-0">
          <p className="text-fg-main text-sm font-medium leading-relaxed">
            {t('help.description')}
          </p>
          <p className="text-fg-soft mt-2 text-xs">
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
      <style jsx>{`
        .contactFormSurface {
          position: relative;
          overflow: hidden;
        }

        .contactFormSurface::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
          background-size: 220px 220px;
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  );
}
