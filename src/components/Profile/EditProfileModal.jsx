import React, { useState, useRef, useEffect, useCallback } from "react";
import "../../style/EditProfileModal.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE = "https://localhost:7059";
const TABS = ["Загальне", "Аватар", "Фон", "Шапка", "Вітрини", "Налаштування"];
const SHOWCASE_TYPES = [
  { value: "illustration", label: "🖼 Ілюстрація" },
  { value: "screenshots",  label: "📷 Скріншоти" },
  { value: "inventory",    label: "🎒 Інвентар" },
  { value: "games",        label: "🎮 Ігри" },
];
const PRIVACY_TOGGLES = [
  { key: "hideComments",    label: "Приховати коментарі" },
  { key: "privateLibrary",  label: "Приватна бібліотека" },
];
const BLOCK_TOGGLES = [
  { key: "hideBadges",      label: "Сховати галерею значків" },
  { key: "hideGames",       label: "Сховати колекцію ігор" },
  { key: "hideDiscussions", label: "Сховати обговорення" },
  { key: "hideFriends",     label: "Сховати список друзів" },
];
const AVATAR_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BANNER_FORMATS = ["image/jpeg", "image/png", "image/webp"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const authHeaders = (token, json = false) => ({
  Authorization: `Bearer ${token}`,
  ...(json ? { "Content-Type": "application/json" } : {}),
});

const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Помилка запиту");
  }
  return res.json();
};

const itemPhotoUrl = (photo) => `${BASE}/items/${photo}`;

const resolveAvatarUrl = (preview, selectedItem, profilePhoto) => {
  if (preview) return preview;
  if (selectedItem) return itemPhotoUrl(selectedItem.item.photo);
  if (!profilePhoto || profilePhoto === "User.png") return "/no-image.png";
  if (profilePhoto.startsWith("http")) return profilePhoto;
  if (profilePhoto.startsWith("items/")) return `${BASE}/${profilePhoto}`;
  return `${BASE}/avatars/${profilePhoto}`;
};

const validateUsername = (val) =>
  /^[a-zA-Z0-9_]{3,20}$/.test(val) ? "ok" : "error";

// ─── Custom hook: data fetching ───────────────────────────────────────────────
function useProfileData(token, activeTab) {
  const [inventory,   setInventory]   = useState([]);
  const [bgInventory, setBgInventory] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [library,     setLibrary]     = useState([]);
  const [showcases,       setShowcases]       = useState([]);
  const [showcaseLoading, setShowcaseLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch(`${BASE}/api/market/inventory/my`, { headers: authHeaders(token) })
      .then(items => {
        setInventory(items.filter(i => i.item.itemType !== "profile_background"));
        setBgInventory(items.filter(i => i.item.itemType === "profile_background"));
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    apiFetch(`${BASE}/api/screenshots/my`, { headers: authHeaders(token) })
      .then(setScreenshots)
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    apiFetch(`${BASE}/api/profile/me`, { headers: authHeaders(token) })
      .then(data => setLibrary(data?.library || []))
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token || activeTab !== 4) return;
    setShowcaseLoading(true);
    apiFetch(`${BASE}/api/showcases/my`, { headers: authHeaders(token) })
      .then(setShowcases)
      .catch(console.error)
      .finally(() => setShowcaseLoading(false));
  }, [token, activeTab]);

  return { inventory, bgInventory, screenshots, library, showcases, setShowcases, showcaseLoading };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="epm-toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="epm-checkbox" />
    </label>
  );
}

function InventoryGrid({ items, selectedId, onSelect, BASE }) {
  return (
    <div className="epm-grid-mini">
      {items.map(item => (
        <div
          key={item.id}
          className={`epm-item ${selectedId === item.id ? "active" : ""}`}
          onClick={() => onSelect(item)}
        >
          <img
            src={itemPhotoUrl(item.item.photo)}
            title={item.item.name}
            crossOrigin="anonymous"
            onError={e => (e.target.style.display = "none")}
          />
        </div>
      ))}
    </div>
  );
}

function BgGrid({ items, selectedId, onSelect }) {
  return (
    <div className="epm-grid-bg">
      {items.map(item => (
        <div
          key={item.id}
          className={`epm-bg-card ${selectedId === item.id ? "active" : ""}`}
          onClick={() => onSelect(item)}
        >
          <img src={itemPhotoUrl(item.item.photo)} onError={e => (e.target.style.display = "none")} />
          <span className="epm-bg-label">{item.item.name}</span>
        </div>
      ))}
    </div>
  );
}

function ShowcasePicker({ showcase, inventory, screenshots, library, onAdd }) {
  const { type, items } = showcase;

  if (type === "inventory") {
    const available = inventory.filter(inv => !items.some(si => si.inventoryItem?.id === inv.id));
    return (
      <>
        <p className="epm-picker-label">Виберіть предмет з інвентаря:</p>
        <div className="epm-picker-grid">
          {available.length === 0
            ? <p className="epm-empty-text">Інвентар порожній</p>
            : available.map(inv => (
              <div key={inv.id} className="epm-picker-item" onClick={() => onAdd({ inventoryItemId: inv.id })}>
                <img src={itemPhotoUrl(inv.item.photo)} onError={e => (e.target.style.display = "none")} />
                <span>{inv.item.name}</span>
              </div>
            ))
          }
        </div>
      </>
    );
  }

  if (type === "screenshots") {
    const available = screenshots.filter(sc => !items.some(si => si.screenshot?.id === sc.id));
    return (
      <>
        <p className="epm-picker-label">Виберіть скріншот:</p>
        <div className="epm-picker-grid">
          {available.length === 0
            ? <p className="epm-empty-text">Скріншотів немає</p>
            : available.map(sc => (
              <div key={sc.id} className="epm-picker-item" onClick={() => onAdd({ screenshotId: sc.id })}>
                <img src={`${BASE}/screenshots/${sc.fileName}`} onError={e => (e.target.style.display = "none")} />
                <span>{sc.caption || "Без назви"}</span>
              </div>
            ))
          }
        </div>
      </>
    );
  }

  if (type === "games") {
    const available = library.filter(lg => !items.some(si => si.game?.id === lg.id));
    return (
      <>
        <p className="epm-picker-label">Виберіть гру з бібліотеки:</p>
        <div className="epm-picker-grid">
          {available.length === 0
            ? <p className="epm-empty-text">Бібліотека порожня</p>
            : available.map(lg => (
              <div key={lg.id} className="epm-picker-item" onClick={() => onAdd({ userGameId: lg.id })}>
                <img src={`${BASE}/images/${lg.photo}`} onError={e => (e.target.style.display = "none")} />
                <span>{lg.name}</span>
              </div>
            ))
          }
        </div>
      </>
    );
  }

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EditProfileModal({ user, profileData, onClose, onSaved }) {
  const fileInputRef    = useRef(null);
  const bannerFileRef   = useRef(null);
  const illustrationRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  // General
  const [username,       setUsername]       = useState(profileData?.user?.username || "");
  const [bio,            setBio]            = useState(profileData?.user?.bio || "");
  const [usernameStatus, setUsernameStatus] = useState("idle");

  // Avatar
  const [avatarPreview,      setAvatarPreview]      = useState(null);
  const [avatarFile,         setAvatarFile]          = useState(null);
  const [selectedAvatarItem, setSelectedAvatarItem]  = useState(null);

  // Banner / BG
  const [selectedBg,     setSelectedBg]     = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerFile,     setBannerFile]     = useState(null);
  const [bannerPreview,  setBannerPreview]  = useState(null);

  // Privacy settings — stored as one object for brevity
  const [privacy, setPrivacy] = useState({
    hideComments:    profileData?.user?.hideComments    || false,
    privateLibrary:  profileData?.user?.privateLibrary  || false,
    hideBadges:      profileData?.user?.hideBadges      || false,
    hideGames:       profileData?.user?.hideGames       || false,
    hideDiscussions: profileData?.user?.hideDiscussions || false,
    hideFriends:     profileData?.user?.hideFriends     || false,
  });

  // Showcases
  const [newShowcaseType,  setNewShowcaseType]  = useState("illustration");
  const [newShowcaseTitle, setNewShowcaseTitle] = useState("");
  const [pickerOpen,       setPickerOpen]       = useState(null);

  const { inventory, bgInventory, screenshots, library, showcases, setShowcases, showcaseLoading } =
    useProfileData(user?.token, activeTab);

  // ── Derived URLs ──
  const currentAvatarUrl = resolveAvatarUrl(avatarPreview, selectedAvatarItem, profileData?.user?.photo);
  const currentBannerUrl = bannerPreview
    || (selectedBanner ? itemPhotoUrl(selectedBanner.item.photo) : null)
    || profileData?.user?.bannerUrl
    || null;

  // ── Handlers ──
  const handleUsernameChange = (val) => {
    setUsername(val);
    setUsernameStatus(validateUsername(val));
  };

  const handleFileSelect = useCallback((e, formats, maxMb, onSuccess, errMsg) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!formats.includes(file.type)) { setError(errMsg); return; }
    if (maxMb && file.size > maxMb * 1024 * 1024) { setError(`Максимум ${maxMb}MB`); return; }
    setError("");
    onSuccess(file);
  }, []);

  const handleAvatarFile = (e) =>
    handleFileSelect(e, AVATAR_FORMATS, 5, (file) => {
      setAvatarFile(file);
      setSelectedAvatarItem(null);
      setAvatarPreview(URL.createObjectURL(file));
    }, "Дозволені формати: JPG, PNG, WEBP, GIF");

  const handleBannerFile = (e) =>
    handleFileSelect(e, BANNER_FORMATS, null, (file) => {
      setBannerFile(file);
      setSelectedBanner(null);
      setBannerPreview(URL.createObjectURL(file));
    }, "Для шапки: JPG, PNG, WEBP");

  const refreshShowcases = useCallback(() =>
    apiFetch(`${BASE}/api/showcases/my`, { headers: authHeaders(user.token) })
      .then(setShowcases)
      .catch(console.error),
  [user?.token]);

  const createShowcase = async () => {
    if (!newShowcaseTitle.trim()) return;
    try {
      const created = await apiFetch(`${BASE}/api/showcases`, {
        method: "POST",
        headers: authHeaders(user.token, true),
        body: JSON.stringify({ type: newShowcaseType, title: newShowcaseTitle.trim() }),
      });
      setShowcases(prev => [...prev, { ...created, items: [] }]);
      setNewShowcaseTitle("");
    } catch (e) { setError(e.message); }
  };

  const deleteShowcase = async (id) => {
    try {
      await fetch(`${BASE}/api/showcases/${id}`, { method: "DELETE", headers: authHeaders(user.token) });
      setShowcases(prev => prev.filter(s => s.id !== id));
      if (pickerOpen === id) setPickerOpen(null);
    } catch { setError("Помилка видалення"); }
  };

  const removeShowcaseItem = async (showcaseId, itemId) => {
    try {
      await fetch(`${BASE}/api/showcases/items/${itemId}`, { method: "DELETE", headers: authHeaders(user.token) });
      setShowcases(prev => prev.map(s =>
        s.id === showcaseId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
      ));
    } catch { setError("Помилка видалення елементу"); }
  };

  const addShowcaseItem = async (showcaseId, body) => {
    try {
      await apiFetch(`${BASE}/api/showcases/${showcaseId}/items`, {
        method: "POST",
        headers: authHeaders(user.token, true),
        body: JSON.stringify(body),
      });
      await refreshShowcases();
      setPickerOpen(null);
    } catch (e) { setError(e.message); }
  };

  const uploadIllustration = async (showcaseId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      await apiFetch(`${BASE}/api/showcases/${showcaseId}/illustration`, {
        method: "POST",
        headers: authHeaders(user.token),
        body: fd,
      });
      await refreshShowcases();
    } catch (e) { setError(e.message); }
  };

  const uploadFile = async (url, file) => {
    const fd = new FormData();
    fd.append("file", file);
    await fetch(url, { method: "POST", headers: authHeaders(user.token), body: fd });
  };

  const handleSave = async () => {
    if (usernameStatus === "error") { setError("Виправте ім'я користувача"); return; }
    setSaving(true);
    setError("");
    try {
      if (avatarFile) await uploadFile(`${BASE}/api/profile/me/avatar`, avatarFile);
      if (bannerFile) await uploadFile(`${BASE}/api/profile/me/banner`, bannerFile);

      const saved = await apiFetch(`${BASE}/api/profile/me`, {
        method: "PUT",
        headers: authHeaders(user.token, true),
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim(),
          avatarInventoryItemId:     selectedAvatarItem?.id || null,
          backgroundInventoryItemId: selectedBg?.id         || null,
          bannerInventoryItemId:     selectedBanner?.id     || null,
          ...privacy,
        }),
      });
      onSaved?.(saved);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──
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

          {/* ── TAB 0: ЗАГАЛЬНЕ ── */}
          {activeTab === 0 && (
            <div className="epm-section">
              <div className="epm-field">
                <label>Ім'я користувача</label>
                <input
                  className={`epm-input ${usernameStatus}`}
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  maxLength={20}
                />
                <small className="epm-hint">Тільки латиниця, цифри та "_" (3-20 символів)</small>
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

          {/* ── TAB 1: АВАТАР ── */}
          {activeTab === 1 && (
            <div className="epm-section">
              <div className="epm-avatar-setup">
                <div className="epm-preview-main">
                  <img src={currentAvatarUrl} alt="Preview" crossOrigin="anonymous" />
                  <button className="epm-btn-secondary" onClick={() => fileInputRef.current.click()}>Завантажити фото</button>
                  <input type="file" ref={fileInputRef} hidden onChange={handleAvatarFile} accept="image/*" />
                </div>
                <div className="epm-inventory-sub">
                  <p className="epm-sub-label">Або виберіть GIF з інвентаря:</p>
                  <InventoryGrid
                    items={inventory}
                    selectedId={selectedAvatarItem?.id}
                    onSelect={item => { setSelectedAvatarItem(item); setAvatarFile(null); setAvatarPreview(null); }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: ФОН ── */}
          {activeTab === 2 && (
            <div className="epm-section">
              <p className="epm-sub-label">Фон сторінки профілю з інвентаря:</p>
              <BgGrid items={bgInventory} selectedId={selectedBg?.id} onSelect={setSelectedBg} />
              {selectedBg && (
                <button className="epm-btn-ghost mt-16" onClick={() => setSelectedBg(null)}>Скинути фон</button>
              )}
            </div>
          )}

          {/* ── TAB 3: ШАПКА ── */}
          {activeTab === 3 && (
            <div className="epm-section">
              <div className="epm-banner-preview" style={{
                background: currentBannerUrl ? `url(${currentBannerUrl}) center/cover` : "#001a20",
              }}>
                {!currentBannerUrl && <span className="epm-preview-hint">Попередній перегляд шапки</span>}
              </div>
              <div className="epm-field">
                <label>Завантажити зображення шапки</label>
                <button className="epm-btn-secondary full-width" onClick={() => bannerFileRef.current.click()}>
                  Вибрати файл (JPG, PNG, WEBP)
                </button>
                <input type="file" ref={bannerFileRef} hidden onChange={handleBannerFile} accept="image/jpeg,image/png,image/webp" />
              </div>
              <p className="epm-sub-label mt-16">Або з інвентаря:</p>
              <BgGrid
                items={bgInventory}
                selectedId={selectedBanner?.id}
                onSelect={item => { setSelectedBanner(item); setBannerFile(null); setBannerPreview(null); }}
              />
              {(selectedBanner || bannerPreview) && (
                <button className="epm-btn-ghost mt-16" onClick={() => { setSelectedBanner(null); setBannerFile(null); setBannerPreview(null); }}>
                  Скинути шапку
                </button>
              )}
            </div>
          )}

          {/* ── TAB 4: ВІТРИНИ ── */}
          {activeTab === 4 && (
            <div className="epm-section">
              <div className="epm-showcase-create">
                <p className="epm-sub-label">Створити нову вітрину:</p>
                <div className="epm-showcase-create-row">
                  <select className="epm-select" value={newShowcaseType} onChange={e => setNewShowcaseType(e.target.value)}>
                    {SHOWCASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input
                    className="epm-input flex-grow"
                    value={newShowcaseTitle}
                    onChange={e => setNewShowcaseTitle(e.target.value)}
                    placeholder="Назва вітрини..."
                    maxLength={50}
                  />
                  <button className="epm-btn-primary" onClick={createShowcase}>+ Створити</button>
                </div>
              </div>

              {showcaseLoading ? (
                <p className="epm-empty-text center mt-20">Завантаження...</p>
              ) : showcases.length === 0 ? (
                <p className="epm-empty-text center mt-20">Вітрин ще немає</p>
              ) : (
                <div className="epm-showcases-list">
                  {showcases.map(s => (
                    <div key={s.id} className="epm-showcase-box">

                      <div className="epm-showcase-head">
                        <div className="epm-showcase-head-left">
                          <span className="epm-showcase-type-badge">
                            {SHOWCASE_TYPES.find(t => t.value === s.type)?.label || s.type}
                          </span>
                          <h4>{s.title}</h4>
                        </div>
                        <button className="epm-btn-danger-sm" onClick={() => deleteShowcase(s.id)}>
                          🗑 Видалити
                        </button>
                      </div>

                      {/* Иллюстрация */}
                      {s.type === "illustration" && (
                        <div className="epm-illustration-box">
                          {s.items[0]?.illustrationUrl ? (
                            <div className="epm-illustration-preview">
                              <img src={s.items[0].illustrationUrl} alt="illustration" />
                              <button className="epm-illustration-remove"
                                onClick={() => removeShowcaseItem(s.id, s.items[0].id)}>✕</button>
                            </div>
                          ) : (
                            <button className="epm-illustration-upload" onClick={() => illustrationRef.current?.click()}>
                              📁 Завантажити зображення
                            </button>
                          )}
                          <input type="file" ref={illustrationRef} hidden
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={e => { const f = e.target.files[0]; if (f) uploadIllustration(s.id, f); }}
                          />
                        </div>
                      )}

                      {/* Скриншоты / инвентарь / игры */}
                      {s.type !== "illustration" && (
                        <div className="epm-showcase-items">
                          {s.items.map(it => (
                            <div key={it.id} className="epm-sc-item"
                              onClick={() => removeShowcaseItem(s.id, it.id)}
                              title="Натисніть щоб видалити"
                            >
                              {it.inventoryItem && (
                                <img src={it.inventoryItem.photoUrl} alt={it.inventoryItem.name}
                                  onError={e => (e.target.style.display = "none")} />
                              )}
                              {it.screenshot && (
                                <img src={it.screenshot.url} alt={it.screenshot.caption}
                                  onError={e => (e.target.style.display = "none")} />
                              )}
                              {it.game && (
                                <div className="epm-sc-game">
                                  <img src={it.game.photoUrl} alt={it.game.name}
                                    onError={e => (e.target.style.display = "none")} />
                                  <span>{it.game.name}</span>
                                </div>
                              )}
                              <div className="epm-sc-remove-hint">✕</div>
                            </div>
                          ))}
                          {s.items.length < 5 && (
                            <div className="epm-sc-add-placeholder"
                              onClick={() => setPickerOpen(pickerOpen === s.id ? null : s.id)}>
                              +
                            </div>
                          )}
                        </div>
                      )}

                      {pickerOpen === s.id && s.type !== "illustration" && (
                        <div className="epm-picker">
                          <ShowcasePicker
                            showcase={s}
                            inventory={inventory}
                            screenshots={screenshots}
                            library={library}
                            onAdd={body => addShowcaseItem(s.id, body)}
                          />
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: НАЛАШТУВАННЯ ── */}
          {activeTab === 5 && (
            <div className="epm-section">
              <p className="epm-settings-group-label">Приватність</p>
              <div className="epm-toggles-container">
                {PRIVACY_TOGGLES.map(({ key, label }) => (
                  <ToggleRow key={key} label={label} checked={privacy[key]}
                    onChange={val => setPrivacy(p => ({ ...p, [key]: val }))} />
                ))}
              </div>
              
              <p className="epm-settings-group-label mt-20">Блоки профілю</p>
              <div className="epm-toggles-container">
                {BLOCK_TOGGLES.map(({ key, label }) => (
                  <ToggleRow key={key} label={label} checked={privacy[key]}
                    onChange={val => setPrivacy(p => ({ ...p, [key]: val }))} />
                ))}
              </div>
            </div>
          )}

        </div>

        {error && <div className="epm-error-msg">{error}</div>}

        <div className="epm-footer">
          <button className="epm-btn-cancel" onClick={onClose}>Скасувати</button>
          <button className="epm-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Збереження..." : "Зберегти всі зміни"}
          </button>
        </div>

      </div>
    </div>
  );
}