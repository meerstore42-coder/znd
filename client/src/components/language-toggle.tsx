import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="gap-2 text-muted-foreground hover:text-foreground"
      data-testid="button-language-toggle"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {language === "ar" ? "EN" : "عربي"}
      </span>
    </Button>
  );
}
