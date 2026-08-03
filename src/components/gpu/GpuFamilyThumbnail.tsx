import Image from 'next/image';

import { gpuFamilyImagePath } from '@/lib/catalog/gpuImage';
import { cn } from '@/lib/style';
import type { GpuFamilyId } from '@/types/gpu';

type GpuFamilyThumbnailProps = {
  familyId: GpuFamilyId | string | null | undefined;
  alt: string;
  /** `xs` = deck chips, `sm` = search/availability, `md` = configure modal header. */
  size?: 'xs' | 'sm' | 'md';
  className?: string;
};

const SIZE_CLASS = {
  xs: 'h-5 w-7 rounded',
  sm: 'h-10 w-14',
  md: 'h-16 w-[5.75rem]'
} as const;

/**
 * Shared blueprint thumbnail for availability cards, search options,
 * and the configure modal header.
 */
export function GpuFamilyThumbnail({
  familyId,
  alt,
  size = 'sm',
  className
}: GpuFamilyThumbnailProps) {
  if (!familyId) return null;

  return (
    <div
      className={cn(
        'border-border/60 bg-bg-page/80 shrink-0 overflow-hidden rounded-md border',
        SIZE_CLASS[size],
        className
      )}
    >
      <Image
        src={gpuFamilyImagePath(familyId)}
        alt={alt}
        width={120}
        height={72}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

type GpuFamilyThumbnailDeckProps = {
  familyId: GpuFamilyId | string | null | undefined;
  alt: string;
  count: number;
  className?: string;
};

/**
 * Overlapping “expanded deck” of tiny blueprints — one chip per GPU in a
 * template line (e.g. 2× H200 → two stacked thumbs).
 */
export function GpuFamilyThumbnailDeck({
  familyId,
  alt,
  count,
  className
}: GpuFamilyThumbnailDeckProps) {
  if (!familyId || count < 1) return null;

  const n = Math.min(Math.floor(count), 12);
  const step = 7;
  const cardW = 28; // matches `xs` w-7
  const width = cardW + (n - 1) * step;

  return (
    <div
      className={cn('relative h-5 shrink-0', className)}
      style={{ width }}
      aria-label={`${n}× ${alt}`}
    >
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: i * step,
            zIndex: i + 1,
            transform: `translateY(${i * 0.4}px) rotate(${(i - (n - 1) / 2) * 1.6}deg)`
          }}
        >
          <GpuFamilyThumbnail
            familyId={familyId}
            alt=""
            size="xs"
            className="border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          />
        </div>
      ))}
    </div>
  );
}
