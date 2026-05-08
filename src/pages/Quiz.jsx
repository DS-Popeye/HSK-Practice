import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import vocabData from '../data/hsk4_vocab.json';
import AudioButton from '../components/AudioButton.jsx';
import { buildMeaningQuiz, getExampleText, getPrimaryMeaning } from '../utils/quizUtils.js';
import { readStorage, STORAGE_KEYS, writeStorage } from '../utils/storage.js';

const practiceWords = vocabData.slice(0, 600);
const totalQuestions = 10;

function createSession() {
  return buildMeaningQuiz(practiceWords, totalQuestions);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function saveHardWord(word) {
  const current = safeArray(readStorage(STORAGE_KEYS.quizHardWords, []));
  const exists = current.some((item) => String(item.no) === String(word.no));
  if (exists) return current;

  const next = [
    ...current,
    {
      no: word.no,
      hanzi: word.hanzi || 'Unknown',
      pinyin: word.pinyin || '',
      meaning: getPrimaryMeaning(word),
      example: getExampleText(word)
    }
  ];
  writeStorage(STORAGE_KEYS.quizHardWords, next);
  return next;
}

function exportResult({ userName, score, accuracy, hardWords }) {
  const lines = [
    'HSK Practice Quiz Result',
    `Name: ${userName || 'Not provided'}`,
    `Date: ${new Date().toLocaleString()}`,
    `Score: ${score}/${totalQuestions}`,
    `Accuracy: ${accuracy}%`,
    `Correct: ${score}`,
    `Wrong: ${totalQuestions - score}`,
    '',
    'Hard Words:',
    ...(hardWords.length
      ? hardWords.map((word) => `#${word.no} ${word.hanzi} (${word.pinyin}) - ${word.meaning}${word.example ? ` | ${word.example}` : ''}`)
      : ['None'])
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hsk-quiz-result-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function Quiz() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [sessionHardWords, setSessionHardWords] = useState([]);
  const [status, setStatus] = useState('start');

  const currentQuestion = questions[currentIndex];
  const correctCount = answers.filter((answer) => answer.correct).length;
  const wrongCount = answers.filter((answer) => !answer.correct).length;
  const accuracy = useMemo(() => Math.round((correctCount / totalQuestions) * 100) || 0, [correctCount]);

  function startQuiz() {
    setQuestions(createSession());
    setCurrentIndex(0);
    setSelectedAnswer('');
    setAnswers([]);
    setSessionHardWords([]);
    setStatus('active');
  }

  function finishQuiz(finalAnswers, finalHardWords) {
    const correct = finalAnswers.filter((answer) => answer.correct).length;
    const wrong = totalQuestions - correct;
    const finalAccuracy = Math.round((correct / totalQuestions) * 100) || 0;
    const history = safeArray(readStorage(STORAGE_KEYS.quizHistory, []));

    writeStorage(STORAGE_KEYS.quizHistory, [
      ...history,
      {
        id: `quiz-${Date.now()}`,
        userName: userName.trim(),
        date: new Date().toISOString(),
        totalQuestions,
        total: totalQuestions,
        correct,
        wrong,
        score: correct,
        accuracy: finalAccuracy,
        scorePercent: finalAccuracy,
        hardWords: finalHardWords
      }
    ]);
    setStatus('result');
  }

  function chooseAnswer(option) {
    if (!currentQuestion || selectedAnswer) return;

    const correct = option === currentQuestion.answer;
    const hardWord = {
      no: currentQuestion.word?.no,
      hanzi: currentQuestion.word?.hanzi || 'Unknown',
      pinyin: currentQuestion.word?.pinyin || '',
      meaning: getPrimaryMeaning(currentQuestion.word),
      example: getExampleText(currentQuestion.word)
    };

    const nextAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        wordNo: currentQuestion.word?.no,
        selected: option,
        answer: currentQuestion.answer,
        correct
      }
    ];

    let nextHardWords = sessionHardWords;
    if (!correct) {
      saveHardWord(currentQuestion.word);
      nextHardWords = sessionHardWords.some((word) => String(word.no) === String(hardWord.no))
        ? sessionHardWords
        : [...sessionHardWords, hardWord];
      setSessionHardWords(nextHardWords);
    }

    setAnswers(nextAnswers);
    setSelectedAnswer(option);

    if (currentIndex === totalQuestions - 1) {
      finishQuiz(nextAnswers, nextHardWords);
    }
  }

  function nextQuestion() {
    if (!selectedAnswer) return;
    setSelectedAnswer('');
    setCurrentIndex((index) => Math.min(index + 1, totalQuestions - 1));
  }

  if (status === 'start') {
    return (
      <section className="page quizPage">
        <article className="quizStartCard">
          <p className="eyebrow">Quiz</p>
          <h1>Quiz</h1>
          <p>Each session has 10 questions from the first 600 HSK words. Choose the correct meaning.</p>
          <label className="quizNameField">
            <span>Use a name to save quiz results and hard words on this browser.</span>
            <input value={userName} onChange={(event) => setUserName(event.target.value)} placeholder="Your name (optional)" />
          </label>
          <button type="button" className="primaryButton" onClick={startQuiz}>Start Quiz</button>
        </article>
      </section>
    );
  }

  if (status === 'result') {
    return (
      <section className="page quizPage">
        <article className="quizResultCard">
          <p className="eyebrow">Quiz complete</p>
          <h1>Quiz Result</h1>
          <div className="quizResultStats">
            <strong>{correctCount}/{totalQuestions}</strong>
            <span>{accuracy}% accuracy</span>
            <span>Correct: {correctCount}</span>
            <span>Wrong: {wrongCount}</span>
          </div>

          <section className="quizHardWords">
            <h2>Hard Words</h2>
            {sessionHardWords.length ? (
              <div className="quizHardWordList">
                {sessionHardWords.map((word) => (
                  <article key={word.no}>
                    <strong>{word.hanzi}</strong>
                    <span>{word.pinyin}</span>
                    <p>{word.meaning}</p>
                    <small>{word.example || 'No example available.'}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="emptyState">No hard words this time. Nice work.</p>
            )}
          </section>

          <div className="buttonBar quizResultActions">
            <button type="button" className="primaryButton" onClick={startQuiz}>New 10 Questions</button>
            <button type="button" onClick={() => navigate('/flashcards')}>Review Flashcards</button>
            <button type="button" onClick={() => exportResult({ userName: userName.trim(), score: correctCount, accuracy, hardWords: sessionHardWords })}>
              Export Result
            </button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="page quizPage">
      <article className="quizQuestionCard">
        <div className="quizTopline">
          <span>Question {currentIndex + 1}/{totalQuestions}</span>
          <span>Correct {correctCount}</span>
          <span>Wrong {wrongCount}</span>
        </div>
        <p className="quizScope">HSK 4 cumulative vocabulary: words 1-600</p>
        <h1>What does this word mean?</h1>

        <div className="quizPrompt">
          <strong>{currentQuestion?.word?.hanzi || 'Unknown'}</strong>
          <span>{currentQuestion?.word?.pinyin || 'No pinyin'}</span>
          <AudioButton hanzi={currentQuestion?.word?.hanzi} />
        </div>

        <div className="quizOptions">
          {(currentQuestion?.options || []).map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = currentQuestion.answer === option;
            return (
              <button
                type="button"
                key={option}
                disabled={Boolean(selectedAnswer)}
                className={[
                  selectedAnswer && isCorrect ? 'correct' : '',
                  selectedAnswer && isSelected && !isCorrect ? 'incorrect' : '',
                  isSelected ? 'selected' : ''
                ].join(' ')}
                onClick={() => chooseAnswer(option)}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selectedAnswer && (
          <div className={selectedAnswer === currentQuestion.answer ? 'quizFeedback correctText' : 'quizFeedback wrongText'}>
            {selectedAnswer === currentQuestion.answer ? 'Correct.' : `Wrong. Correct answer: ${currentQuestion.answer}`}
          </div>
        )}

        {selectedAnswer && currentIndex < totalQuestions - 1 && (
          <button type="button" className="primaryButton quizNextButton" onClick={nextQuestion}>Next</button>
        )}
      </article>
    </section>
  );
}
