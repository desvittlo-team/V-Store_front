import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/ProfilePage.css"; 
import badgeFish from "../assets/badge_fish.png";
import badgeSword from "../assets/badge_sword.png";
import badgeHeart from "../assets/badge_heart.png";
import badgeCard from "../assets/badge_card.png";
import badgeGamepad from "../assets/badge_gamepad.png";

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;

export default function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const isOwnProfile = !id || (user && String(id) === String(user.id));

  useEffect(() => {
    if (!user?.token) { navigate("/login"); return; }
    const headers = { Authorization: `Bearer ${user.token}` };
    const fetchUrl = id ? `https://localhost:7059/api/profile/${id}` : "https://localhost:7059/api/profile/me";

    Promise.all([
      fetch(fetchUrl, { headers }),
      fetch("https://localhost:7059/api/users", { headers })
    ])
      .then(async ([pRes, uRes]) => {
        if (pRes.status === 401) { navigate("/login"); return; }
        const p = pRes.ok ? await pRes.json() : null;
        const u = uRes.ok ? await uRes.json() : [];
        setProfileData(p);
        setFriends(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate, id]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.token) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("https://localhost:7059/api/profile/me/avatar", { method: "POST", headers: { Authorization: `Bearer ${user.token}` }, body: formData });
    if (res.ok) {
      const data = await res.json();
      setProfileData(prev => ({ ...prev, user: { ...prev.user, photo: data.fileName } }));
      if (setUser) setUser(prev => ({ ...prev, photo: data.fileName }));
    }
  };

  const handleSaveProfile = async () => {
    if (!newUsername.trim() || !user?.token) return;
    const res = await fetch("https://localhost:7059/api/profile/me", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ username: newUsername }) });
    if (res.ok) {
      const updated = await res.json();
      setProfileData(prev => ({ ...prev, user: updated }));
      if (setUser) setUser(prev => ({ ...prev, username: updated.username }));
      setIsEditing(false);
    }
  };

  // Використовуємо класи замість інлайн-стилів для станів
  if (loading) return <div className="profile-layout main-container"><h2 className="profile-system-msg loading">Завантаження...</h2></div>;
  if (!profileData?.user) return <div className="profile-layout main-container"><h2 className="profile-system-msg error">Профіль не знайдено</h2></div>;

  const { user: pUser, library = [] } = profileData;

  return (
    <div className="profile-layout main-container">
      
      <div className="profile-header-container">
        <div className="profile-banner"></div>
        
        <div className="profile-info-bar">
          <div className={`profile-avatar-wrapper ${isOwnProfile ? 'editable' : ''}`} onClick={() => isOwnProfile && fileInputRef.current.click()}>
            <img 
              src={pUser.photo && pUser.photo !== "User.png" ? `https://localhost:7059/avatars/${pUser.photo}` : '/no-image.png'} 
              alt="avatar" 
              className="profile-avatar-img" 
              onError={(e) => e.target.src = '/no-image.png'}
            />
            {isOwnProfile && <div className="avatar-upload-overlay">📷</div>}
            {/* Використовуємо клас для приховування інпута */}
            <input type="file" ref={fileInputRef} className="hidden-file-input" onChange={handleAvatarUpload} />
          </div>
          
          <div className="profile-text-info">
            <h1 className="profile-username">{pUser.username}</h1>
            <span className="profile-status">онлайн</span>
            <p className="profile-bio">У пошуках нових пригод! Кожен новий рівень — це можливість пережити незабутні моменти та здобути новий досвід.</p>
          </div>

          <div className="profile-actions">
            {isOwnProfile ? (
              <button className="btn-edit-profile" onClick={() => { setNewUsername(pUser.username); setIsEditing(true); }}>
                <EditIcon /> Редагувати профіль
              </button>
            ) : (
              <>
                <button className="btn-add-friend">👤+ Додати до друзів</button>
                <button className="btn-icon-circle">✉️</button>
                <button className="btn-icon-circle">•••</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-body-grid">
        <div className="profile-main-col">
          <div className="profile-card">
            <h3 className="card-title">Галерея значків</h3>
            <div className="badges-row">
              <div className="badge-counter-box">
                <span className="count">5</span>
                <span className="label">Значків</span>
              </div>
              <div className="badges-icons">
                <img src={badgeFish} alt="Fish Badge" className="badge-img" />
                <img src={badgeSword} alt="Sword Badge" className="badge-img" />
                <img src={badgeHeart} alt="Heart Badge" className="badge-img" />
                <img src={badgeCard} alt="Card Badge" className="badge-img" />
                <img src={badgeGamepad} alt="Gamepad Badge" className="badge-img" />
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="card-title">Колекція ігор</h3>
            <div className="stats-row">
              <div className="stat-box"><span className="count">1234</span><span className="label">Ігор</span></div>
              <div className="stat-box"><span className="count">121</span><span className="label">DLC</span></div>
              <div className="stat-box"><span className="count">2564</span><span className="label">Бажаних</span></div>
            </div>
            <div className="games-covers-row">
              <div className="game-cover mock-nms"></div>
              <div className="game-cover mock-nms2"></div>
              <div className="game-cover mock-nms3"></div>
              <div className="game-cover mock-nms4"></div>
            </div>
          </div>
          
          <div className="profile-card">
            <h3 className="card-title">Галерея обговорень</h3>
            
            <div className="discussion-post">
              <div className="post-header">
                <div className="post-author"><span className="game-icon"></span> Fallout 4</div>
                <div className="post-date">25.02.2024</div>
                <div className="post-more">•••</div>
              </div>
              <h4 className="post-title">Освальд, обурливий, невбивний</h4>
              <p className="post-text">Я грав у Nuka world dlc, коли потрапив у дитяче королівство, все було добре, поки я не потрапив до Освальда в кінотеатрі...</p>
              <div className="post-actions">
                <span>❤️ 2.5k</span> <span>💬 2.5k</span> <span>↪️ Поділитись</span>
              </div>
            </div>

          </div>

          <div className="profile-card transparent-card">
            <div className="comments-header">
              <h3 className="card-title">Коментарі</h3>
              <span className="count-badge">35</span>
            </div>
            <input type="text" className="comment-input" placeholder="Ваш коментар..." />
            
            <div className="comments-list">
              {[1, 2, 3].map((item) => (
                <div key={item} className="comment-item">
                  <div className="comment-avatar"><img src={pUser.photo && pUser.photo !== "User.png" ? `https://localhost:7059/avatars/${pUser.photo}` : '/no-image.png'} alt="user"/></div>
                  <div className="comment-content">
                    <div className="comment-top">
                      <span className="comment-name">MrZubarik</span>
                      <span className="comment-date">25.02.2024</span>
                      <span className="comment-more">•••</span>
                    </div>
                    <p className="comment-text">Це неймовірно! Дякую за такий корисний контент! Завжди цікаво читати ваші пости, адже вони наповнені корисною інформацією.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="profile-sidebar-col">

          <div className="profile-card side-card">
            <div className="level-header-box">
              <h3>Рівень</h3>
              <div className="level-hexagon">99</div>
            </div>
            <ul className="side-menu">
              <li className="active">Головна</li>
              <li>Значки <span className="menu-count">100</span></li>
              <li>Ігри <span className="menu-count">100</span></li>
              <li>Бажане <span className="menu-count">100</span></li>
              <li>Обговорення <span className="menu-count">100</span></li>
              <li>Скріншоти <span className="menu-count">100</span></li>
              <li>Відео <span className="menu-count">100</span></li>
              <li>Гайди <span className="menu-count">100</span></li>
              <li>Рецензії <span className="menu-count">100</span></li>
            </ul>
          </div>

          <div className="profile-card side-card">
            <div className="friends-header-box">
              <h3>Друзі</h3>
              <span className="count-badge">35</span>
            </div>
            <ul className="friends-list">
              {friends.slice(0, 5).map(f => (
                <li key={f.id} onClick={() => navigate(`/profile/${f.id}`)}>
                  <div className="friend-avatar">{f.username ? f.username[0].toUpperCase() : "?"}</div>
                  <span className="friend-name">{f.username}</span>
                  <div className="friend-level-hex">40</div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <h3>Редагувати профіль</h3>
            <input className="edit-input" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Ваш нікнейм" />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>Скасувати</button>
              <button className="btn-save" onClick={handleSaveProfile}>Зберегти</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}