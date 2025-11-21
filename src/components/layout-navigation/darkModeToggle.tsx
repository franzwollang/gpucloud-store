import { MoonIcon, SunIcon } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { Button } from "../ui/button";

export default function DarkModeToggle() {
  const [theme, setTheme] = useUIStore((state) => [
    state.theme,
    state.setTheme,
  ]);

  return (
    <Button
      aria-label="Toggle dark mode"
      tabIndex={0}
      variant="outline"
      className="text-black dark:text-white"
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
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </Button>
  );
}
