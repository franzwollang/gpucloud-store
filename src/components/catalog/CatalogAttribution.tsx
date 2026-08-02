'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/style';

import { catalogSource, catalogSources } from '@public/data';

type CatalogAttributionProps = {
  /** Credit id from `PriceEstimate.sourceId` / `catalogSources`. */
  sourceId: string;
  className?: string;
  /** Include snapshot date when available (legacy single-source snapshots). */
  showDate?: boolean;
};

/**
 * Very small muted credit for one price's data origin.
 * Place directly underneath the price figure — nowhere else.
 */
export function CatalogAttribution({
  sourceId,
  className,
  showDate = false
}: CatalogAttributionProps) {
  const t = useTranslations('TEST.catalog');
  const source = catalogSources.find(entry => entry.id === sourceId);

  if (!source) return null;

  return (
    <p
      className={cn(
        'text-fg-muted/55 text-[9px] leading-tight tracking-wide',
        className
      )}
    >
      <span className="mr-0.5">{t('via')}</span>
      <a
        href={source.href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-fg-muted underline decoration-dotted underline-offset-2 transition-colors"
        onClick={event => event.stopPropagation()}
      >
        {source.label}
      </a>
      {showDate && catalogSource.date && source.id === catalogSource.id ? (
        <span className="ml-0.5">
          {t('snapshotDate', { date: catalogSource.date })}
        </span>
      ) : null}
    </p>
  );
}
