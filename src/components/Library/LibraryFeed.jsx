// components/library/LibraryFeed.jsx

import moreIcon from '../../assets/more_vert.png';

export default function LibraryFeed({ news, community, formatDate }) {
  return (
    <>
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
                <img src={post.url} alt="screenshot" onError={e => { e.target.style.display = 'none'; }} />
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
    </>
  );
}
