import React, { useState, useRef, useEffect } from "react";
import "../../style/EditProfileModal.css";

const TABS = ["Загальне", "Аватар", "Фон", "Шапка", "Вітрини", "Налаштування"];

export default function EditProfileModal({ user, profileData, onClose, onSaved }) {
  const fileInputRef  = useRef(null);
  const bannerFileRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const [username, setUsername]             = useState(profileData?.user?.username || "");
  const [bio, setBio]                       = useState(profileData?.user?.bio || "");
  const [usernameStatus, setUsernameStatus] = useState("idle");

  const [avatarPreview, setAvatarPreview]       = useState(null);
  const [avatarFile, setAvatarFile]             = useState(null);
  const [selectedAvatarItem, setSelectedAvatarItem] = useState(null);

  const [selectedBg, setSelectedBg]         = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerFile, setBannerFile]         = useState(null);
  const [bannerPreview, setBannerPreview]   = useState(null);

  const [showcases, setShowcases]           = useState(profileData?.showcases || []);
  const [newShowcaseName, setNewShowcaseName] = useState("");

  const [hideComments,    setHideComments]    = useState(profileData?.user?.hideComments    || false);
  const [privateLibrary,  setPrivateLibrary]  = useState(profileData?.user?.privateLibrary  || false);
  const [hideBadges,      setHideBadges]      = useState(profileData?.user?.hideBadges      || false);
  const [hideGames,       setHideGames]       = useState(profileData?.user?.hideGames       || false);
  const [hideDiscussions, setHideDiscussions] = useState(profileData?.user?.hideDiscussions || false);
  const [hideFriends,     setHideFriends]     = useState(profileData?.user?.hideFriends     || false);

  const [inventory,   setInventory]   = useState([]);
  const [bgInventory, setBgInventory] = useState([]);

  const BASE = "https://localhost:7059";

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${BASE}/api/market/inventory/my`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(items => {
        setInventory(items.filter(i => i.item.itemType !== "profile_background"));
        setBgInventory(items.filter(i => i.item.itemType === "profile_background"));
      })
      .catch(console.error);
  }, [user]);

  const validateUsername = (val) => {
    setUsernameStatus(/^[a-zA-Z0-9_]{3,20}$/.test(val) ? "ok" : "error");
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) {
      setError("Дозволені формати: JPG, PNG, WEBP, GIF"); return;
    }
    if (file.size > 5 * 1024 * 1024) { setError("Максимум 5MB"); return; }
    setAvatarFile(file);
    setSelectedAvatarItem(null);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleBannerFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      setError("Для шапки: JPG, PNG, WEBP"); return;
    }
    setBannerFile(file);
    setSelectedBanner(null);
    setBannerPreview(URL.createObjectURL(file));
    setError("");
  };

  const addShowcase = () => {
    const name = newShowcaseName.trim();
    if (!name) return;
    setShowcases(prev => [...prev, { id: Date.now(), name, items: [] }]);
    setNewShowcaseName("");
  };

  const removeItemFromShowcase = (showcaseId, itemId) => {
    setShowcases(prev => prev.map(s =>
      s.id === showcaseId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
    ));
  };

  const handleSave = async () => {
    if (usernameStatus === "error") { setError("Виправте ім'я користувача"); return; }
    setSaving(true);
    setError("");
    const h = { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" };

    try {
      // Аватар файлом
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        await fetch(`${BASE}/api/profile/me/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: fd
        });
      }

      // Баннер файлом
      if (bannerFile) {
        const fd = new FormData();
        fd.append("file", bannerFile);
        await fetch(`${BASE}/api/profile/me/banner`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: fd
        });
      }

      const payload = {
        username:                 username.trim(),
        bio:                      bio.trim(),
        avatarInventoryItemId:     selectedAvatarItem?.id || null,
        backgroundInventoryItemId: selectedBg?.id         || null,
        bannerInventoryItemId:     selectedBanner?.id     || null,
        hideComments,
        privateLibrary,
        hideBadges,
        hideGames,
        hideDiscussions,
        hideFriends,
        showcases: showcases.map(s => ({ name: s.name, itemIds: s.items.map(i => i.id) }))
      };

      const res = await fetch(`${BASE}/api/profile/me`, {
        method: "PUT", headers: h, body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Сервер відхилив зміни");
      onSaved?.(await res.json());
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const currentAvatarUrl = avatarPreview
    || (selectedAvatarItem ? `${BASE}/items/${selectedAvatarItem.item.photo}` : null)
    || (profileData?.user?.photo ? `${BASE}/avatars/${profileData.user.photo}` : "/no-image.png");

  const currentBannerUrl = bannerPreview
    || (selectedBanner ? `${BASE}/items/${selectedBanner.item.photo}` : null)
    || profileData?.user?.bannerUrl
    || null;

  return (
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-modal" onClick={e => e.stopPropagation()}>
        <div className="epm-header">
          <h3>Налаштування профілю</h3>
          <button className="epm-close" onClick={onClose}>✕</button>
        </div>

        <div className="epm-tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`epm-tab ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>
              {t}
            </button>
          ))}
        </div>

        <div className="epm-body">

          {/* TAB 0: ЗАГАЛЬНЕ */}
          {activeTab === 0 && (
            <div className="epm-section">
              <div className="epm-field">
                <label>Ім'я користувача</label>
                <input
                  className={`epm-input ${usernameStatus}`}
                  value={username}
                  onChange={e => { setUsername(e.target.value); validateUsername(e.target.value); }}
                  maxLength={20}
                />
                <small>Тільки латиниця, цифри та "_" (3-20 символів)</small>
              </div>
              <div className="epm-field">
                <label>Про себе</label>
                <textarea
                  className="epm-textarea"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  rows={5}
                />
                <div className="epm-char-count">{bio.length}/500</div>
              </div>
            </div>
          )}

          {/* TAB 1: АВАТАР */}
          {activeTab === 1 && (
            <div className="epm-section">
              <div className="epm-avatar-setup">
                <div className="epm-preview-main">
                  <img src={currentAvatarUrl} alt="Preview" crossOrigin="anonymous" />
                  <button onClick={() => fileInputRef.current.click()}>Завантажити фото</button>
                  <input type="file" ref={fileInputRef} hidden onChange={handleAvatarFile} accept="image/*" />
                </div>
                <div className="epm-inventory-sub">
                  <p>Або виберіть GIF з інвентаря:</p>
                  <div className="epm-grid-mini">
                    {inventory.map(item => (
                      <div
                        key={item.id}
                        className={`epm-item ${selectedAvatarItem?.id === item.id ? 'active' : ''}`}
                        onClick={() => { setSelectedAvatarItem(item); setAvatarFile(null); setAvatarPreview(null); }}
                      >
                        <img src={`${BASE}/items/${item.item.photo}`} title={item.item.name} crossOrigin="anonymous" onError={e => e.target.style.display="none"} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ФОН */}
          {activeTab === 2 && (
            <div className="epm-section">
              <p>Фон сторінки профілю з інвентаря:</p>
              <div className="epm-grid-bg">
                {bgInventory.map(item => (
                  <div
                    key={item.id}
                    className={`epm-bg-card ${selectedBg?.id === item.id ? 'active' : ''}`}
                    onClick={() => setSelectedBg(item)}
                  >
                    <img src={`${BASE}/items/${item.item.photo}`} onError={e => e.target.style.display="none"} />
                    <span>{item.item.name}</span>
                  </div>
                ))}
              </div>
              {selectedBg && (
                <button className="epm-btn-ghost" onClick={() => setSelectedBg(null)}>Скинути фон</button>
              )}
            </div>
          )}

          {/* TAB 3: ШАПКА */}
          {activeTab === 3 && (
            <div className="epm-section">
              <div className="epm-banner-preview" style={{
                height: 120,
                borderRadius: 8,
                marginBottom: 16,
                background: currentBannerUrl ? `url(${currentBannerUrl}) center/cover` : '#1a2a3a',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {!currentBannerUrl && <span style={{ color: '#555' }}>Попередній перегляд шапки</span>}
              </div>

              <div className="epm-field">
                <label>Завантажити зображення шапки</label>
                <button className="epm-btn-secondary" onClick={() => bannerFileRef.current.click()}>
                  Вибрати файл (JPG, PNG, WEBP)
                </button>
                <input type="file" ref={bannerFileRef} hidden onChange={handleBannerFile} accept="image/jpeg,image/png,image/webp" />
              </div>

              <p style={{ margin: '12px 0 8px', fontSize: 13, color: '#888' }}>Або з інвентаря:</p>
              <div className="epm-grid-bg">
                {bgInventory.map(item => (
                  <div
                    key={item.id}
                    className={`epm-bg-card ${selectedBanner?.id === item.id ? 'active' : ''}`}
                    onClick={() => { setSelectedBanner(item); setBannerFile(null); setBannerPreview(null); }}
                  >
                    <img src={`${BASE}/items/${item.item.photo}`} onError={e => e.target.style.display="none"} />
                    <span>{item.item.name}</span>
                  </div>
                ))}
              </div>
              {(selectedBanner || bannerPreview) && (
                <button className="epm-btn-ghost" onClick={() => { setSelectedBanner(null); setBannerFile(null); setBannerPreview(null); }}>
                  Скинути шапку
                </button>
              )}
            </div>
          )}

          {/* TAB 4: ВІТРИНИ */}
          {activeTab === 4 && (
            <div className="epm-section">
              <div className="epm-add-showcase">
                <input value={newShowcaseName} onChange={e => setNewShowcaseName(e.target.value)} placeholder="Назва вітрини" />
                <button onClick={addShowcase}>Створити</button>
              </div>
              <div className="epm-showcases-list">
                {showcases.map(s => (
                  <div key={s.id} className="epm-showcase-box">
                    <div className="epm-showcase-head">
                      <h4>{s.name}</h4>
                      <button onClick={() => setShowcases(prev => prev.filter(x => x.id !== s.id))}>Видалити</button>
                    </div>
                    <div className="epm-showcase-items">
                      {s.items.map(it => (
                        <div key={it.id} className="epm-sc-item" onClick={() => removeItemFromShowcase(s.id, it.id)}>
                          <img src={it.imageUrl} alt="" />
                        </div>
                      ))}
                      {s.items.length < 5 && <div className="epm-sc-add-placeholder">+</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: НАЛАШТУВАННЯ */}
          {activeTab === 5 && (
            <div className="epm-section">
              <p className="epm-settings-group-label">Приватність</p>
              <ToggleRow label="Приховати коментарі"    checked={hideComments}    onChange={setHideComments} />
              <ToggleRow label="Приватна бібліотека"    checked={privateLibrary}  onChange={setPrivateLibrary} />

              <p className="epm-settings-group-label" style={{ marginTop: 20 }}>Блоки профілю</p>
              <ToggleRow label="Сховати галерею значків"    checked={hideBadges}      onChange={setHideBadges} />
              <ToggleRow label="Сховати колекцію ігор"      checked={hideGames}       onChange={setHideGames} />
              <ToggleRow label="Сховати обговорення"        checked={hideDiscussions}  onChange={setHideDiscussions} />
              <ToggleRow label="Сховати список друзів"      checked={hideFriends}      onChange={setHideFriends} />
            </div>
          )}

        </div>

        {error && <div className="epm-error-msg">{error}</div>}

        <div className="epm-footer">
          <button className="btn-cancel" onClick={onClose}>Скасувати</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Збереження..." : "Зберегти всі зміни"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="epm-toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    </div>
  );
}