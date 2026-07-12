import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { extractTextFromPdf } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface UploadZoneProps {
  text: string;
  onTextChange: (text: string) => void;
  disabled?: boolean;
}

export function UploadZone({ text, onTextChange, disabled }: UploadZoneProps) {
  const { language, t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.type !== "application/pdf") {
        setError(t("upload.onlyPdfError"));
        return;
      }

      setIsParsing(true);
      try {
        const extracted = await extractTextFromPdf(file);
        if (!extracted.trim()) {
          setError(t("upload.scannedError"));
          setFileName(null);
        } else {
          onTextChange(extracted);
          setFileName(file.name);
        }
      } catch (err) {
        console.error(err);
        setError(t("upload.readError"));
        setFileName(null);
      } finally {
        setIsParsing(false);
      }
    },
    [onTextChange, t]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const clearAll = () => {
    onTextChange("");
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const charCount = text.length;

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-6 sm:p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {isParsing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("upload.extracting")}</p>
            </>
          ) : fileName ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">{t("upload.replaceHint")}</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">{t("upload.dragHint")}</p>
              <p className="text-xs text-muted-foreground">{t("upload.pasteHint")}</p>
            </>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("upload.pasteLabel")}
          </span>
          {(text || fileName) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={disabled}
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground"
            >
              <X className="h-3 w-3" />
              {t("upload.clear")}
            </Button>
          )}
        </div>

        <Textarea
          value={text}
          onChange={(e) => {
            onTextChange(e.target.value);
            setFileName(null);
          }}
          disabled={disabled}
          placeholder={t("upload.placeholder")}
          className="mt-2 min-h-[180px] resize-y"
        />

        <div className="mt-2 text-right text-xs text-muted-foreground">
          {t("upload.charCount", {
            count: charCount.toLocaleString(language === "en" ? "en-US" : "es"),
          })}
        </div>
      </CardContent>
    </Card>
  );
}
