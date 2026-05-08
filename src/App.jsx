import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vocabulary from './pages/Vocabulary.jsx';
import Flashcards from './pages/Flashcards.jsx';
import Quiz from './pages/Quiz.jsx';
import Grammar from './pages/Grammar.jsx';
import MockTest from './pages/MockTest.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/mock-test" element={<MockTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
