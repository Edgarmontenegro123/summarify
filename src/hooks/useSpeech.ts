import { useCallback, useEffect, useRef, useState } from "react";
import type { SummaryLanguage } from "@/types";

// Orden de preferencia por idioma. Para español priorizamos variantes
// latinas "neutras"; para inglés, es-US primero por ser la variante con
// mejor disponibilidad de voces en la mayoría de los navegadores/SO.
const LANG_PRIORITY: Record<SummaryLanguage, string[]> = {
  es: ["es-419", "es-us", "es-mx", "es-co", "es-ar", "es"],
  en: ["en-us", "en-gb", "en-au", "en"],
};

const DEFAULT_LANG: Record<SummaryLanguage, string> = {
  es: "es-419",
  en: "en-US",
};

function scoreVoice(voice: SpeechSynthesisVoice, language: SummaryLanguage): number {
  const lang = voice.lang.toLowerCase();
  if (!lang.startsWith(language)) return -1;

  const priority = LANG_PRIORITY[language];
  const idx = priority.indexOf(lang);
  if (idx !== -1) return 100 - idx;

  // Para español, cualquier variante que no sea España puntúa mejor que
  // es-ES, para acercarnos a un acento "neutro" en vez de marcadamente
  // ibérico. El inglés no tiene ese sesgo: cualquier variante no listada
  // puntúa igual.
  if (language === "es" && lang !== "es-es") return 40;

  return 20;
}

function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  language: SummaryLanguage
): SpeechSynthesisVoice | null {
  const candidates = voices
    .map((v) => ({ voice: v, score: scoreVoice(v, language) }))
    .filter((v) => v.score >= 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.voice ?? null;
}

// Divide el texto en fragmentos manejables por oración para evitar que
// algunos navegadores corten utterances muy largas.
function splitIntoChunks(text: string, maxLen = 220): string[] {
  const sentences = text.match(/[^.!?¡¿]+[.!?]+["']?|[^.!?¡¿]+$/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((current + " " + trimmed).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current = (current + " " + trimmed).trim();
    }
  }
  if (current) chunks.push(current.trim());

  return chunks.length ? chunks : [text];
}

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported] = useState(
    typeof window !== "undefined" && "speechSynthesis" in window
  );
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, language: SummaryLanguage = "es") => {
      if (!isSupported || !text.trim()) return;

      window.speechSynthesis.cancel();

      const voice = pickBestVoice(voices, language);
      const chunks = splitIntoChunks(text);
      const utterances = chunks.map((chunk) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = voice?.lang || DEFAULT_LANG[language];
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
        utterance.pitch = 1;
        return utterance;
      });

      queueRef.current = utterances;

      utterances.forEach((utterance, i) => {
        if (i === 0) {
          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };
        }
        if (i === utterances.length - 1) {
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
          };
        }
        window.speechSynthesis.speak(utterance);
      });
    },
    [isSupported, voices]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  useEffect(() => stop, [stop]);

  return { speak, pause, resume, stop, isSpeaking, isPaused, isSupported };
}
