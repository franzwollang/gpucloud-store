import {
  ArrowDownRight,
  LanguagesIcon,
  MoonIcon,
  Settings,
  SunIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { localesByCode, type SupportedLocale, supportedLocales } from "@/i18n";
import { usePathname, useRouter } from "@/navigation";
import { useUIStore } from "@/stores/ui";

import { DialogContent } from "../ui/dialog";
import { type NavLinks } from "./useLinks";

type CommandPaletteProps = {
  links: NavLinks;
  setShow: (show: boolean) => void;
};

export function CommandPalette({ links, setShow }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<Array<string>>([]);
  const page = pages[pages.length - 1];

  const router = useRouter();
  const pathname = usePathname();
  const currentLocaleCode = useLocale() as SupportedLocale;

  const [_, setCurrentLocale] = useState(localesByCode[currentLocaleCode]);

  const { setVisibilities, theme, setTheme } = useUIStore((state) => ({
    setVisibilities: state.setVisibilities,
    theme: state.theme,
    setTheme: state.setTheme,
  }));

  useEffect(() => {
    setSearch("");
  }, [pages]);

  return (
    <DialogContent className="h-[50vh] w-[50vw] p-0" showCloseButton={false}>
      <Command
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Escape" || e.key === "ArrowLeft") {
            // allow escape key to close the modal if there are no pages
            if (pages.length > 0) {
              e.preventDefault();
            }

            setPages((pages) => pages.slice(0, -1));
          }
        }}
      >
        <CommandInput value={search} onValueChange={setSearch} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {!page && (
            <>
              <CommandGroup heading="Shortcut Groups">
                <CommandItem
                  onSelect={() => setPages((pages) => [...pages, "settings"])}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPages((pages) => [...pages, "navigation"])}
                >
                  <ArrowDownRight className="mr-2 h-4 w-4" />
                  <span>Navigation</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {page === "settings" && (
            <CommandGroup heading="Settings">
              <CommandItem
                onSelect={() => setPages((pages) => [...pages, "theme"])}
              >
                {theme === "dark" ? (
                  <MoonIcon className="mr-2 h-4 w-4" />
                ) : (
                  <SunIcon className="mr-2 h-4 w-4" />
                )}
                <span>Theme</span>
              </CommandItem>
              <CommandItem
                onSelect={() => setPages((pages) => [...pages, "language"])}
              >
                <LanguagesIcon className="mr-2 h-4 w-4" />
                <span>Language</span>
              </CommandItem>
            </CommandGroup>
          )}

          {page === "theme" && (
            <CommandGroup heading="Theme">
              <CommandItem
                onSelect={() => {
                  localStorage.theme = "dark";
                  setTheme("dark");
                  setShow(false);
                }}
              >
                <MoonIcon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  localStorage.theme = "light";
                  setTheme("light");
                  setShow(false);
                }}
              >
                <SunIcon className="mr-2 h-4 w-4" />
                <span>Light</span>
              </CommandItem>
            </CommandGroup>
          )}

          {page === "language" && (
            <CommandGroup heading="Language">
              {Object.values(supportedLocales).map((supportedLocale) => {
                const locale = localesByCode[supportedLocale];

                return (
                  <CommandItem
                    key={supportedLocale}
                    onSelect={() => {
                      setCurrentLocale(locale);
                      router.push(pathname, {
                        locale: supportedLocale,
                      });
                      setShow(false);
                    }}
                  >
                    <span className="mr-2 h-4 w-4">{locale.icon}</span>
                    <span>{locale.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {page === "navigation" && (
            <CommandGroup heading="Navigation">
              {links.locations.map((link) => {
                return (
                  <CommandItem
                    key={link.intlAnchor}
                    onSelect={() => {
                      setVisibilities((visibilities) => {
                        return {
                          anchors: [link.intlAnchor, ...visibilities.anchors],
                        };
                      });
                      router.push(
                        link.href +
                          `${link.type === "withAnchor" ? "#" + link.intlAnchor : ""}`,
                      );
                      setShow(false);
                    }}
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    <span>{link.text}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </DialogContent>
  );
}
