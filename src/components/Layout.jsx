import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="appShell">
      <Navbar />
      <main className="pageShell">
        <Outlet />
      </main>
    </div>
  );
}
