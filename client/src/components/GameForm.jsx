import { useState } from 'react';
import axios from 'axios';

const initialForm = { title: '', sport: 'Cricket', location: '', startTime: '', deadlineTime: '', maxPlayers: '' };
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function GameForm({ token, onGameAdded, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  function validate(values) {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Give your game a title.';
    if (!values.sport) nextErrors.sport = 'Choose a sport.';
    if (!values.location.trim()) nextErrors.location = 'Add where you will play.';
    if (!values.startTime) nextErrors.startTime = 'Choose when the game starts.';
    if (!values.deadlineTime) nextErrors.deadlineTime = 'Choose the registration deadline.';
    if (values.startTime && new Date(values.startTime) <= new Date()) nextErrors.startTime = 'Start time must be in the future.';
    if (values.deadlineTime && new Date(values.deadlineTime) <= new Date()) nextErrors.deadlineTime = 'Deadline cannot be in the past.';
    if (values.startTime && values.deadlineTime && new Date(values.deadlineTime) >= new Date(values.startTime)) {
      nextErrors.deadlineTime = 'Deadline must be earlier than the start time.';
    }
    if (!values.maxPlayers) nextErrors.maxPlayers = 'Tell players how many spots are available.';
    else if (!Number.isInteger(Number(values.maxPlayers)) || Number(values.maxPlayers) < 2 || Number(values.maxPlayers) > 100) nextErrors.maxPlayers = 'Enter a whole number from 2 to 100.';
    return nextErrors;
  }

  function handleChange(event) {
    const nextForm = { ...form, [event.target.name]: event.target.value };
    setForm(nextForm);
    setErrors(validate(nextForm));
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    setSubmitError('');
    try {
      const { data } = await axios.post(`${apiUrl}/api/games`, { ...form, maxPlayers: Number(form.maxPlayers) }, { headers: { Authorization: `Bearer ${token}` } });
      setForm(initialForm);
      setErrors({});
      onGameAdded(data);
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
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
          <label>Start date and time<input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} />{errors.startTime && <small>{errors.startTime}</small>}</label>
          <label>Registration deadline<input type="datetime-local" name="deadlineTime" value={form.deadlineTime} onChange={handleChange} />{errors.deadlineTime && <small>{errors.deadlineTime}</small>}</label>
        </div>
        <div className="form-row">
          <label>Maximum players<input type="number" name="maxPlayers" value={form.maxPlayers} onChange={handleChange} min="2" placeholder="10" />{errors.maxPlayers && <small>{errors.maxPlayers}</small>}</label>
        </div>
        {submitError && <p className="form-submit-error">{submitError}</p>}
        <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Posting...' : 'Post game ↗'}</button></div>
      </form>
    </main>
  );
}

export default GameForm;
