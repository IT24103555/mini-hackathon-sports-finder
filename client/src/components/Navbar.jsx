function Navbar({ setView }) {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <h1>⚽ Sports Finder</h1>
      <div className="nav-buttons">
        <button type="button" onClick={() => setView('list')}>Home</button>
        <button type="button" onClick={() => setView('form')}>+ Create Game</button>
      </div>
    </nav>
  );
}

export default Navbar;
