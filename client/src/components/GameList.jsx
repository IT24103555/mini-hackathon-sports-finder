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
  const [now, setNow] = useState(() => new Date().getTime());
  const startTime = game.startTime ? new Date(game.startTime).getTime() : Number.NaN;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (Number.isNaN(startTime)) return <div className="event-timing"><span className="status-dot" />Event time unavailable</div>;
  const timeLeft = startTime - now;
  if (timeLeft <= 0) return <div className="event-timing closed"><span className="status-dot" />Event started</div>;
  return <div className="event-timing"><strong>{formatCountdown(timeLeft)}</strong><span>Event starts</span></div>;
}

function JoinGameButton({ game, session, onLogin, onJoined }) {
  const [now, setNow] = useState(() => new Date().getTime());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startTime = game.startTime ? new Date(game.startTime).getTime() : Number.NaN;
  const registrationCount = game.registeredPlayers?.length || 0;
  const isRegistered = Boolean(session?.user.id && game.registeredPlayers?.some((player) => String(player) === String(session.user.id)));
  const timeLeft = startTime - now;
  const isOpen = !Number.isNaN(startTime) && timeLeft > 0;
  const isStarted = !Number.isNaN(startTime) && timeLeft <= 0;
  const isUnavailable = Number.isNaN(startTime);
  const isFull = registrationCount >= game.maxPlayers;

  async function handleJoinGame() {
    if (!session) {
      onLogin();
      return;
    }
    if (isRegistered) return;
    setSubmitting(true);
    setMessage('');
    try {
      const { data } = await axios.post(`${apiUrl}/api/games/${game._id}/register`, {}, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      setMessage(data.message);
      onJoined();
    } catch (error) {
      if (error.response?.status === 401) onLogin();
      else setMessage(error.response?.data?.message || 'Unable to join this game right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    {isStarted ? <span className="register-button status-badge" role="status">Event started</span> : isUnavailable ? <span className="register-button status-badge" role="status">Event time unavailable</span> : <button className="register-button" type="button" onClick={handleJoinGame} disabled={submitting || isRegistered || isFull}>
      {submitting ? 'Joining...' : isRegistered ? 'Joined' : isFull ? 'Game full' : isOpen ? 'Join Game' : 'Event time unavailable'}
    </button>}
    {message && <small className="registration-message" role="status">{message}</small>}
  </>;
}

const apiUrl = import.meta.env.VITE_API_URL || 'https://mini-hackathon-sports-finder-production.up.railway.app';

function GameList({ onCreate, session, onLogin }) {
  const [sportFilter, setSportFilter] = useState('All sports');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function handleJoined(gameId) {
    setGames((currentGames) => currentGames.map((game) => game._id === gameId ? {
      ...game,
      registeredPlayers: [...(game.registeredPlayers || []), session.user.id]
    } : game));
  }

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
          <div className="filter-control">
            <span>Filter by sport</span>
            <div className="sport-filters" role="group" aria-label="Filter games by sport">
              {['All sports', 'Cricket', 'Football', 'Volleyball'].map((sport) => (
                <button
                  className={sportFilter === sport ? 'filter-pill active' : 'filter-pill'}
                  type="button"
                  aria-pressed={sportFilter === sport}
                  key={sport}
                  onClick={() => setSportFilter(sport)}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
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
                <p className="game-detail"><span aria-hidden="true">◷</span>{formatGameTime(game.startTime)}</p>
                <EventTiming game={game} />
                <JoinGameButton
                  game={game}
                  session={session}
                  onLogin={onLogin}
                  onJoined={() => handleJoined(game._id)}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default GameList;
