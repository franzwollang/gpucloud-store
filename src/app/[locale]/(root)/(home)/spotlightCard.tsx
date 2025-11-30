import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '@/components/ui/card';
import { SpotlightArea } from '@/components/ui/spotlight-area';
import { cn } from '@/lib/style';

export function SpotlightCard() {
  const t = useTranslations('TEST');

  return (
    <div className="my-52">
      <Card
        className="bg-card text-card-foreground w-[320px] overflow-clip border-[color-mix(in_srgb,var(--color-card-border)_100%,transparent)]"
        style={{
          boxShadow:
            '0 25px 80px color-mix(in srgb, var(--color-lamp-glow) 60%, transparent)'
        }}
      >
        <SpotlightArea
          spotlightMode="fixed"
          spotlightPosition={{ x: '80%', y: '40%' }}
          radius={250}
          revealOnHover={false}
        >
          <CardContent className="flex flex-col gap-4 p-6">
            <CardTitle
              className={cn(
                'text-fg-main pb-1 text-xl font-semibold tracking-tight'
              )}
            >
              {t('spotlight.title')}
            </CardTitle>
            <div className="h-px w-full bg-[color-mix(in_srgb,var(--color-card-border)_65%,transparent)]" />
            <CardDescription
              className={cn('text-fg-soft text-sm leading-relaxed')}
            >
              {t('spotlight.description')}
            </CardDescription>
          </CardContent>
        </SpotlightArea>
      </Card>
    </div>
  );
}
