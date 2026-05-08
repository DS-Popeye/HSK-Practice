export function getSenses(word) {
  return Array.isArray(word?.senses) ? word.senses.filter(Boolean) : [];
}

export function getSensesText(word) {
  return getSenses(word)
    .map((sense) => sense.meaning)
    .filter(Boolean)
    .join('; ') || 'No meaning available';
}

export function getPosText(word) {
  return [...new Set(getSenses(word).map((sense) => sense.pos).filter(Boolean))].join(', ');
}

export function getExampleText(word) {
  return getSenses(word).map((sense) => sense.example).filter(Boolean).join(' / ');
}

export function getPrimaryMeaning(word) {
  return getSenses(word)[0]?.meaning || 'No meaning available';
}

export function getHskLevelByNo(no) {
  const n = Number(no);

  if (n >= 1 && n <= 150) return 'HSK 1';
  if (n >= 151 && n <= 300) return 'HSK 2';
  if (n >= 301 && n <= 600) return 'HSK 3';
  if (n >= 601 && n <= 1200) return 'HSK 4';

  return 'HSK';
}

export function shuffleArray(items) {
  return [...(Array.isArray(items) ? items : [])].sort(() => Math.random() - 0.5);
}

function makeOptions(correct, pool, formatter, count = 4) {
  const safePool = Array.isArray(pool) ? pool : [];
  const wrong = shuffleArray(safePool.filter((item) => item?.no !== correct?.no))
    .slice(0, count - 1)
    .map(formatter);
  return shuffleArray([formatter(correct), ...wrong]);
}

export function createVocabularyQuestion(word, pool, type = 'hanzi-meaning') {
  const hanzi = word?.hanzi || 'Unknown';
  const pinyin = word?.pinyin || 'No pinyin';
  const no = word?.no || `${hanzi}-${pinyin}`;

  if (type === 'meaning-hanzi') {
    return {
      id: `meaning-hanzi-${no}`,
      prompt: getSensesText(word),
      label: 'Choose the matching Hanzi',
      answer: hanzi,
      options: makeOptions(word, pool, (item) => item?.hanzi || 'Unknown'),
      detail: `${hanzi} (${pinyin}) - ${getSensesText(word)}`
    };
  }

  if (type === 'pinyin-meaning') {
    return {
      id: `pinyin-meaning-${no}`,
      prompt: pinyin,
      label: 'Choose the meaning',
      answer: getSensesText(word),
      options: makeOptions(word, pool, getSensesText),
      detail: `${hanzi} (${pinyin}) - ${getSensesText(word)}`
    };
  }

  return {
    id: `hanzi-meaning-${no}`,
    prompt: hanzi,
    label: 'Choose the meaning',
    answer: getSensesText(word),
    options: makeOptions(word, pool, getSensesText),
    detail: `${hanzi} (${pinyin}) - ${getSensesText(word)}`
  };
}

export function buildQuiz(words, total = 20) {
  const types = ['hanzi-meaning', 'meaning-hanzi', 'pinyin-meaning'];
  return shuffleArray(words)
    .slice(0, total)
    .map((word, index) => createVocabularyQuestion(word, words, types[index % types.length]));
}

export function buildMeaningQuiz(words, total = 10) {
  const safeWords = Array.isArray(words) ? words.filter(Boolean) : [];
  const selectedWords = shuffleArray(safeWords).slice(0, Math.min(total, safeWords.length));
  const fallbackOptions = ['No meaning available', 'Related expression', 'Common daily word', 'HSK vocabulary word'];

  return selectedWords.map((word) => {
    const answer = getPrimaryMeaning(word);
    const optionSet = new Set([answer]);

    for (const optionWord of shuffleArray(safeWords)) {
      if (optionSet.size >= 4) break;
      if (optionWord?.no === word?.no) continue;
      const meaning = getPrimaryMeaning(optionWord);
      if (meaning) optionSet.add(meaning);
    }

    for (const fallback of fallbackOptions) {
      if (optionSet.size >= 4) break;
      optionSet.add(fallback);
    }

    return {
      id: `quiz-${word?.no || Math.random().toString(36).slice(2)}`,
      word,
      answer,
      options: shuffleArray(Array.from(optionSet).slice(0, 4))
    };
  });
}

export function buildGrammarQuestions(grammar, total = 20) {
  return shuffleArray(grammar).slice(0, total).map((item) => ({
    id: `grammar-${item.id}`,
    prompt: item.structure,
    label: 'Choose the grammar point',
    answer: item.title,
    options: shuffleArray([
      item.title,
      ...shuffleArray(grammar.filter((point) => point.id !== item.id)).slice(0, 3).map((point) => point.title)
    ]),
    detail: `${item.title}: ${item.explanation}`
  }));
}
