import AudioButton from './AudioButton.jsx';
import { getExampleText, getPosText, getSensesText } from '../utils/quizUtils.js';

export default function VocabularyCard({ word, learned, onToggleLearned }) {
  return (
    <article className={`vocabCard ${learned ? 'isLearned' : ''}`}>
      <div className="vocabNumber">#{word.no}</div>
      <div>
        <h3>{word.hanzi}</h3>
        <p className="pinyin">{word.pinyin}</p>
      </div>
      <div>
        <span className="tag">{getPosText(word) || 'word'}</span>
        <p>{getSensesText(word)}</p>
        <p className="example">{getExampleText(word) || 'No example available.'}</p>
      </div>
      <div className="vocabActions">
        <AudioButton hanzi={word.hanzi} compact />
        <button type="button" className={learned ? 'secondaryButton active' : 'secondaryButton'} onClick={() => onToggleLearned(word.no)}>
          {learned ? 'Learned' : 'Mark learned'}
        </button>
      </div>
    </article>
  );
}
