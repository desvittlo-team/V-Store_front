import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Іконки (SVG)
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const BadgeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#24E5C2" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

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
    if (!user?.token) {
      navigate("/login");
      return;
    }

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
    const res = await fetch("https://localhost:7059/api/profile/me/avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      setProfileData(prev => ({ ...prev, user: { ...prev.user, photo: data.fileName } }));
      if (setUser) setUser(prev => ({ ...prev, photo: data.fileName }));
    }
  };

  const handleSaveProfile = async () => {
    if (!newUsername.trim() || !user?.token) return;
    const res = await fetch("https://localhost:7059/api/profile/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ username: newUsername })
    });
    if (res.ok) {
      const updated = await res.json();
      setProfileData(prev => ({ ...prev, user: updated }));
      if (setUser) setUser(prev => ({ ...prev, username: updated.username }));
      setIsEditing(false);
    }
  };

  if (loading) return null;
  if (!profileData?.user) return <div className="main-container" style={{color:"#fff", padding:"50px"}}>Профіль не знайдено</div>;

  const { user: pUser, library = [], screenshots = [] } = profileData;

  return (
    <div className="profile-layout main-container">
      <div className="profile-header-banner">
        <div className="banner-bg"></div>
        <div className="profile-user-info-bar">
          <div className={`profile-avatar-wrapper ${isOwnProfile ? 'editable' : ''}`} onClick={() => isOwnProfile && fileInputRef.current.click()}>
            <img 
              src={pUser.photo && pUser.photo !== "User.png" ? `https://localhost:7059/avatars/${pUser.photo}` : '/no-image.png'} 
              alt="avatar" 
              className="profile-avatar-large" 
              onError={(e) => e.target.src = '/no-image.png'}
            />
            {isOwnProfile && <div className="avatar-upload-overlay">📷</div>}
            <input type="file" ref={fileInputRef} style={{display:"none"}} onChange={handleAvatarUpload} />
          </div>
          <div className="profile-name-block">
            <h1>{pUser.username}</h1>
            <span className="status-online">Онлайн</span>
            <p className="status-quote">У пошуках нових пригод. Кожен новий рівень — це можливість пережити незабутні моменти...</p>
          </div>
          <div className="profile-actions-block">
            {isOwnProfile ? (
              <button className="btn-edit-profile" onClick={() => { setNewUsername(pUser.username); setIsEditing(true); }}>
                <EditIcon /> Редагувати профіль
              </button>
            ) : <button className="btn-primary">Додати в друзі</button>}
          </div>
        </div>
      </div>

      <div className="profile-body-grid">
        <div className="profile-main-col">
          <div className="profile-card">
            <h3 className="card-title">Галерея значків</h3>
            <div className="badges-container">
              <div className="badge-count">
                <span className="count">5</span>
                <span className="label">Значків</span>
              </div>
              <div className="badges-list">
                <BadgeIcon /> <BadgeIcon /> <BadgeIcon /> <BadgeIcon />
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="card-title">Колекція ігор</h3>
            <div className="collection-stats">
              <div className="stat-box"><span className="count">{library.length}</span><span className="label">Ігор</span></div>
              <div className="stat-box"><span className="count">121</span><span className="label">DLC</span></div>
              <div className="stat-box"><span className="count">2564</span><span className="label">Рецензії</span></div>
            </div>
            <div className="collection-covers">
              {library.slice(0, 4).map(g => (
                <img key={g.id} src={`https://localhost:7059/images/${g.photo}`} alt={g.name} className="collection-game-cover" onError={(e) => e.target.src = '/no-image.png'} />
              ))}
            </div>
          </div>
          
          {/* Блок обговорень, як на макеті */}
          <div className="profile-card">
            <h3 className="card-title">Галерея обговорень</h3>
            <div className="mock-post">
              <div className="post-header">👤 Fallout 4 <span>25.02.2024</span></div>
              <p>Я грав у Nuka World DLC, коли потрапив у дитяче королівство... Це неймовірно!</p>
              <div className="post-img-placeholder"></div>
            </div>
          </div>
        </div>

        <div className="profile-sidebar-col">
          <div className="profile-level-card">
            <div className="level-header"><h3>Рівень</h3><span className="level-badge">99</span></div>
            <ul className="level-menu">
              <li className="active">Головна <span className="count">100</span></li>
              <li>Значки <span className="count">100</span></li>
              <li>Ігри <span className="count">{library.length}</span></li>
              <li>Бажане <span className="count">100</span></li>
              <li>Обговорення <span className="count">100</span></li>
            </ul>
          </div>

          <div className="profile-friends-card">
            <div className="friends-header"><h3>Друзі</h3><span className="count">{friends.length}</span></div>
            <ul className="friends-list-compact">
              {friends.slice(0, 5).map(f => (
                <li key={f.id} onClick={() => navigate(`/profile/${f.id}`)}>
                  <div className="avatar-mini">{f.username ? f.username[0].toUpperCase() : "?"}</div>
                  <span className="friend-name">{f.username}</span>
                  <span className="friend-lvl">40</span>
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