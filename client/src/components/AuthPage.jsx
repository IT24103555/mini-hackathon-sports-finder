import { useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AuthPage({ mode, onAuthenticated, onNavigate }) {
  const isRegister = mode === 'register';
  const isAdmin = mode === 'admin-login';
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate(values) {
    const nextErrors = {};
    const username = values.username.trim();
    if (!username) nextErrors.username = 'Username is required.';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) nextErrors.username = 'Use only letters, numbers, or underscores.';
    else if (username.length < 3) nextErrors.username = 'Username must be at least 3 characters.';
    else if (username.length > 30) nextErrors.username = 'Username must be at most 30 characters.';
    if (!values.password) nextErrors.password = 'Password is required.';
    else if (values.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    else if (values.password.length > 128) nextErrors.password = 'Password must be at most 128 characters.';
    if (isRegister && values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    return nextErrors;
  }

  function handleChange(event) {
    const nextForm = { ...form, [event.target.name]: event.target.value };
    setForm(nextForm);
    setFieldErrors(validate(nextForm));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : isAdmin ? '/api/auth/admin/login' : '/api/auth/login';
      const payload = isRegister ? form : { username: form.username, password: form.password };
      const { data } = await axios.post(`${apiUrl}${endpoint}`, payload);
      onAuthenticated(data);
    } catch (requestError) {
      setFieldErrors(requestError.response?.data?.errors || {});
      setError(requestError.response?.data?.message || 'Unable to complete that request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-page">
      <div className="form-intro">
        <p className="eyebrow">{isAdmin ? 'Restricted area' : isRegister ? 'Join the community' : 'Welcome back'}</p>
        <h1>{isAdmin ? 'Admin login' : isRegister ? 'Create your account' : 'Log in'}</h1>
        <p>{isAdmin ? 'Use an administrator account to manage the Sports Finder community.' : isRegister ? 'Create a username to post and manage your games.' : 'Log in to create games and keep your sports plans moving.'}</p>
      </div>
      <form className="game-form auth-form" onSubmit={handleSubmit} noValidate>
        <label>Username<input name="username" value={form.username} onChange={handleChange} autoComplete="username" required />{fieldErrors.username && <small>{fieldErrors.username}</small>}</label>
        <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} autoComplete={isRegister ? 'new-password' : 'current-password'} required />{fieldErrors.password && <small>{fieldErrors.password}</small>}</label>
        {isRegister && <label>Confirm password<input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" required />{fieldErrors.confirmPassword && <small>{fieldErrors.confirmPassword}</small>}</label>}
        {error && <p className="form-submit-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}</button>
      </form>
      {!isAdmin && <div className="auth-links">
        {!isRegister && <button type="button" onClick={() => onNavigate('register')}>Need an account? Register</button>}
        {isRegister && <button type="button" onClick={() => onNavigate('login')}>Already registered? Log in</button>}
        <button type="button" onClick={() => onNavigate('admin-login')}>Administrator login</button>
      </div>}
    </main>
  );
}

export default AuthPage;