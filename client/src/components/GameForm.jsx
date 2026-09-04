import { useState } from 'react';
import axios from 'axios';

function GameForm({ onGameAdded }) {
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Cricket');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const newErrors = {};

    if (!title) newErrors.title = 'Game title is required.';
    if (!location) newErrors.location = 'Location is required.';
    if (!time) newErrors.time = 'Time is required.';
    if (!maxPlayers || parseInt(maxPlayers, 10) < 1) {
      newErrors.maxPlayers = 'Must have at least 1 player.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/games', {
        title,
        sport,
        location,
        time,
        maxPlayers: parseInt(maxPlayers, 10),
      });

      setTitle('');
      setSport('Cricket');
      setLocation('');
      setTime('');
      setMaxPlayers('');
      setErrors({});
      setSubmitting(false);
      onGameAdded();
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        form: error.response?.data?.message || 'Failed to create game. Please try again.',
      }));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {errors.form && <p className="error-msg">{errors.form}</p>}

      <label>
        Game title
        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
        {errors.title && <span className="error-msg">{errors.title}</span>}
      </label>

      <label>
        Sport
        <select value={sport} onChange={(event) => setSport(event.target.value)}>
          <option value="Cricket">Cricket</option>
          <option value="Football">Football</option>
          <option value="Volleyball">Volleyball</option>
        </select>
      </label>

      <label>
        Location
        <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} />
        {errors.location && <span className="error-msg">{errors.location}</span>}
      </label>

      <label>
        Time
        <input type="text" value={time} onChange={(event) => setTime(event.target.value)} />
        {errors.time && <span className="error-msg">{errors.time}</span>}
      </label>

      <label>
        Maximum players
        <input type="number" value={maxPlayers} onChange={(event) => setMaxPlayers(event.target.value)} />
        {errors.maxPlayers && <span className="error-msg">{errors.maxPlayers}</span>}
      </label>

      <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Create Game'}</button>
    </form>
  );
}

export default GameForm;
