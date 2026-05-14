import api from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Backend'den gelen tek bir seçenek.
 * API "options: string[]" de dönebilir, "options: {id, text}[]" de.
 */
export type ApiOption = string | { id?: number | string; text?: string; label?: string };

/** Backend'den gelen ham soru yapısı */
export type ApiQuestion = {
  id: string;
  /** Soru metni — "text" veya "question" alanında gelebilir */
  text?: string;
  question?: string;
  /** Kategori adı (ör. "sleep", "cleaning", "social", "work", "lifestyle") */
  category?: string;
  /** Backend bazı API'lar emoji/icon gönderiyor olabilir */
  categoryIcon?: string;
  options: ApiOption[];
};

/**
 * Component içinde kullanılan normalize edilmiş soru.
 * Kaynaktan (API vs hardcoded) bağımsız tek tip.
 */
export type NormalizedQuestion = {
  id:           string;
  catIndex:     number;   // 0-4 → CATS dizisine index
  question:     string;
  opts:         string[]; // her zaman string[]
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CAT_NAME_MAP: Record<string, number> = {
  // English
  sleep: 0, sleeping: 0, uyku: 0,
  cleaning: 1, cleanliness: 1, temizlik: 1,
  social: 2, sociality: 2, sosyal: 2,
  work: 3, working: 3, calisma: 3,
  lifestyle: 4, life: 4, yaşam: 4, yasam: 4,
};

/**
 * Backend sorusunu NormalizedQuestion'a dönüştürür.
 * Herhangi bir alan eksikse fallback kullanır.
 */
export function normalizeQuestion(
  raw: ApiQuestion,
  fallbackQ: string,
  fallbackOpts: string[],
  fallbackCatIdx: number,
  index: number,
): NormalizedQuestion {
  const question = raw.text || raw.question || fallbackQ;

  const opts: string[] = raw.options.length > 0
    ? raw.options.map(o =>
        typeof o === 'string'
          ? o
          : (o.text ?? o.label ?? String(o))
      )
    : fallbackOpts;

  const catKey = (raw.category ?? '').toLowerCase();
  const catIndex = CAT_NAME_MAP[catKey] ?? fallbackCatIdx;

  return {
    id:       raw.id ?? String(index),
    catIndex,
    question,
    opts:     opts.slice(0, 4), // maksimum 4 seçenek
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const quizService = {
  /**
   * Quiz sorularını backend'den çeker.
   * Dönen dizi normalize edilmemiş ham formattadır;
   * QuizScreen içinde normalizeQuestion() ile dönüştürülür.
   */
  getQuestions: async (): Promise<ApiQuestion[]> => {
    const res = await api.get<ApiQuestion[]>('/quiz/questions');
    return res.data;
  },

  /**
   * Kullanıcının cevaplarını backend'e gönderir.
   * `answers`: her soruya seçilen şıkkın index'i (0–3), cevaplanmamışsa null.
   */
  submitAnswers: async (answers: (number | null)[]): Promise<void> => {
    await api.post('/quiz/answers', { answers });
  },
};
