'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/style';

import { catalogSource, catalogSources } from '@public/data';

type CatalogAttributionProps = {
  className?: string;
  /** Include snapshot date when available. */
  showDate?: boolean;
};

/**
 * Muted credit for every active catalog price source.
 * Place only at the bottom of pricing rows/cards — nowhere else.
 */
export function CatalogAttribution({
  className,
  showDate = false
}: CatalogAttributionProps) {
  const t = useTranslations('TEST.catalog');
  const sources = catalogSources;

  if (sources.length === 0) return null;

  return (
    <p
      className={cn(
        'text-fg-muted/70 text-[0.65rem] leading-snug tracking-wide',
        className
      )}
    >
      <span className="mr-1">{t('via')}</span>
      {sources.map((source, index) => (
        <span key={source.id}>
          {index > 0 ? (
            <span className="text-fg-muted/50">{t('sourceSeparator')}</span>
          ) : null}
          <a
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg-muted underline decoration-dotted underline-offset-2 transition-colors"
          >
            {source.label}
          </a>
        </span>
      ))}
      {showDate && catalogSource.date ? (
        <span className="ml-1">
          {t('snapshotDate', { date: catalogSource.date })}
        </span>
      ) : null}
    </p>
  );
}
