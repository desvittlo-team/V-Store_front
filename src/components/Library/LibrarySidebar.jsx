// components/library/LibrarySidebar.jsx

import filterIcon from '../../assets/filter.png';

export default function LibrarySidebar({ games, selectedGame, onSelect, getImgUrl }) {
  return (
    <aside className="library-sidebar">
      <div className="sidebar-header">
        <span>Усі ігри</span>
        <img src={filterIcon} alt="filter" className="icon-sm" />
      </div>
      <div className="sidebar-games-list">
        {games.map(game => (
          <div
            key={game.id}
            className={`sidebar-game-item ${selectedGame?.id === game.id ? 'active' : ''}`}
            onClick={() => onSelect(game)}
          >
            <img
              src={getImgUrl(game.photo)}
              alt={game.name}
              className="sidebar-game-icon"
              onError={e => { e.target.src = '/no-image.png'; }}
            />
            <span className="sidebar-game-name">{game.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
