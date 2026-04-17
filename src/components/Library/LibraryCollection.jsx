// components/library/LibraryCollection.jsx

import starIcon from '../../assets/star.png';
import moreIcon from '../../assets/more_vert.png';

export default function LibraryCollection({ games, viewMode, activeTab, setActiveTab, onSelect, getImgUrl }) {
  return (
    <section className="collection-section">
      <div className="library-tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>Усі ігри</button>
        <button className={activeTab === "favorite" ? "active" : ""} onClick={() => setActiveTab("favorite")}>Обране</button>
        <button className={activeTab === "collection" ? "active" : ""} onClick={() => setActiveTab("collection")}>Моя колекція</button>
      </div>

      {games.length === 0 ? (
        <p className="empty-text">Ігор не знайдено</p>
      ) : viewMode === "grid" ? (
        <div className="library-games-grid">
          {games.map(game => (
            <div key={game.id} className="library-grid-card" onClick={() => onSelect(game)}>
              <img
                src={getImgUrl(game.photo)}
                alt={game.name}
                onError={e => { e.target.src = '/no-image.png'; }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="library-games-list">
          {games.map(game => (
            <div key={game.id} className="library-list-row" onClick={() => onSelect(game)}>
              <img
                src={getImgUrl(game.photo)}
                alt={game.name}
                className="list-row-img"
                onError={e => { e.target.src = '/no-image.png'; }}
              />
              <div className="list-row-info">
                <span className="list-row-title">{game.name}</span>
                <button className="btn-primary small" onClick={e => e.stopPropagation()}>Скачати</button>
              </div>
              <div className="list-row-meta">
                <span className="label">Розмір на диску</span>
                <span className="value">10 ГБ</span>
              </div>
              <div className="list-row-actions">
                <button className="icon-btn-circle transparent"><img src={starIcon} alt="star" /></button>
                <button className="icon-btn-circle transparent"><img src={moreIcon} alt="more" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
