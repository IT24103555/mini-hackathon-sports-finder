import { useState } from 'react';
import axios from 'axios';

const initialForm = { title: '', sport: 'Cricket', location: '', time: '', maxPlayers: '' };
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const maxTitleLength = 80;
const maxLocationLength = 120;

function getMinimumDateTime() {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

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
    const title = form.title.trim();
    const location = form.location.trim();
    const selectedTime = form.time ? new Date(form.time) : null;
    if (!title) nextErrors.title = 'Give your game a title.';
    else if (title.length < 3) nextErrors.title = 'Title must be at least 3 characters.';
    else if (title.length > maxTitleLength) nextErrors.title = `Title cannot exceed ${maxTitleLength} characters.`;
    if (!form.sport) nextErrors.sport = 'Choose a sport.';
    if (!location) nextErrors.location = 'Add where you will play.';
    else if (location.length < 3) nextErrors.location = 'Location must be at least 3 characters.';
    else if (location.length > maxLocationLength) nextErrors.location = `Location cannot exceed ${maxLocationLength} characters.`;
    if (!form.time) nextErrors.time = 'Choose a date and time.';
    else if (Number.isNaN(selectedTime.getTime())) nextErrors.time = 'Choose a valid date and time.';
    else if (selectedTime <= new Date()) nextErrors.time = 'Game time must be in the future.';
    if (!form.maxPlayers) nextErrors.maxPlayers = 'Tell players how many spots are available.';
    else if (!Number.isInteger(Number(form.maxPlayers)) || Number(form.maxPlayers) < 2 || Number(form.maxPlayers) > 50) nextErrors.maxPlayers = 'Enter a whole number from 2 to 50.';
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
      const { data } = await axios.post(`${apiUrl}/api/games`, { ...form, title: form.title.trim(), location: form.location.trim(), maxPlayers: Number(form.maxPlayers) });
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
          <label>Game title<input name="title" value={form.title} onChange={handleChange} maxLength={maxTitleLength} required placeholder="e.g. Sunday morning cricket" />{errors.title && <small>{errors.title}</small>}</label>
          <label>Sport<select name="sport" value={form.sport} onChange={handleChange}><option>Cricket</option><option>Football</option><option>Volleyball</option></select>{errors.sport && <small>{errors.sport}</small>}</label>
        </div>
        <label>Location<input name="location" value={form.location} onChange={handleChange} maxLength={maxLocationLength} required placeholder="e.g. Viharamahadevi Park, Colombo" />{errors.location && <small>{errors.location}</small>}</label>
        <div className="form-row">
          <label>Date and time<input type="datetime-local" name="time" value={form.time} min={getMinimumDateTime()} onChange={handleChange} required />{errors.time && <small>{errors.time}</small>}</label>
          <label>Maximum players<input type="number" name="maxPlayers" value={form.maxPlayers} onChange={handleChange} min="2" max="50" step="1" required placeholder="10" />{errors.maxPlayers && <small>{errors.maxPlayers}</small>}</label>
        </div>
        {submitError && <p className="form-submit-error">{submitError}</p>}
        <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Posting...' : 'Post game ↗'}</button></div>
      </form>
    </main>
  );
}

export default GameForm;
