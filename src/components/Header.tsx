import { History, LogOut, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight">
            Summarify
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Link to="/history">
                <Button variant="ghost" size="icon" aria-label={t("header.viewHistory")} className="rounded-full">
                  <History className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                aria-label={t("header.signOut")}
                className="rounded-full"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
