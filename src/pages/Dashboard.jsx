import { Link } from 'react-router-dom';
import vocabData from '../data/hsk4_vocab.json';
import grammarData from '../data/grammar.json';
import ProgressCard from '../components/ProgressCard.jsx';
import { formatDate, getCurrentUser, getUserData, STORAGE_KEYS } from '../utils/storage.js';

const practiceCount = Math.min(600, vocabData.length);

export default function Dashboard() {
  const currentUser = getCurrentUser();
  const learnedWords = getUserData(STORAGE_KEYS.learnedWords, []);
  const quizHistory = getUserData(STORAGE_KEYS.quizHistory, []);
  const mockHistory = getUserData(STORAGE_KEYS.mockHistory, []);
  const grammarStudied = getUserData(STORAGE_KEYS.grammarStudied, []);
  const hardWords = getUserData(STORAGE_KEYS.quizHardWords, []);
  const safeLearnedWords = Array.isArray(learnedWords) ? learnedWords : [];
  const safeQuizHistory = Array.isArray(quizHistory) ? quizHistory : [];
  const safeMockHistory = Array.isArray(mockHistory) ? mockHistory : [];
  const safeGrammarStudied = Array.isArray(grammarStudied) ? grammarStudied : [];
  const safeHardWords = Array.isArray(hardWords) ? hardWords : [];
  const scores = [...safeQuizHistory, ...safeMockHistory].map((item) => item.scorePercent).filter(Number.isFinite);
  const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const recent = [...safeQuizHistory.map((item) => ({ ...item, type: 'Quiz' })), ...safeMockHistory.map((item) => ({ ...item, type: 'Mock Test' }))]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const actions = [
    ['Vocabulary', '/vocabulary', 'Search, listen, and mark words as learned.'],
    ['Flashcards', '/flashcards', 'Practice recognition with the first 600 words.'],
    ['Quiz', '/quiz', 'Take a 20-question mixed vocabulary quiz.'],
    ['Grammar', '/grammar', `${grammarData.length} grammar points for HSK review.`],
    ['HSK Mock Test', '/mock-test', '60 timed questions across vocabulary and grammar.']
  ];

  return (
    <section className="page">
      <div className="heroBand">
        <div>
          <p className="eyebrow">HSK 4 study desk</p>
          <p className="welcomeLine">Welcome, {currentUser?.displayName}</p>
          <h1>Build steady vocabulary, grammar, and test confidence.</h1>
          <p>Everything here runs locally from your JSON and MP3 files, with progress saved in this browser.</p>
        </div>
      </div>

      <div className="statsGrid">
        <ProgressCard label="Total vocabulary" value={vocabData.length} detail="Imported from JSON" />
        <ProgressCard label="Practice words" value={practiceCount} detail="Used in drills" />
        <ProgressCard label="Learned words" value={safeLearnedWords.length} detail={`${Math.round((safeLearnedWords.length / vocabData.length) * 100) || 0}% complete`} />
        <ProgressCard label="Quiz attempts" value={safeQuizHistory.length} />
        <ProgressCard label="Mock attempts" value={safeMockHistory.length} />
        <ProgressCard label="Average score" value={`${averageScore}%`} />
      </div>

      <div className="actionGrid">
        {actions.map(([title, to, text]) => (
          <Link className="actionCard" key={to} to={to}>
            <strong>{title}</strong>
            <span>{text}</span>
          </Link>
        ))}
      </div>

      <div className="twoColumn">
        <section className="panel">
          <h2>Recent progress</h2>
          {recent.length ? (
            <div className="historyList">
              {recent.map((item) => (
                <div key={`${item.type}-${item.date}`}>
                  <strong>{item.type}</strong>
                  <span>{item.score}/{item.total} ({item.scorePercent}%)</span>
                  <small>{formatDate(item.date)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="emptyState">No attempts yet. Start with a short quiz or a flashcard session.</p>
          )}
        </section>
        <section className="panel">
          <h2>Study coverage</h2>
          <div className="meter"><span style={{ width: `${Math.min(100, (safeLearnedWords.length / vocabData.length) * 100)}%` }} /></div>
          <p>{safeLearnedWords.length} words learned, {safeGrammarStudied.length} grammar points studied, and {safeHardWords.length} hard words saved.</p>
        </section>
      </div>
    </section>
  );
}
