import { MoonIcon, SunIcon } from "lucide-react";
import { useAppTranslations } from "@/i18n";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui";

export default function DarkModeToggle() {
  const { theme, setTheme } = useUIStore(({ theme, setTheme }) => ({
    theme,
    setTheme,
  }));
  const t = useAppTranslations('UI.darkModeToggle');

  return (
    <Button
      type="button"
      aria-label={t('ariaLabel')('Toggle dark mode')()}
      tabIndex={0}
      variant="header"
      className="group"
      onClick={() => {
        if (theme === "dark") {
          localStorage.theme = "light";
          setTheme("light");
        } else {
          localStorage.theme = "dark";
          setTheme("dark");
        }
      }}
    >
      {theme === "dark" ? (
        <MoonIcon className="group-hover:text-ui-active-soft h-5 w-5" />
      ) : (
        <SunIcon className="group-hover:text-ui-active-soft h-5 w-5" />
      )}
    </Button>
  );
}
