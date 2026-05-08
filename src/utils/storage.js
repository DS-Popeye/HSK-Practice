export const STORAGE_KEYS = {
  learnedWords: 'hsk_learned_words',
  flashcards: 'hsk_flashcard_progress',
  quizHistory: 'hsk_quiz_history',
  quizHardWords: 'hsk_quiz_hard_words',
  mockHistory: 'hsk_mock_history',
  grammarStudied: 'hsk_grammar_studied'
};

export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private browsing or when quota is full; keep the UI alive.
  }
}

export function toggleInList(key, id) {
  const current = readStorage(key, []);
  const safeCurrent = Array.isArray(current) ? current : [];
  const textId = String(id);
  const next = safeCurrent.includes(textId)
    ? safeCurrent.filter((item) => item !== textId)
    : [...safeCurrent, textId];
  writeStorage(key, next);
  return next;
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
