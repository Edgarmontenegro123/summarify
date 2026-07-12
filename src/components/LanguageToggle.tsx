import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SummaryLanguage } from "@/types";

const OPTIONS: { value: SummaryLanguage; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("header.languageLabel")}
      className="flex items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
            language === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
