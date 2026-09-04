import { useState } from 'react';
import axios from 'axios';

const initialForm = { title: '', sport: 'Cricket', location: '', time: '', maxPlayers: '' };
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function GameForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Give your game a title.';
    if (!form.sport) nextErrors.sport = 'Choose a sport.';
    if (!form.location.trim()) nextErrors.location = 'Add where you will play.';
    if (!form.time) nextErrors.time = 'Choose a date and time.';
    if (!form.maxPlayers) nextErrors.maxPlayers = 'Tell players how many spots are available.';
    else if (!Number.isInteger(Number(form.maxPlayers)) || Number(form.maxPlayers) < 2) nextErrors.maxPlayers = 'Enter a whole number of at least 2 players.';
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    setSubmitError('');
    try {
      const { data } = await axios.post(`${apiUrl}/api/games`, { ...form, maxPlayers: Number(form.maxPlayers) });
      setForm(initialForm);
      setErrors({});
      onCreated(data);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'We could not post your game. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell form-page">
      <div className="form-intro">
        <p className="eyebrow">Bring the team together</p>
        <h1>Create a game</h1>
        <p>Share a casual match and invite players in your area. Keep it simple, keep it local.</p>
      </div>
      <form className="game-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <label>Game title<input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Sunday morning cricket" />{errors.title && <small>{errors.title}</small>}</label>
          <label>Sport<select name="sport" value={form.sport} onChange={handleChange}><option>Cricket</option><option>Football</option><option>Volleyball</option></select>{errors.sport && <small>{errors.sport}</small>}</label>
        </div>
        <label>Location<input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Viharamahadevi Park, Colombo" />{errors.location && <small>{errors.location}</small>}</label>
        <div className="form-row">
          <label>Date and time<input type="datetime-local" name="time" value={form.time} onChange={handleChange} />{errors.time && <small>{errors.time}</small>}</label>
          <label>Maximum players<input type="number" name="maxPlayers" value={form.maxPlayers} onChange={handleChange} min="2" placeholder="10" />{errors.maxPlayers && <small>{errors.maxPlayers}</small>}</label>
        </div>
        {submitError && <p className="form-submit-error">{submitError}</p>}
        <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Posting...' : 'Post game ↗'}</button></div>
      </form>
    </main>
  );
}

export default GameForm;
