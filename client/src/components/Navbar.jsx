function Navbar({ view, onNavigate }) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={() => onNavigate('list')} aria-label="Go to home">
          <span className="brand-mark">SF</span>
          <span>Sports Finder</span>
        </button>
        <nav aria-label="Main navigation">
          <button className={view === 'list' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('list')}>
            Explore games
          </button>
          <button className={view === 'form' ? 'nav-link active' : 'nav-link'} onClick={() => onNavigate('form')}>
            Create a game
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
