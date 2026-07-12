import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={t(theme === "dark" ? "header.themeToLight" : "header.themeToDark")}
      className="rounded-full"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
