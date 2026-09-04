import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar.jsx';
import GameList from './components/GameList.jsx';
import GameForm from './components/GameForm.jsx';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [view, setView] = useState('list');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGames() {
      try {
        const { data } = await axios.get(`${apiUrl}/api/games`);
        setGames(data);
      } catch {
        setError('Games are taking a breather. Check that the backend is running and try again.');
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  function handleCreated(game) {
    setGames((currentGames) => [...currentGames, game].sort((first, second) => new Date(first.time) - new Date(second.time)));
    setView('list');
  }

  return (
    <div className="app">
      <Navbar view={view} onNavigate={setView} />
      {view === 'list'
        ? <GameList games={games} loading={loading} error={error} onCreate={() => setView('form')} />
        : <GameForm onCreated={handleCreated} onCancel={() => setView('list')} />}
      <footer>Made for the local game, wherever you are in Sri Lanka.</footer>
    </div>
  );
}

export default App;
