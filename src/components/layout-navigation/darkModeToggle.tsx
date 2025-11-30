import { MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui";

export default function DarkModeToggle() {
  const theme = useUIStore(state => state.theme);
  const setTheme = useUIStore(state => state.setTheme);
  const t = useTranslations('UI.darkModeToggle');

  return (
    <Button
      type="button"
      aria-label={t('ariaLabel')}
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
