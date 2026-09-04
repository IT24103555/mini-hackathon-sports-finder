function Navbar({ setView, session, onLogout }) {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <h1>⚽ Sports Finder</h1>
      <div className="nav-buttons">
        <button type="button" onClick={() => setView('list')}>Home</button>
        {session?.user.role === 'admin' ? <button type="button" onClick={() => setView('admin')}>Admin dashboard</button> : session ? <button type="button" onClick={() => setView('form')}>+ Create game</button> : <><button type="button" onClick={() => setView('login')}>Login</button><button type="button" onClick={() => setView('admin-login')}>Admin login</button><button type="button" onClick={() => setView('register')}>Register</button></>}
        {session && <button type="button" onClick={onLogout}>Log out</button>}
      </div>
    </nav>
  );
}

export default Navbar;
