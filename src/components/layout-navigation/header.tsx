'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cart';

import DarkModeToggle from './darkModeToggle';
import LanguagePicker from './languagePicker';

export const Header = () => {
  const router = useRouter();
  const currentLocale = useLocale();
  const locale = useMemo(
    () => (typeof currentLocale === 'string' ? currentLocale : 'en-US'),
    [currentLocale]
  );
  const t = useTranslations('UI.cart');
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const getTotalItems = useCartStore(state => state.getTotalItems);

  const itemCount = getTotalItems();

  const handleContactSales = () => {
    setIsOpen(false);
    // Navigate to test page with contact anchor (locale-aware)
    router.push(`/${locale}/test#contact`);
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-6 py-4">
          <LanguagePicker
            placeholderText=""
            noResultsText="No language found"
          />
          <DarkModeToggle />
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            variant="header"
            className="group relative"
            aria-label={t('open')}
          >
            <ShoppingCart className="group-hover:text-ui-active-soft h-5 w-5" />
            {itemCount > 0 && (
              <span className="bg-ui-active-soft absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="bg-bg-surface border-border/70 text-fg-main w-[400px] max-w-[90vw] sm:w-[450px]"
        >
          <SheetHeader>
            <SheetTitle className="text-fg-main">{t('title')}</SheetTitle>
            <SheetDescription className="text-fg-soft">
              {itemCount === 0
                ? t('empty')
                : t('summary', { count: itemCount })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-1 flex-col gap-4">
            {itemCount === 0 ? (
              <div className="text-fg-muted flex h-[200px] flex-col items-center justify-center text-center text-sm">
                <ShoppingCart className="mb-3 h-12 w-12 opacity-40" />
                <p>{t('emptyHint')}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="border-border/40 bg-bg-page/50 flex flex-col gap-2 rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-fg-main text-sm font-medium">
                            {item.title}
                          </h4>
                          <p className="text-fg-soft mt-0.5 text-xs">
                            {item.specs}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-fg-muted hover:text-fg-main rounded p-1 transition"
                          aria-label={t('removeItem')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-fg-muted">
                          {t('quantity', { count: item.quantity })}
                        </span>
                        <span className="text-ui-active-soft font-semibold">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-border/40 mt-auto border-t pt-4">
                  <button
                    type="button"
                    onClick={handleContactSales}
                    className="bg-ui-active-soft hover:bg-ui-active flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
                  >
                    {t('contactButton')}
                  </button>
                  <p className="text-fg-muted mt-2 text-center text-xs">
                    {t('contactHint')}
                  </p>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
