import { NavLink } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'],
  ['/vocabulary', 'Vocabulary'],
  ['/flashcards', 'Flashcards'],
  ['/quiz', 'Quiz'],
  ['/grammar', 'Grammar'],
  ['/mock-test', 'HSK Mock']
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">
        <span>汉</span>
        <div>
          <strong>HSK Practice</strong>
          <small>Level 4 preparation</small>
        </div>
      </div>
      <div className="navLinks">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
