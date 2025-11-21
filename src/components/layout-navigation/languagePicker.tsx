"use client";

import { CheckIcon, ChevronDownIcon, LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { localesByCode, type SupportedLocale, supportedLocales } from "@/i18n";
import { cn } from "@/lib/style";
import { usePathname, useRouter } from "@/navigation";

export default function LanguagePicker({
  className,
  placeholderText,
  noResultsText,
}: {
  className?: string;
  placeholderText: string;
  noResultsText: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocaleCode = useLocale() as SupportedLocale;

  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(
    localesByCode[currentLocaleCode],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="group">
        <PopoverTrigger asChild>
          <Button
            aria-label="Change language"
            tabIndex={0}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[160px] justify-center", className)}
          >
            <span className="flex items-center justify-around overflow-hidden">
              <span
                className={cn(
                  "mr-2 transition-all duration-500",
                  open && "rotate-6 text-green-700",
                )}
              >
                <LanguagesIcon className="h-4 w-4" />
              </span>
              <span>{currentLocale.label}</span>
            </span>
            <span className="ml-2 h-4 shrink-0">
              <ChevronDownIcon className="h-4 w-4" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command className="relative max-h-[300px] overflow-hidden">
            {supportedLocales.length > 8 && (
              <>
                <CommandInput placeholder={placeholderText} />
                <CommandEmpty>{noResultsText}</CommandEmpty>
              </>
            )}
            <CommandGroup className="h-max overflow-auto">
              {Object.values(supportedLocales).map((supportedLocale) => {
                const locale = localesByCode[supportedLocale];

                return (
                  <CommandItem
                    className="flex justify-between"
                    key={supportedLocale}
                    value={locale.label}
                    onSelect={() => {
                      setCurrentLocale(locale);
                      setOpen(false);
                      router.push(pathname, {
                        locale: supportedLocale,
                      });
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        currentLocale === locale ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="grow">
                      <span className="flex justify-center">
                        <span>{locale.label}</span>
                        <span className="ml-2">{locale.icon}</span>
                      </span>
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
