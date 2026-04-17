// components/library/LibraryGamePage.jsx

import starIcon from '../../assets/star.png';
import moreIcon from '../../assets/more_vert.png';

export default function LibraryGamePage({ game, usersList, onBack, getImgUrl, formatDate }) {
  return (
    <div className="library-game-page">
      <div
        className="game-hero-banner"
        style={{ backgroundImage: `linear-gradient(to top, #001A20, transparent), url(${getImgUrl(game.photo)})` }}
      >
        <div className="hero-top-nav">
          <button className="back-btn" onClick={onBack}>← {game.name}</button>
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
                <div className="feed-author">
                  <div className="avatar-mini">С</div> Спільнота <span>{formatDate(new Date())}</span>
                </div>
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
                  <div className="avatar-mini" title={u.username}>
                    {u.username ? u.username[0].toUpperCase() : "U"}
                  </div>
                </li>
              ))}
              {usersList.length > 8 && (
                <li><div className="avatar-mini more">+{usersList.length - 8}</div></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
