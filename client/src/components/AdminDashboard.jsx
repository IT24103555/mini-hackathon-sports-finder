import { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminDashboard({ session }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${apiUrl}/api/users`, { headers: { Authorization: `Bearer ${session.token}` } })
      .then(({ data }) => setUsers(data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load users.'));
  }, [session.token]);

  async function removeUser(id) {
    try {
      await axios.delete(`${apiUrl}/api/users/${id}`, { headers: { Authorization: `Bearer ${session.token}` } });
      setUsers((currentUsers) => currentUsers.filter((user) => user._id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove user.');
    }
  }

  return (
    <main className="page-shell admin-page">
      <p className="eyebrow">Administrator dashboard</p>
      <h1>Manage the community</h1>
      <p className="admin-intro">Review registered accounts and keep Sports Finder welcoming.</p>
      {error && <p className="status-message error-message">{error}</p>}
      <section className="user-list" aria-label="Registered users">
        {users.map((user) => <div className="user-row" key={user._id}><div><strong>{user.username}</strong><span>{user.role}</span></div>{user._id !== session.user.id && <button className="secondary-button" type="button" onClick={() => removeUser(user._id)}>Remove</button>}</div>)}
      </section>
    </main>
  );
}

export default AdminDashboard;