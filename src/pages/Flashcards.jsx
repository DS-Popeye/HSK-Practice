import { useMemo, useState } from 'react';
import vocabData from '../data/hsk4_vocab.json';
import AudioButton from '../components/AudioButton.jsx';
import { readStorage, STORAGE_KEYS, writeStorage } from '../utils/storage.js';
import { getExampleText, getSensesText, shuffleArray } from '../utils/quizUtils.js';

const practiceWords = vocabData.slice(0, 600);

export default function Flashcards() {
  const [deck, setDeck] = useState(practiceWords);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(() => readStorage(STORAGE_KEYS.flashcards, {}));
  const word = deck[index];

  const counts = useMemo(() => ({
    known: Object.values(progress).filter((value) => value === 'known').length,
    unknown: Object.values(progress).filter((value) => value === 'unknown').length
  }), [progress]);

  function saveStatus(status) {
    const next = { ...progress, [word.no]: status };
    setProgress(next);
    writeStorage(STORAGE_KEYS.flashcards, next);
  }

  function move(delta) {
    setIndex((value) => Math.min(deck.length - 1, Math.max(0, value + delta)));
    setShowAnswer(false);
  }

  function shuffleDeck() {
    setDeck(shuffleArray(deck));
    setIndex(0);
    setShowAnswer(false);
  }

  return (
    <section className="page">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">Flashcards</p>
          <h1>Practice the first 600 words</h1>
          <p>{counts.known} known, {counts.unknown} need review.</p>
        </div>
      </div>

      <article className="flashcard">
        <div className="cardCounter">{index + 1} / {deck.length}</div>
        <div className="flashFront">
          <h2>{word.hanzi}</h2>
          <AudioButton hanzi={word.hanzi} />
        </div>
        {showAnswer ? (
          <div className="flashBack">
            <p className="pinyin">{word.pinyin}</p>
            <p>{getSensesText(word)}</p>
            <p className="example">{getExampleText(word) || 'No example available.'}</p>
          </div>
        ) : (
          <button type="button" className="primaryButton" onClick={() => setShowAnswer(true)}>Show Answer</button>
        )}
      </article>

      <div className="buttonBar">
        <button type="button" onClick={() => move(-1)} disabled={index === 0}>Previous</button>
        <button type="button" onClick={() => saveStatus('known')}>I know this</button>
        <button type="button" onClick={() => saveStatus('unknown')}>I don't know this</button>
        <button type="button" onClick={() => move(1)} disabled={index === deck.length - 1}>Next</button>
        <button type="button" onClick={shuffleDeck}>Shuffle</button>
      </div>
    </section>
  );
}
