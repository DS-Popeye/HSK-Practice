import { useState } from 'react';
import { setCurrentUser } from '../utils/storage.js';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const user = setCurrentUser(username);
      onLogin(user);
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <main className="loginPage">
      <form className="loginCard" onSubmit={handleSubmit}>
        <p className="eyebrow">HSK learner session</p>
        <h1>HSK Practice Login</h1>
        <p>Enter your name to continue your personal progress on this browser.</p>
        <label>
          <span>Username</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your name" autoFocus />
        </label>
        {error && <p className="loginError">{error}</p>}
        <button type="submit" className="primaryButton">Continue</button>
        <small>No password is required. Progress is saved only on this browser.</small>
      </form>
    </main>
  );
}
