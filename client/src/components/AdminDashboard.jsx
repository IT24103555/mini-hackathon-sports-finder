import { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://mini-hackathon-sports-finder-production.up.railway.app';

function AdminDashboard({ session }) {
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const headers = { Authorization: `Bearer ${session.token}` };

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/api/users`, { headers }),
      axios.get(`${apiUrl}/api/games/moderation`, { headers })
    ])
      .then(([userResponse, gameResponse]) => {
        setUsers(userResponse.data);
        setGames(gameResponse.data);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load administrator data.'));
  }, [session.token]);

  async function removeUser(id) {
    if (!window.confirm('Remove this user account?')) return;
    try {
      await axios.delete(`${apiUrl}/api/users/${id}`, { headers });
      setUsers((currentUsers) => currentUsers.filter((user) => user._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove user.');
    }
  }

  async function updateRole(id, role) {
    try {
      const { data } = await axios.patch(`${apiUrl}/api/users/${id}/role`, { role }, { headers });
      setUsers((currentUsers) => currentUsers.map((user) => user._id === id ? data : user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update user role.');
    }
  }

  async function updateGameStatus(id, status) {
    try {
      const { data } = await axios.patch(`${apiUrl}/api/games/${id}/status`, { status }, { headers });
      setGames((currentGames) => currentGames.map((game) => game._id === id ? { ...game, ...data } : game));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update game status.');
    }
  }

  async function removeGame(id) {
    if (!window.confirm('Delete this sports event permanently?')) return;
    try {
      await axios.delete(`${apiUrl}/api/games/${id}`, { headers });
      setGames((currentGames) => currentGames.filter((game) => game._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete game.');
    }
  }

  return (
    <main className="page-shell admin-page">
      <p className="eyebrow">Administrator dashboard</p>
      <h1>Manage the community</h1>
      <p className="admin-intro">Review accounts and approve the games that appear in the public feed.</p>
      {error && <p className="status-message error-message">{error}</p>}
      <section className="admin-section" aria-labelledby="users-heading">
        <h2 id="users-heading">Users</h2>
        <div className="user-list">
          {users.map((user) => {
            const isRootAdmin = user.username === 'admin123';
            return <div className="user-row" key={user._id}>
              <div><strong>{user.username}</strong><span>{isRootAdmin ? 'Root administrator' : user.role}</span></div>
              {!isRootAdmin && user._id !== session.user.id && <div className="row-actions">
                <select aria-label={`Role for ${user.username}`} value={user.role} onChange={(event) => updateRole(user._id, event.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="secondary-button" type="button" onClick={() => removeUser(user._id)}>Remove</button>
              </div>}
            </div>;
          })}
        </div>
      </section>
      <section className="admin-section" aria-labelledby="games-heading">
        <h2 id="games-heading">Sports events</h2>
        <div className="moderation-list">
          {games.map((game) => <div className="moderation-row" key={game._id}>
            <div><strong>{game.title}</strong><span>{game.sport} · {game.createdBy?.username || 'Legacy event'}</span></div>
            <div className="row-actions">
              <span className={`status-badge ${game.status}`}>{game.status}</span>
              {game.status !== 'approved' && <button className="primary-button" type="button" onClick={() => updateGameStatus(game._id, 'approved')}>Approve</button>}
              {game.status !== 'rejected' && <button className="secondary-button" type="button" onClick={() => updateGameStatus(game._id, 'rejected')}>Reject</button>}
              {game.status !== 'pending' && <button className="secondary-button" type="button" onClick={() => updateGameStatus(game._id, 'pending')}>Pending</button>}
              <button className="secondary-button" type="button" onClick={() => removeGame(game._id)}>Delete</button>
            </div>
          </div>)}
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;