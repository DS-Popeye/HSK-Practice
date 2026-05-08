import { useMemo, useState } from 'react';
import vocabData from '../data/hsk4_vocab.json';
import VocabularyCard from '../components/VocabularyCard.jsx';
import { getUserData, STORAGE_KEYS, toggleUserListItem } from '../utils/storage.js';
import { getExampleText, getPosText, getSenses, getSensesText } from '../utils/quizUtils.js';

const pageSize = 50;

export default function Vocabulary() {
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState('all');
  const [page, setPage] = useState(1);
  const [learned, setLearned] = useState(() => getUserData(STORAGE_KEYS.learnedWords, []));

  const partsOfSpeech = useMemo(() => {
    const values = new Set();
    vocabData.forEach((word) => getSenses(word).forEach((sense) => sense.pos && values.add(sense.pos)));
    return ['all', ...Array.from(values).sort()];
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return vocabData.filter((word) => {
      const haystack = `${word.hanzi} ${word.pinyin} ${getSensesText(word)} ${getExampleText(word)}`.toLowerCase();
      const matchesSearch = !needle || haystack.includes(needle);
      const matchesPos = pos === 'all' || getSenses(word).some((sense) => sense.pos === pos);
      return matchesSearch && matchesPos;
    });
  }, [query, pos]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleWords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleLearned(no) {
    setLearned(toggleUserListItem(STORAGE_KEYS.learnedWords, no));
  }

  function updateSearch(value) {
    setQuery(value);
    setPage(1);
  }

  function updatePos(value) {
    setPos(value);
    setPage(1);
  }

  return (
    <section className="page">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">Vocabulary bank</p>
          <h1>All HSK vocabulary</h1>
          <p>{vocabData.length} imported words, searchable by hanzi, pinyin, meaning, or example.</p>
        </div>
      </div>

      <div className="toolbar">
        <input value={query} onChange={(event) => updateSearch(event.target.value)} placeholder="Search 爱, ai, love, or examples..." />
        <select value={pos} onChange={(event) => updatePos(event.target.value)}>
          {partsOfSpeech.map((item) => <option key={item} value={item}>{item === 'all' ? 'All parts of speech' : item}</option>)}
        </select>
      </div>

      <div className="listMeta">
        <span>{filtered.length} results</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {visibleWords.length ? (
        <div className="vocabList">
          {visibleWords.map((word) => (
            <VocabularyCard
              key={word.no}
              word={{ ...word, posText: getPosText(word) }}
              learned={learned.includes(String(word.no))}
              onToggleLearned={toggleLearned}
            />
          ))}
        </div>
      ) : (
        <p className="emptyState">No vocabulary matches your filters.</p>
      )}

      <div className="pagination">
        <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span>{currentPage} / {totalPages}</span>
        <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
    </section>
  );
}
