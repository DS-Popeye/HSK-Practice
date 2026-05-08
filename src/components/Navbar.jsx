import { NavLink } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'],
  ['/vocabulary', 'Vocabulary'],
  ['/flashcards', 'Flashcards'],
  ['/quiz', 'Quiz'],
  ['/grammar', 'Grammar'],
  ['/mock-test', 'HSK Mock']
];

export default function Navbar({ currentUser, onLogout, onSwitchUser }) {
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
      <div className="userArea">
        <span>{currentUser?.displayName}</span>
        <button type="button" onClick={onSwitchUser}>Switch User</button>
        <button type="button" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
