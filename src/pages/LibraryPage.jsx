import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import searchIcon from '../assets/search.png';
import filterIcon from '../assets/filter.png';
import gridIcon from '../assets/grid_view.png';
import listIcon from '../assets/list_view.png';
import starIcon from '../assets/star.png';
import moreIcon from '../assets/more_vert.png';

export default function LibraryPage({ user }) {
  const navigate = useNavigate();
  
  const [games, setGames] = useState([]);
  const [community, setCommunity] = useState([]);
  const [news, setNews] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${user.token}` };

    // 1. Отримуємо куплені ігри
    fetch("https://localhost:7059/api/library", { headers })
      .then(res => res.ok ? res.json() : [])
      .then(setGames)
      .catch(console.error);

    // 2. Отримуємо скріншоти (для блоку Спільноти)
    fetch("https://localhost:7059/api/screenshots", { headers })
      .then(res => res.ok ? res.json() : [])
      .then(setCommunity)
      .catch(console.error);

    // 3. Отримуємо глобальний чат (для блоку Новин)
    fetch("https://localhost:7059/api/globalchat", { headers })
      .then(res => res.ok ? res.json() : [])
      .then(setNews)
      .catch(console.error);

    // 4. Отримуємо всіх користувачів (для блоку Друзів)
    fetch("https://localhost:7059/api/users", { headers })
      .then(res => res.ok ? res.json() : [])
      .then(setUsersList)
      .catch(console.error);

  }, [user, navigate]);

  if (!user) return null;

  const filteredGames = games.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getImgUrl = (photo) => {
    if (!photo) return '/no-image.png';
    return `https://localhost:7059/images/${photo}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <div className="library-layout">
      <aside className="library-sidebar">
        <div className="sidebar-header">
          <span>Усі ігри</span>
          <img src={filterIcon} alt="filter" className="icon-sm" />
        </div>
        <div className="sidebar-games-list">
          {filteredGames.map(game => (
            <div 
              key={game.id} 
              className={`sidebar-game-item ${selectedGame?.id === game.id ? 'active' : ''}`}
              onClick={() => setSelectedGame(game)}
            >
              <img src={getImgUrl(game.photo)} alt={game.name} className="sidebar-game-icon" onError={(e) => { e.target.src = '/no-image.png'; }} />
              <span className="sidebar-game-name">{game.name}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="library-main-content">
        {!selectedGame ? (
          <div className="library-home-view">
            <div className="library-top-bar">
              <div className="library-search">
                <img src={searchIcon} alt="search" className="icon-sm" />
                <input type="text" placeholder="Пошук у Бібліотеці..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="library-filters">
                <button className="filter-btn">
                  <img src={filterIcon} alt="filter" className="icon-sm" /> Фільтри
                </button>
                <div className="view-toggle">
                  <span>Вид:</span>
                  <img 
                    src={gridIcon} 
                    alt="grid" 
                    className={`icon-sm view-icon ${viewMode === "grid" ? "active" : ""}`} 
                    onClick={() => setViewMode("grid")}
                  />
                  <img 
                    src={listIcon} 
                    alt="list" 
                    className={`icon-sm view-icon ${viewMode === "list" ? "active" : ""}`} 
                    onClick={() => setViewMode("list")}
                  />
                </div>
              </div>
            </div>

            <section className="feed-section">
              <div className="section-header">
                <h2>Новини (Глобальний чат)</h2>
                <span className="see-all">Усі новини &gt;</span>
              </div>
              <div className="feed-horizontal-scroll">
                {news.slice(0, 5).map(post => (
                  <div key={post.id} className="feed-card text-only">
                    <div className="feed-card-header">
                      <div className="feed-author">
                        <div className="avatar-mini">{post.username ? post.username[0].toUpperCase() : "U"}</div> 
                        {post.username}
                      </div>
                      <img src={moreIcon} alt="more" className="icon-sm invert-icon" />
                    </div>
                    <h4>Повідомлення</h4>
                    <p>{post.text}</p>
                    <div className="feed-card-footer">
                      <span className="date">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {news.length === 0 && <p className="empty-text">Немає новин.</p>}
              </div>
            </section>

            <section className="feed-section">
              <div className="section-header">
                <h2>Цікаве від Спільноти (Скріншоти)</h2>
                <span className="see-all">Моя стрічка &gt;</span>
              </div>
              <div className="feed-horizontal-scroll">
                {community.slice(0, 5).map(post => (
                  <div key={post.id} className="feed-card with-image">
                    <div className="feed-card-header">
                      <div className="feed-author">
                        <div className="avatar-mini">{post.username ? post.username[0].toUpperCase() : "U"}</div> 
                        {post.username}
                      </div>
                      <img src={moreIcon} alt="more" className="icon-sm invert-icon" />
                    </div>
                    <div className="feed-image-wrapper">
                      <img src={post.url} alt="screenshot" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="feed-card-footer">
                      <span>♡ {post.likes || 0}</span>
                      <span className="date">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {community.length === 0 && <p className="empty-text">Немає скріншотів від спільноти.</p>}
              </div>
            </section>

            <section className="collection-section">
              <div className="library-tabs">
                <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>Усі ігри</button>
                <button className={activeTab === "favorite" ? "active" : ""} onClick={() => setActiveTab("favorite")}>Обране</button>
                <button className={activeTab === "collection" ? "active" : ""} onClick={() => setActiveTab("collection")}>Моя колекція</button>
              </div>

              {filteredGames.length === 0 ? (
                 <p className="empty-text">Ігор не знайдено</p>
              ) : viewMode === "grid" ? (
                <div className="library-games-grid">
                  {filteredGames.map(game => (
                    <div key={game.id} className="library-grid-card" onClick={() => setSelectedGame(game)}>
                      <img src={getImgUrl(game.photo)} alt={game.name} onError={(e) => { e.target.src = '/no-image.png'; }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="library-games-list">
                  {filteredGames.map(game => (
                    <div key={game.id} className="library-list-row" onClick={() => setSelectedGame(game)}>
                      <img src={getImgUrl(game.photo)} alt={game.name} className="list-row-img" onError={(e) => { e.target.src = '/no-image.png'; }} />
                      <div className="list-row-info">
                        <span className="list-row-title">{game.name}</span>
                        <button className="btn-primary small" onClick={(e) => { e.stopPropagation(); }}>Скачати</button>
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
          </div>
        ) : (
          <div className="library-game-page">
            <div className="game-hero-banner" style={{ backgroundImage: `linear-gradient(to top, #001A20, transparent), url(${getImgUrl(selectedGame.photo)})` }}>
              <div className="hero-top-nav">
                <button className="back-btn" onClick={() => setSelectedGame(null)}>← {selectedGame.name}</button>
              </div>
              <div className="game-hero-content">
                <div className="action-left">
                  <button className="btn-primary large">Скачати</button>
                  <div className="game-disk-info">
                    <span className="label">Розмір на диску</span>
                    <span className="value">10 ГБ</span>
                  </div>
                </div>
                <div className="action-right">
                  <button className="icon-btn-circle"><img src={starIcon} alt="star" /></button>
                  <button className="icon-btn-circle"><img src={moreIcon} alt="more" /></button>
                </div>
              </div>
            </div>

            <div className="game-sub-tabs">
              <span className="active">Сторінка крамниці</span>
              <span>DLC</span>
              <span>Сторінка розробника</span>
              <span>Спільнота</span>
            </div>

            <div className="game-page-content-grid">
              <div className="game-main-col">
                <section className="game-review-section">
                  <h3>Моя рецензія</h3>
                  <div className="review-box-empty">
                    <button className="btn-primary outline">Написати рецензію</button>
                  </div>
                </section>

                <section className="game-news-section">
                  <div className="section-header">
                    <h3>Що нового</h3>
                    <span className="see-all">Усі новини &gt;</span>
                  </div>
                  <div className="game-news-card">
                    <div className="news-image-placeholder"></div>
                    <div className="news-info">
                      <div className="feed-author"><div className="avatar-mini">С</div> Спільнота <span>{formatDate(new Date())}</span></div>
                      <h4>Останні оновлення гри</h4>
                      <p>Розробники випустили новий патч, який покращує стабільність та виправляє помилки...</p>
                      <div className="feed-card-footer">
                        <span>♡ 1.2k</span>
                        <span>🗨 340</span>
                        <span>➦ Поділитись</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="game-sidebar-col">
                <div className="friends-box">
                  <h4>Гравці спільноти ({usersList.length})</h4>
                  <ul className="friends-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 0' }}>
                    {usersList.slice(0, 8).map(u => (
                      <li key={u.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div className="avatar-mini" title={u.username}>{u.username ? u.username[0].toUpperCase() : "U"}</div>
                      </li>
                    ))}
                    {usersList.length > 8 && <li><div className="avatar-mini more">+{usersList.length - 8}</div></li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}