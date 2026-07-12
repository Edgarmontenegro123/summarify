import type { SummaryLanguage, SummaryMode } from "@/types";

// Palabras vacías en español: no aportan significado para puntuar oraciones.
const STOPWORDS_ES = new Set(
  `de la que el en y a los del se las por un para con no una su al lo como
   más pero sus le ya o este sí porque esta entre cuando muy sin sobre
   también me hasta hay donde quien desde todo nos durante todos uno les
   ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo
   otro otras otra él tanto esa estos mucho quienes nada muchos cual poco
   ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas
   nosotras vosotros vosotras os mío mía míos mías tuyo tuya tuyos tuyas
   suyo suya suyos suyas nuestro nuestra nuestros nuestras vuestro vuestra
   vuestros vuestras esos esas estoy estás está estamos estáis están esté
   son fue ser sido siendo he ha han habrá había eran era son somos sea
   seremos serán fueron será tiene tienen tener tuvo hace hacer hizo cada
   sin cómo dónde cuál cuáles esto eso aquello aquí allí ahí sobre bajo`
    .split(/\s+/)
    .filter(Boolean)
);

// English stopwords: same purpose as STOPWORDS_ES, used when the user
// selects the English mode. Kept in its own set instead of merging with
// the Spanish one so each language scores sentences using only its own
// function words.
const STOPWORDS_EN = new Set(
  `the of and a to in is you that it he was for on are as with his they i
   at be this have from or one had by word but not what all were we when
   your can said there use an each which she do how their if will up
   other about out many then them these so some her would make like him
   into time has look two more write go see number no way could people
   my than first water been call who oil its now find long down day did
   get come made may part over new sound take only little work know
   place year live me back give most very after thing our just name good
   sentence man think say great where help through much before line
   right too mean old any same tell boy follow came want show also
   around form three small set put end does another well large must big
   even such because turn here why ask went men read need land different
   home us move try kind hand picture again change off play spell air
   away animal house point page letter mother answer found study still
   learn should america world`
    .split(/\s+/)
    .filter(Boolean)
);

const STOPWORDS_BY_LANGUAGE: Record<SummaryLanguage, Set<string>> = {
  es: STOPWORDS_ES,
  en: STOPWORDS_EN,
};

const SENTENCE_SPLIT_RE = /(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÑ¿¡"«])|(?<=[.!?…])\n+/g;

// Viñetas y guiones de lista: los PDFs suelen perder los saltos de línea al
// extraer el texto, así que un bloque con viñetas queda pegado en una sola
// "oración" gigante si no se corta aquí primero.
const BULLET_SPLIT_RE = /\s*[•●▪‣∙◦]\s*/g;

function splitSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const segments = normalized.split(BULLET_SPLIT_RE).filter(Boolean);

  const sentences: string[] = [];
  for (const segment of segments) {
    const parts = segment
      .split(SENTENCE_SPLIT_RE)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    sentences.push(...parts);
  }

  return sentences;
}

const URL_TEST_RE = /https?:\/\/\S+|www\.\S+/i;

function stripUrls(sentence: string): string {
  return sentence.replace(/https?:\/\/\S+|www\.\S+/gi, " ");
}

function tokenizeRaw(text: string): string[] {
  return stripUrls(text).toLowerCase().match(/[a-záéíóúñü]+/g) || [];
}

function tokenizeWords(sentence: string, language: SummaryLanguage): string[] {
  const stopwords = STOPWORDS_BY_LANGUAGE[language];
  return tokenizeRaw(sentence).filter((w) => w.length > 2 && !stopwords.has(w));
}

function buildWordFrequencies(
  sentences: string[],
  language: SummaryLanguage
): Map<string, number> {
  const freq = new Map<string, number>();

  for (const sentence of sentences) {
    for (const word of tokenizeWords(sentence, language)) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }

  const max = Math.max(1, ...freq.values());
  for (const [word, count] of freq) {
    freq.set(word, count / max);
  }

  return freq;
}

function scoreSentences(
  sentences: string[],
  freq: Map<string, number>,
  language: SummaryLanguage
): number[] {
  return sentences.map((sentence, index) => {
    const words = tokenizeWords(sentence, language);
    const wordScore = words.reduce((sum, w) => sum + (freq.get(w) || 0), 0);
    const lengthNormalized = wordScore / Math.sqrt(Math.max(words.length, 1));

    let bonus = 0;
    if (index === 0) bonus += 0.15;
    else if (index === 1) bonus += 0.08;
    if (index === sentences.length - 1) bonus += 0.05;
    if (/\d/.test(sentence)) bonus += 0.05;
    if (/[a-záéíóúñ]\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/.test(sentence)) bonus += 0.03;

    // Las oraciones que son mayormente un enlace aportan poco a un resumen
    // hablado: se deprioritizan en vez de excluirse por completo.
    const penalty = URL_TEST_RE.test(sentence) ? 0.5 : 1;

    return lengthNormalized * penalty + bonus;
  });
}

function pickTopSentences(sentences: string[], scores: number[], count: number): string[] {
  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, score: scores[index] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index);

  return ranked.map((r) => r.sentence);
}

const MIN_SENTENCES_TO_SUMMARIZE = 3;

export function generateSummary(
  rawText: string,
  mode: SummaryMode,
  language: SummaryLanguage = "es"
): string {
  const sentences = splitSentences(rawText);

  if (sentences.length < MIN_SENTENCES_TO_SUMMARIZE) {
    return rawText.trim();
  }

  const freq = buildWordFrequencies(sentences, language);
  const scores = scoreSentences(sentences, freq, language);

  if (mode === "breve") {
    const count = Math.min(5, Math.max(2, Math.round(sentences.length * 0.2)));
    const selected = pickTopSentences(sentences, scores, count);
    return selected.join(" ");
  }

  const count = Math.min(12, Math.max(4, Math.round(sentences.length * 0.45)));
  const selected = pickTopSentences(sentences, scores, count);
  const [lead, ...rest] = selected;

  if (rest.length === 0) return lead;

  return `${lead}\n\n${rest.map((s) => `• ${s}`).join("\n")}`;
}

const MIN_STOPWORD_HITS_FOR_DETECTION = 5;

// Heurística local (sin IA/traducción): cuenta cuántas palabras del texto
// coinciden con las listas de stopwords de cada idioma. Solo se usa para
// bloquear el modo Inglés cuando el texto es claramente español —no para
// detectar cualquier idioma del mundo—, así que con poca señal preferimos
// "unknown" y dejamos pasar el texto en vez de bloquear en falso.
export function detectLikelyLanguage(text: string): SummaryLanguage | "unknown" {
  const words = tokenizeRaw(text);
  if (words.length === 0) return "unknown";

  let esHits = 0;
  let enHits = 0;
  for (const word of words) {
    if (STOPWORDS_ES.has(word)) esHits++;
    if (STOPWORDS_EN.has(word)) enHits++;
  }

  if (esHits + enHits < MIN_STOPWORD_HITS_FOR_DETECTION) return "unknown";
  return esHits > enHits ? "es" : "en";
}
