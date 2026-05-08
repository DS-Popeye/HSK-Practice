import { Link } from 'react-router-dom';
import vocabData from '../data/hsk4_vocab.json';
import grammarData from '../data/grammar.json';
import ProgressCard from '../components/ProgressCard.jsx';
import { formatDate, readStorage, STORAGE_KEYS } from '../utils/storage.js';

const practiceCount = Math.min(600, vocabData.length);

export default function Dashboard() {
  const learnedWords = readStorage(STORAGE_KEYS.learnedWords, []);
  const quizHistory = readStorage(STORAGE_KEYS.quizHistory, []);
  const mockHistory = readStorage(STORAGE_KEYS.mockHistory, []);
  const grammarStudied = readStorage(STORAGE_KEYS.grammarStudied, []);
  const scores = [...quizHistory, ...mockHistory].map((item) => item.scorePercent).filter(Number.isFinite);
  const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const recent = [...quizHistory.map((item) => ({ ...item, type: 'Quiz' })), ...mockHistory.map((item) => ({ ...item, type: 'Mock Test' }))]
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
          <h1>Build steady vocabulary, grammar, and test confidence.</h1>
          <p>Everything here runs locally from your JSON and MP3 files, with progress saved in this browser.</p>
        </div>
      </div>

      <div className="statsGrid">
        <ProgressCard label="Total vocabulary" value={vocabData.length} detail="Imported from JSON" />
        <ProgressCard label="Practice words" value={practiceCount} detail="Used in drills" />
        <ProgressCard label="Learned words" value={learnedWords.length} detail={`${Math.round((learnedWords.length / vocabData.length) * 100) || 0}% complete`} />
        <ProgressCard label="Quiz attempts" value={quizHistory.length} />
        <ProgressCard label="Mock attempts" value={mockHistory.length} />
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
          <div className="meter"><span style={{ width: `${Math.min(100, (learnedWords.length / vocabData.length) * 100)}%` }} /></div>
          <p>{learnedWords.length} words learned and {grammarStudied.length} grammar points studied.</p>
        </section>
      </div>
    </section>
  );
}
