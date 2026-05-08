import { useMemo, useState } from 'react';
import grammarData from '../data/grammar.json';
import { getUserData, STORAGE_KEYS, toggleUserListItem } from '../utils/storage.js';

export default function Grammar() {
  const [query, setQuery] = useState('');
  const [studied, setStudied] = useState(() => getUserData(STORAGE_KEYS.grammarStudied, []));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return grammarData;
    return grammarData.filter((item) => `${item.title} ${item.structure} ${item.explanation} ${item.exampleChinese} ${item.exampleEnglish}`.toLowerCase().includes(needle));
  }, [query]);

  function toggleStudied(id) {
    setStudied(toggleUserListItem(STORAGE_KEYS.grammarStudied, id));
  }

  return (
    <section className="page">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">Grammar practice</p>
          <h1>HSK4-style grammar points</h1>
          <p>{studied.length} of {grammarData.length} points studied.</p>
        </div>
      </div>

      <div className="toolbar single">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search grammar, structure, or examples..." />
      </div>

      {filtered.length ? (
        <div className="grammarGrid">
          {filtered.map((item) => {
            const done = studied.includes(String(item.id));
            return (
              <article className={`grammarCard ${done ? 'isLearned' : ''}`} key={item.id}>
                <span className="tag">#{item.id}</span>
                <h2>{item.title}</h2>
                <p className="structure">{item.structure}</p>
                <p>{item.explanation}</p>
                <p className="example">{item.exampleChinese}</p>
                <p>{item.exampleEnglish}</p>
                <button type="button" className={done ? 'secondaryButton active' : 'secondaryButton'} onClick={() => toggleStudied(item.id)}>
                  {done ? 'Studied' : 'Mark as studied'}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="emptyState">No grammar points match your search.</p>
      )}
    </section>
  );
}
