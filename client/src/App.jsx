import { useState } from 'react';
import GameList from './components/GameList.jsx';
import GameForm from './components/GameForm.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [view, setView] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleGameAdded() {
    setView('list');
    setRefreshKey((currentKey) => currentKey + 1);
  }

  return (
    <div className="app-container">
      <Navbar setView={setView} />
      <main>
        {view === 'list' && <GameList key={refreshKey} onCreate={() => setView('form')} />}
        {view === 'form' && <GameForm onGameAdded={handleGameAdded} onCancel={() => setView('list')} />}
      </main>
    </div>
  );
}

// Deployment: replace http://localhost:5000 with the live Render URL in Member 2
// and Member 3's axios calls before deploying the client.
// Run npm run build in /client, then deploy the dist/ folder to Vercel or Netlify.
export default App;
