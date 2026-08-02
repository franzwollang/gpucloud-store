'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

import { CatalogAttribution } from '@/components/catalog/CatalogAttribution';
import { Button } from '@/components/ui/button';
import { useAppTranslations } from '@/i18n';
import { needsConfiguration } from '@/lib/plan/missingPlanFields';
import { cn } from '@/lib/style';
import type { PlanItem } from '@/stores/plan';

export type PlanItemCardProps = {
  item: PlanItem;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Opens GpuModal to (re)configure — used for incomplete Configure and complete Edit. */
  onEdit: () => void;
};

export function PlanItemCard({
  item,
  onRemove,
  onIncrement,
  onDecrement,
  onEdit
}: PlanItemCardProps) {
  const t = useAppTranslations('UI.plan');
  const isIncomplete = needsConfiguration(item);
  const editDisabled = !item.gpuModel;
  const canDecrement = item.quantity > 1;
  const providerName = item.provider?.name?.trim() || null;
  const region = item.region?.trim() || null;

  return (
    <div
      className={cn(
        'border-border/60 bg-bg-page/50 flex flex-col gap-2 rounded-lg border p-3',
        isIncomplete && 'border-ui-warning/50 bg-ui-warning/5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-fg-main text-sm font-medium">{item.title}</h4>
          <p className="text-fg-soft mt-0.5 text-xs">{item.specs}</p>
          {providerName || region ? (
            <p className="text-fg-muted mt-1 text-[11px] leading-snug">
              {providerName && region
                ? t('providerRegion')('{provider} · {region}')({
                    provider: providerName,
                    region
                  })
                : providerName
                  ? t('providerOnly')('{provider}')({ provider: providerName })
                  : t('regionOnly')('{region}')({ region: region! })}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-fg-muted hover:text-fg-main shrink-0 rounded p-1 transition"
          aria-label={t('removeItem')('Remove item')()}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs">
        {isIncomplete ? (
          <span className="text-ui-warning font-medium">
            {t('missingDetails')('Details Missing')()}
          </span>
        ) : (
          <span />
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onEdit}
          disabled={editDisabled}
        >
          {isIncomplete
            ? t('configure')('Configure')()
            : t('edit')('Edit')()}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {canDecrement ? (
            <button
              type="button"
              onClick={onDecrement}
              className="border-border/60 text-fg-soft hover:text-fg-main hover:border-border inline-flex h-6 w-6 items-center justify-center rounded border transition"
              aria-label={t('decrementQuantity')('Decrease quantity')()}
            >
              <Minus className="h-3 w-3" />
            </button>
          ) : (
            <span className="inline-flex h-6 w-6" aria-hidden="true" />
          )}
          <span className="text-fg-main min-w-6 text-center font-medium tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            className="border-border/60 text-fg-soft hover:text-fg-main hover:border-border inline-flex h-6 w-6 items-center justify-center rounded border transition"
            aria-label={t('incrementQuantity')('Increase quantity')()}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="text-right">
          <div className="text-ui-active-soft font-semibold">{item.price}</div>
          {item.priceSourceId ? (
            <div className="mt-0.5 flex justify-end">
              <CatalogAttribution sourceId={item.priceSourceId} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
