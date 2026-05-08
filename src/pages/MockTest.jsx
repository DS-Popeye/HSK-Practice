import { useEffect, useMemo, useState } from 'react';
import vocabData from '../data/hsk4_vocab.json';
import grammarData from '../data/grammar.json';
import { buildGrammarQuestions, createVocabularyQuestion, shuffleArray } from '../utils/quizUtils.js';
import { getUserData, setUserData, STORAGE_KEYS } from '../utils/storage.js';

const practiceWords = vocabData.slice(0, 600);
const testMinutes = 60;

function buildMockTest() {
  const types = ['hanzi-meaning', 'meaning-hanzi', 'pinyin-meaning'];
  const vocabQuestions = shuffleArray(practiceWords)
    .slice(0, 40)
    .map((word, index) => createVocabularyQuestion(word, practiceWords, types[index % types.length]));
  return shuffleArray([...vocabQuestions, ...buildGrammarQuestions(grammarData, 20)]);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export default function MockTest() {
  const [questions, setQuestions] = useState(() => buildMockTest());
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(testMinutes * 60);

  const score = useMemo(() => questions.reduce((sum, question) => sum + (answers[question.id] === question.answer ? 1 : 0), 0), [answers, questions]);

  useEffect(() => {
    if (submitted) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) submitTest();
  }, [timeLeft, submitted]);

  function submitTest() {
    setSubmitted(true);
    const finalScore = questions.reduce((sum, question) => sum + (answers[question.id] === question.answer ? 1 : 0), 0);
    const history = getUserData(STORAGE_KEYS.mockHistory, []);
    const safeHistory = Array.isArray(history) ? history : [];
    setUserData(STORAGE_KEYS.mockHistory, [
      ...safeHistory,
      { date: new Date().toISOString(), score: finalScore, total: questions.length, scorePercent: Math.round((finalScore / questions.length) * 100) }
    ]);
  }

  function retake() {
    setQuestions(buildMockTest());
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(testMinutes * 60);
  }

  return (
    <section className="page">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">HSK mock test</p>
          <h1>60-question timed test</h1>
          <p>40 vocabulary questions and 20 grammar questions.</p>
        </div>
        <div className="timer">{formatTime(timeLeft)}</div>
      </div>

      {submitted && (
        <div className="scoreBanner">
          <strong>{score}/{questions.length}</strong>
          <span>{Math.round((score / questions.length) * 100)}% score</span>
          <button type="button" onClick={retake}>Retake mock test</button>
        </div>
      )}

      <div className="questionList compactQuestions">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const isCorrect = selected === question.answer;
          return (
            <article className="questionCard" key={`${question.id}-${index}`}>
              <span className="questionNumber">Question {index + 1}</span>
              <h2>{question.prompt}</h2>
              <p>{question.label}</p>
              <div className="optionsGrid">
                {question.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    disabled={submitted}
                    className={[
                      selected === option ? 'selected' : '',
                      submitted && option === question.answer ? 'correct' : '',
                      submitted && selected === option && !isCorrect ? 'incorrect' : ''
                    ].join(' ')}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {submitted && <p className={isCorrect ? 'resultGood' : 'resultBad'}>{isCorrect ? 'Correct' : `Correct answer: ${question.answer}. ${question.detail}`}</p>}
            </article>
          );
        })}
      </div>

      {!submitted && (
        <button type="button" className="primaryButton stickySubmit" onClick={submitTest}>
          Submit mock test
        </button>
      )}
    </section>
  );
}
