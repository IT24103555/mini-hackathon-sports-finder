import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard.jsx';
import AuthPage from './components/AuthPage.jsx';
import GameList from './components/GameList.jsx';
import GameForm from './components/GameForm.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [view, setView] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('sports-finder-session') || 'null'));

  function handleAuthenticated(nextSession) {
    localStorage.setItem('sports-finder-session', JSON.stringify(nextSession));
    setSession(nextSession);
    setView(nextSession.user.role === 'admin' ? 'admin' : 'list');
  }

  function handleLogout() {
    localStorage.removeItem('sports-finder-session');
    setSession(null);
    setView('list');
  }

  function handleGameAdded() {
    setView('list');
    setRefreshKey((currentKey) => currentKey + 1);
  }

  return (
    <div className="app-container">
      <Navbar setView={setView} session={session} onLogout={handleLogout} />
      <main>
        {view === 'list' && <GameList key={refreshKey} session={session} onLogin={() => setView('login')} onCreate={() => session ? setView('form') : setView('login')} />}
        {view === 'form' && session && <GameForm token={session.token} onGameAdded={handleGameAdded} onCancel={() => setView('list')} />}
        {view === 'login' && <AuthPage mode="login" onAuthenticated={handleAuthenticated} onNavigate={setView} />}
        {view === 'admin-login' && <AuthPage mode="admin-login" onAuthenticated={handleAuthenticated} onNavigate={setView} />}
        {view === 'register' && <AuthPage mode="register" onAuthenticated={handleAuthenticated} onNavigate={setView} />}
        {view === 'admin' && session?.user.role === 'admin' && <AdminDashboard session={session} />}
      </main>
    </div>
  );
}

// Deployment: replace http://localhost:5000 with the live Render URL in Member 2
// and Member 3's axios calls before deploying the client.
// Run npm run build in /client, then deploy the dist/ folder to Vercel or Netlify.
export default App;
