import { useEffect, useMemo, useState } from 'react';
import vocabData from '../data/hsk4_vocab.json';
import AudioButton from '../components/AudioButton.jsx';
import { getUserData, setUserData, STORAGE_KEYS } from '../utils/storage.js';
import { getExampleText, getHskLevelByNo, getPrimaryMeaning, shuffleArray } from '../utils/quizUtils.js';

const practiceWords = vocabData.slice(0, 600);

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function insertLater(queue, word, min, max) {
  const insertAt = Math.min(randomBetween(min, max), queue.length);
  return [...queue.slice(0, insertAt), word, ...queue.slice(insertAt)];
}

function normalizeProgress(value) {
  const empty = {
    known: [],
    review: [],
    totalKnownCount: 0,
    totalReviewCount: 0,
    lastUpdated: null
  };

  if (!value || typeof value !== 'object' || Array.isArray(value)) return empty;

  if (Array.isArray(value.known) || Array.isArray(value.review)) {
    return {
      known: [...new Set((value.known || []).map(String))],
      review: [...new Set((value.review || []).map(String))],
      totalKnownCount: Number(value.totalKnownCount) || 0,
      totalReviewCount: Number(value.totalReviewCount) || 0,
      lastUpdated: value.lastUpdated || null
    };
  }

  const known = [];
  const review = [];
  Object.entries(value).forEach(([id, status]) => {
    if (status === 'known') known.push(String(id));
    if (status === 'unknown' || status === 'review') review.push(String(id));
  });

  return {
    ...empty,
    known: [...new Set(known)],
    review: [...new Set(review)],
    totalKnownCount: known.length,
    totalReviewCount: review.length
  };
}

function saveProgress(current, word, status) {
  const id = String(word?.no);
  const knownSet = new Set(current.known || []);
  const reviewSet = new Set(current.review || []);

  if (status === 'known') {
    knownSet.add(id);
    reviewSet.delete(id);
  } else {
    reviewSet.add(id);
    knownSet.delete(id);
  }

  const next = {
    known: [...knownSet],
    review: [...reviewSet],
    totalKnownCount: (Number(current.totalKnownCount) || 0) + (status === 'known' ? 1 : 0),
    totalReviewCount: (Number(current.totalReviewCount) || 0) + (status === 'review' ? 1 : 0),
    lastUpdated: new Date().toISOString()
  };

  setUserData(STORAGE_KEYS.flashcards, next);
  return next;
}

export default function Flashcards() {
  const [queue, setQueue] = useState(() => shuffleArray(practiceWords));
  const [history, setHistory] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [progress, setProgress] = useState(() => normalizeProgress(getUserData(STORAGE_KEYS.flashcards, {})));
  const [cardsSeenThisSession, setCardsSeenThisSession] = useState(0);
  const [knownClicks, setKnownClicks] = useState(0);
  const [dontKnowClicks, setDontKnowClicks] = useState(0);
  const [currentCardCounted, setCurrentCardCounted] = useState(false);

  const word = queue[0];
  const isCountingDown = countdown !== null;
  const meaning = getPrimaryMeaning(word);
  const example = getExampleText(word) || 'No example available';
  const quizHardWords = getUserData(STORAGE_KEYS.quizHardWords, []);
  const hardWordCount = useMemo(() => {
    const ids = new Set((progress.review || []).map(String));
    if (Array.isArray(quizHardWords)) {
      quizHardWords.forEach((item) => ids.add(String(item?.no ?? item)));
    }
    return ids.size;
  }, [progress.review, quizHardWords]);
  const totalAnswered = knownClicks + dontKnowClicks;
  const accuracy = totalAnswered > 0 ? Math.round((knownClicks / totalAnswered) * 100) : 0;
  const currentWordId = String(word?.no || '');
  const statusLabel = progress.known.includes(currentWordId)
    ? 'Known'
    : progress.review.includes(currentWordId) || (Array.isArray(quizHardWords) && quizHardWords.some((item) => String(item?.no ?? item) === currentWordId))
      ? 'Review'
      : 'Learning';

  useEffect(() => {
    if (countdown === null) return undefined;

    const timer = window.setTimeout(() => {
      if (countdown <= 1) {
        advanceWithSchedule(5, 6);
        return;
      }
      setCountdown((value) => (value === null ? null : value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  function resetReviewState() {
    setShowAnswer(false);
    setCountdown(null);
    setCurrentCardCounted(false);
  }

  function toggleAnswer() {
    setShowAnswer((value) => !value);
  }

  function countCurrentCard() {
    if (currentCardCounted) return;
    setCardsSeenThisSession((value) => Math.min(practiceWords.length, value + 1));
    setCurrentCardCounted(true);
  }

  function advanceWithSchedule(min, max) {
    setQueue((currentQueue) => {
      if (!currentQueue.length) return currentQueue;
      setHistory((currentHistory) => [...currentHistory, currentQueue]);
      const [currentWord, ...rest] = currentQueue;
      return insertLater(rest, currentWord, min, max);
    });
    resetReviewState();
  }

  function markKnown() {
    if (!word || isCountingDown) return;
    countCurrentCard();
    setKnownClicks((value) => value + 1);
    setProgress((current) => saveProgress(current, word, 'known'));
    advanceWithSchedule(20, 30);
  }

  function markReview() {
    if (!word || isCountingDown) return;
    countCurrentCard();
    setDontKnowClicks((value) => value + 1);
    setProgress((current) => saveProgress(current, word, 'review'));
    setShowAnswer(true);
    setCountdown(10);
  }

  function nextCard() {
    if (!word || isCountingDown) return;
    countCurrentCard();
    setQueue((currentQueue) => {
      if (!currentQueue.length) return currentQueue;
      setHistory((currentHistory) => [...currentHistory, currentQueue]);
      const [currentWord, ...rest] = currentQueue;
      return [...rest, currentWord];
    });
    resetReviewState();
  }

  function previousCard() {
    if (!history.length || isCountingDown) return;
    const previousQueue = history[history.length - 1];
    setHistory((currentHistory) => currentHistory.slice(0, -1));
    setQueue(previousQueue);
    resetReviewState();
  }

  function shuffleDeck() {
    setQueue(shuffleArray(practiceWords));
    setHistory([]);
    resetReviewState();
  }

  return (
    <section className="page">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">Flashcards</p>
          <h1>Practice the first 600 words</h1>
          <p>HSK 1-3 cumulative deck: the first 600 vocabulary words. Hard words appear more often.</p>
        </div>
      </div>

      <div className="flashSummaryGrid">
        <article className="flashSummaryCard">
          <span>Session Progress</span>
          <strong>{cardsSeenThisSession}/{practiceWords.length}</strong>
          <small>Cards seen this session</small>
        </article>
        <article className="flashSummaryCard">
          <span>Accuracy</span>
          <strong>{accuracy}%</strong>
          <small>Correct vs total</small>
        </article>
        <article className="flashSummaryCard">
          <span>Hard Words</span>
          <strong>{hardWordCount}</strong>
          <small>From quiz and flashcards</small>
        </article>
      </div>

      <article className="flashcard flashcardMain" onClick={toggleAnswer} role="button" tabIndex={0} onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleAnswer();
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          markReview();
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          markKnown();
        }
      }}>
        <div className="flashCardHeader">
          <div>
            <strong>Current Card</strong>
            <small>Tip: press Space to flip, ← wrong, → correct.</small>
          </div>
          <div className="flashBadges">
            <span>No. {word?.no || '-'} · {getHskLevelByNo(word?.no)}</span>
            <span>{statusLabel}</span>
          </div>
        </div>
        <div className="cardCounter">{Math.min(cardsSeenThisSession + 1, practiceWords.length)} / {practiceWords.length}</div>
        {!showAnswer ? (
          <div className="flashFace">
            <div className="flashFront">
              <h2>{word?.hanzi || 'Unknown'}</h2>
              <div onClick={(event) => event.stopPropagation()}>
                <AudioButton hanzi={word?.hanzi} />
              </div>
            </div>
            <p className="flashHint">Click card to show answer</p>
          </div>
        ) : (
          <div className="flashBack">
            <h2>{word?.hanzi || 'Unknown'}</h2>
            <p className="pinyin">{word?.pinyin || 'No pinyin'}</p>
            <p>{meaning}</p>
            <p className="example">{example}</p>
            <div onClick={(event) => event.stopPropagation()}>
              <AudioButton hanzi={word?.hanzi} />
            </div>
            <p className="flashHint">Click card to hide answer</p>
          </div>
        )}
        {isCountingDown && (
          <div className="flashCountdown">
            Next card in {countdown}...
          </div>
        )}
      </article>

      <div className="buttonBar">
        <button type="button" onClick={previousCard} disabled={!history.length || isCountingDown}>Previous</button>
        <button type="button" onClick={markKnown} disabled={isCountingDown}>I know this</button>
        <button type="button" onClick={markReview} disabled={isCountingDown}>I don't know this</button>
        <button type="button" onClick={nextCard} disabled={isCountingDown}>Next</button>
        <button type="button" onClick={shuffleDeck}>Shuffle</button>
      </div>
    </section>
  );
}
