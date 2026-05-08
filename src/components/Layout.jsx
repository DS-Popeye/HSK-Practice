import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LoginScreen from './LoginScreen.jsx';
import Navbar from './Navbar.jsx';
import { getCurrentUser, logoutCurrentUser } from '../utils/storage.js';

export default function Layout() {
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());

  function clearCurrentUser() {
    logoutCurrentUser();
    setCurrentUserState(null);
  }

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUserState} />;
  }

  return (
    <div className="appShell">
      <Navbar currentUser={currentUser} onLogout={clearCurrentUser} onSwitchUser={clearCurrentUser} />
      <main className="pageShell">
        <Outlet />
      </main>
    </div>
  );
}
