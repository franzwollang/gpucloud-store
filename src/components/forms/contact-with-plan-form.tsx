'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useAppTranslations } from '@/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { BaseSearch, type GpuOption } from '@/components/search/BaseSearch';
import { GpuModal } from '@/components/search/GpuModal';
import { CatalogAttribution } from '@/components/catalog/CatalogAttribution';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { buildProviderCombinations } from '@/lib/catalog/providerCombinations';
import { sortRegionLabels } from '@/lib/catalog/sort';
import { needsConfiguration } from '@/lib/plan/missingPlanFields';
import { cn } from '@/lib/style';
import { contactPageModel } from '@/core/contact/contactPageModel';
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
    availableRegions: sortRegionLabels(availableRegions)
  };
};

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

  const t = useAppTranslations('TEST.contactForm');
  const contactT = useAppTranslations('TEST.contact');
  const searchT = useAppTranslations('TEST.haloSearch');
  const validation = useAppTranslations('TEST.contactForm.validation');
  const {
    execute: submitContact,
    pending: submitPending,
    message: submitErrorMessage
  } = contactPageModel.useTransition('submit');
  const { items, removeItem, addItem, updateItem } = usePlanStore(
    ({ items, removeItem, addItem, updateItem }) => ({
      items,
      removeItem,
      addItem,
      updateItem
    })
  );
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
  const tPlan = useAppTranslations('UI.plan');

  // Computed values for GpuModal
  const currentGpuType = currentDialogOption?.type ?? '';
  const availableRegions = currentDialogOption?.availableRegions ?? [];

  const availableCombinations = useMemo(() => {
    if (!currentDialogOption || !selectedRegion) return [];

    const gpuFamily = gpuCatalog.gpus.find(
      gpu => gpu.model === currentDialogOption.type
    );
    if (!gpuFamily) return [];

    return buildProviderCombinations({
      gpuFamily,
      catalogProviders: gpuCatalog.providers,
      availableSizes: currentDialogOption.availableSizes,
      selectedRegion
    });
  }, [currentDialogOption, selectedRegion]);

  const regionRiskMetrics =
    selectedRegion && selectedProvider
      ? selectedProvider.regions.find(r => r.name === selectedRegion)
          ?.riskMetrics
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

  const validationMessages = {
    nameRequired: validation('nameRequired')('Name is required')(),
    emailRequired: validation('emailRequired')('Email is required')(),
    emailInvalid: validation('emailInvalid')('Invalid email address')(),
    messageOrConfigs: validation('messageOrConfigs')('Please either select GPU configurations or provide details here.')()
  };
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    control,
    formState: { errors, isSubmitting, submitCount }
  } = useForm<ContactFormData>({
    resolver: zodResolver(createContactFormSchema(items, validationMessages)),
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
        message: t('status.success')('Message sent successfully! We\'ll be in touch soon.')()
      });
      reset();
      return;
    }

    setFormStatus({
      type: 'error',
      message: submitErrorMessage ?? toUserMessage(result.error) ?? t('status.error')('Failed to send message. Please try again or email us directly.')()
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-2 lg:items-stretch lg:overflow-hidden">
      {/* Left side - Title + Form (page scrolls; no nested scrollbar) */}
      <div className="flex flex-col lg:min-h-0 lg:overflow-hidden">
        <div className="mb-4 shrink-0">
          <div className="text-fg-soft mb-1 text-[11px] tracking-[0.18em] uppercase">
            {contactT('eyebrow')('Get in Touch')()}
          </div>
          <h2 className="text-fg-main mb-1 text-lg font-semibold">
            {contactT('title')('Request a Quote')()}
          </h2>
          <p className="text-fg-soft text-xs leading-relaxed">
            {contactT('subtitle')('Share your GPU configuration requirements and we\'ll get back to you with a custom quote.')()}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="contactFormSurface border-border/60 bg-bg-surface/80 shadow-lamp-soft shrink-0 rounded-2xl border p-4"
        >
          <div className="mb-4 space-y-1.5">
            <h3 className="text-fg-main text-lg font-semibold">
              {t('form.title')('Contact Form')()}
            </h3>
          </div>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="name"
              className="text-fg-soft mb-1 block text-xs font-medium"
            >
              {t('form.labels.name')('Name *')()}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t('form.placeholders.name')('Ada Lovelace')()}
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
              {t('form.labels.company')('Company')()}
            </Label>
            <Input
              id="company"
              type="text"
              placeholder={t('form.placeholders.company')('Your company / project')()}
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
              {t('form.labels.email')('Work email *')()}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('form.placeholders.email')('you@company.com')()}
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
              {t('form.labels.role')('Role')()}
            </Label>
            <Input
              id="role"
              type="text"
              placeholder={t('form.placeholders.role')('CTO, Head of Eng, Founder…')()}
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
            {t('form.labels.message')('Requirements')()}
          </Label>
          <Textarea
            id="message"
            placeholder={t('form.placeholders.message')('Add extra details here—or skip the plan and describe everything here.')()}
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

        <div className="text-fg-muted mb-3 text-xs">{t('form.footnote')('* Required fields. Please add GPU configurations above OR provide details in the comments field (at least one is required). We typically respond within 24 hours.')()}</div>

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
          variant="cta"
          disabled={isSubmitting || submitPending}
          className="w-full px-6 py-2.5"
        >
          {isSubmitting || submitPending ? t('submit.sending')('Sending…')() : t('submit.default')('Send message')()}
        </Button>
        </form>
      </div>

      {/* Right side - Search + Plan items (list grows into available height) */}
      <div className="text-fg-soft flex min-h-0 flex-col lg:h-full lg:min-h-0 lg:overflow-hidden lg:pr-2">
        <div className="mb-4 shrink-0">
          <h3 className="text-fg-main mb-2 text-sm font-medium">
            {t('search.title')('Search GPU Configurations')()}
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
                <div className="border-border/60 bg-bg-page focus-within:border-ui-active-soft focus-within:ring-ui-active-soft/30 shadow-lamp-soft relative flex h-12 items-center gap-2 rounded-lg border px-3 transition focus-within:ring-2">
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
                  const regionData = config.provider.regions.find(
                    r => r.name === selectedRegion
                  );
                  const updates = {
                    specs: searchT('gpuCluster')('{count} GPU cluster')({ count: config.size }),
                    price: regionData?.price ?? searchT('pricingFallback')('Contact for pricing')(),
                    priceSourceId: regionData?.sourceId,
                    details: searchT('providerDetails')('Provider: {name} ({location})')({
                      name: config.provider.name,
                      location: config.provider.location
                    }),
                    gpuModel: config.type,
                    gpuCount: config.size,
                    region: selectedRegion ?? undefined,
                    provider: {
                      id: config.provider.id,
                      name: config.provider.name,
                      location: config.provider.location
                    }
                  };

                  if (configuringItemId) {
                    updateItem(configuringItemId, updates);
                  } else {
                    addItem({
                      title: config.type,
                      ...updates
                    });
                  }
                  handleDialogClose();
                }}
                t={searchT}
              />
            )}
        </div>

        {/* Plan items - grow into remaining column height */}
        <div className="border-border/60 bg-bg-surface/80 shadow-lamp-card flex min-h-0 flex-1 flex-col rounded-lg border p-3">
          <h4 className="text-fg-main mb-1 shrink-0 text-sm font-medium">
            {t('selected.title')('Selected Configurations ({count})')({ count: items.length })}
          </h4>

          <div className="surface-inset min-h-[12rem] flex-1 overflow-y-auto overscroll-contain p-2 pr-3">
            {items.length > 0 ? (
              <div className="space-y-1.5">
                {items.map((item: PlanItem) => {
                  const isIncomplete = needsConfiguration(item);
                  return (
                  <div
                    key={item.id}
                    className={cn(
                      'border-border/60 bg-bg-page/50 flex items-stretch justify-between gap-2 rounded border p-2',
                      isIncomplete && 'border-ui-warning/50'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-fg-main text-xs font-medium">
                        {item.title}
                      </div>
                      <div className="text-fg-muted mt-0.5 text-[10px]">
                        {t('selected.quantity')('Qty: {quantity} × {price}')({
                          quantity: item.quantity,
                          price: item.price
                        })}
                      </div>
                      {item.priceSourceId ? (
                        <div className="mt-0.5">
                          <CatalogAttribution sourceId={item.priceSourceId} />
                        </div>
                      ) : null}
                      {isIncomplete && (
                        <div className="text-ui-warning mt-1 text-[10px] font-medium">
                          {tPlan('missingDetails')('Details Missing')()}
                        </div>
                      )}
                    </div>
                    <div className="flex h-full flex-col items-end justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-fg-muted hover:text-fg-main rounded p-0.5 transition"
                        aria-label={t('selected.remove')('Remove item')()}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {isIncomplete && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          onClick={() => handleConfigureItem(item)}
                        >
                          {tPlan('configure')('Configure')()}
                        </Button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-fg-muted py-4 text-center text-xs">
                {t('selected.empty')('No configurations selected.')()}
              </p>
            )}
          </div>

          {hasIncomplete && (
            <p className="text-fg-muted mt-2 shrink-0 text-xs">
              {t('selected.confirmDuringCall')('We\'ll confirm provider/region availability during the call.')()}
            </p>
          )}
          <p className="text-fg-muted mt-1 shrink-0 text-xs">{t('selected.hint')('These configurations will be included in your inquiry.')()}</p>
        </div>
      </div>
      </div>

      <div className="border-border/40 shrink-0 border-t pt-3 pb-1">
        <p className="text-fg-main text-sm font-medium leading-relaxed">
          {t('help.description')('Stuck? We’ll help pick hardware, providers, and hybrid setups. Share blockers or wishlist items and we’ll factor them in.')()}
        </p>
        <p className="text-fg-soft mt-2 text-xs">
          {t('help.emailIntro')('Email us at')()}{' '}
          <a
            href={`mailto:${t('help.emailAddress')('shrey@gpucloud.store')()}`}
            className="text-ui-active-soft font-medium hover:underline"
          >
            {t('help.emailAddress')('shrey@gpucloud.store')()}
          </a>
        </p>
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
