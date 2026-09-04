function NavButton({ active, children, onClick }) {
  return <button className={active ? 'active' : ''} type="button" aria-current={active ? 'page' : undefined} onClick={onClick}>{children}</button>;
}

function Navbar({ setView, view, session, onLogout }) {
  const isAdmin = session?.user.role === 'admin';

  return (
    <nav className="navbar" aria-label="Main navigation">
      <h1>⚽ Sports Finder</h1>
      <div className="nav-buttons">
        <NavButton active={view === 'list'} onClick={() => setView('list')}>Home</NavButton>
        {isAdmin && <NavButton active={view === 'admin'} onClick={() => setView('admin')}>Admin dashboard</NavButton>}
        {session && !isAdmin && <NavButton active={view === 'form'} onClick={() => setView('form')}>+ Create game</NavButton>}
        {!session && <>
          <NavButton active={view === 'login'} onClick={() => setView('login')}>Login</NavButton>
          <NavButton active={view === 'admin-login'} onClick={() => setView('admin-login')}>Admin login</NavButton>
          <NavButton active={view === 'register'} onClick={() => setView('register')}>Register</NavButton>
        </>}
        {session && <button type="button" onClick={onLogout}>Logout</button>}
      </div>
    </nav>
  );
}

export default Navbar;
