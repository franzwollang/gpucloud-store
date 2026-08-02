import Image from 'next/image';

import { gpuFamilyImagePath } from '@/lib/catalog/gpuImage';
import { cn } from '@/lib/style';
import type { GpuFamilyId } from '@/types/gpu';

type GpuFamilyThumbnailProps = {
  familyId: GpuFamilyId | string | null | undefined;
  alt: string;
  /** `sm` = search/availability (56×40), `md` = modal header. */
  size?: 'sm' | 'md';
  className?: string;
};

const SIZE_CLASS = {
  sm: 'h-10 w-14',
  md: 'h-12 w-[4.25rem]'
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
