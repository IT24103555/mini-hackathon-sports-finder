import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const sportIcons = { Cricket: '🏏', Football: '⚽', Volleyball: '🏐' };

function formatGameTime(value) {
  if (!value) return 'Time to be announced';
  return new Intl.DateTimeFormat('en-LK', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(new Date(value));
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function EventTiming({ game }) {
  const [now, setNow] = useState(Date.now());
  const startTime = new Date(game.startTime || game.time).getTime();
  const deadlineTime = game.deadlineTime ? new Date(game.deadlineTime).getTime() : startTime;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (Number.isNaN(startTime) || Number.isNaN(deadlineTime)) return <div className="event-timing">Event time unavailable</div>;
  if (now >= startTime) return <div className="event-timing ongoing">Ongoing</div>;
  if (now >= deadlineTime) return <div className="event-timing closed">Registration Closed</div>;
  return <div className="event-timing"><strong>{formatCountdown(deadlineTime - now)}</strong><span>Registration closes</span></div>;
}

function RegisterButton({ deadlineTime }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const deadline = deadlineTime ? new Date(deadlineTime).getTime() : Number.NaN;
  return <button className="register-button" type="button" disabled={Number.isNaN(deadline) || now >= deadline}>Register</button>;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function GameList({ onCreate }) {
  const [sportFilter, setSportFilter] = useState('All sports');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      setError('');
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

  const filteredGames = useMemo(() => sportFilter === 'All sports'
    ? games
    : games.filter((game) => game.sport === sportFilter), [games, sportFilter]);

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Your next game is closer than you think</p>
          <h1>Find your people.<br /><span>Play your sport.</span></h1>
          <p className="hero-copy">Join relaxed, local games across Sri Lanka. No teams to form, no complicated sign-ups, just show up and play.</p>
          <button className="primary-button" onClick={onCreate}>Post a game <span aria-hidden="true">↗</span></button>
        </div>
        <div className="hero-stats" aria-label="Game statistics">
          <div><strong>{games.length}</strong><span>games nearby</span></div>
          <div><strong>3</strong><span>sports to choose</span></div>
        </div>
      </section>

      <section className="games-section" aria-labelledby="games-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Open invitations</p>
            <h2 id="games-heading">Games happening soon</h2>
          </div>
          <label className="filter-control">
            <span>Filter by sport</span>
            <select value={sportFilter} onChange={(event) => setSportFilter(event.target.value)}>
              <option>All sports</option>
              <option>Cricket</option>
              <option>Football</option>
              <option>Volleyball</option>
            </select>
          </label>
        </div>

        {loading && <p className="status-message">Finding games around Sri Lanka...</p>}
        {error && <p className="status-message error-message">{error}</p>}
        {!loading && !error && filteredGames.length === 0 && <p className="status-message">No games match that sport yet. Be the first to create one.</p>}
        <div className="game-grid">
          {filteredGames.map((game) => (
            <article className="game-card" key={game._id}>
              <div className={`sport-icon ${game.sport.toLowerCase()}`}>{sportIcons[game.sport]}</div>
              <div className="game-card-content">
                <div className="card-topline"><span>{game.sport}</span><span>{game.maxPlayers} spots</span></div>
                <h3>{game.title}</h3>
                <p className="game-detail"><span aria-hidden="true">⌖</span>{game.location}</p>
                <p className="game-detail"><span aria-hidden="true">◷</span>{formatGameTime(game.startTime || game.time)}</p>
                <EventTiming game={game} />
                <RegisterButton deadlineTime={game.deadlineTime} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default GameList;
