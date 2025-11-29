import { MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUIStore } from "@/stores/ui";

export default function DarkModeToggle() {
  const theme = useUIStore(state => state.theme);
  const setTheme = useUIStore(state => state.setTheme);
  const t = useTranslations('UI.darkModeToggle');

  return (
    <button
      type="button"
      aria-label={t('ariaLabel')}
      tabIndex={0}
      className="group border-border/40 bg-bg-surface/80 text-fg-main hover:border-ui-active-soft hover:bg-bg-surface/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page flex items-center justify-center rounded-lg border px-3 py-2 backdrop-blur-md transition focus-visible:outline-none"
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
        <MoonIcon className="group-hover:text-ui-active-soft h-5 w-5 transition" />
      ) : (
        <SunIcon className="group-hover:text-ui-active-soft h-5 w-5 transition" />
      )}
    </button>
  );
}
