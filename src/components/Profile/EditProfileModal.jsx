import React, { useState, useRef, useEffect } from "react";
import "../../style/EditProfileModal.css";

const TABS = ["Загальне", "Аватар", "Фон", "Вітрини", "Налаштування"];

export default function EditProfileModal({ user, profileData, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --- СТАН ДАНИХ ---
  const [username, setUsername] = useState(profileData?.user?.username || "");
  const [bio, setBio] = useState(profileData?.user?.bio || "");
  const [usernameStatus, setUsernameStatus] = useState("idle");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedAvatarItem, setSelectedAvatarItem] = useState(null);

  const [selectedBg, setSelectedBg] = useState(profileData?.user?.background || null);

  const [showcases, setShowcases] = useState(profileData?.showcases || []);
  const [newShowcaseName, setNewShowcaseName] = useState("");

  const [hideComments, setHideComments] = useState(profileData?.user?.hideComments || false);
  const [privateLibrary, setPrivateLibrary] = useState(profileData?.user?.privateLibrary || false);

  const [inventory, setInventory] = useState([]);
  const [bgInventory, setBgInventory] = useState([]);

  const BASE = "https://localhost:7059";

  // Завантаження інвентаря
  useEffect(() => {
    if (!user?.token) return;
    fetch(`${BASE}/api/inventory/me`, { 
      headers: { Authorization: `Bearer ${user.token}` } 
    })
      .then(r => r.ok ? r.json() : [])
      .then(items => {
        setInventory(items.filter(i => i.type !== "profile_background"));
        setBgInventory(items.filter(i => i.type === "profile_background"));
      })
      .catch(err => console.error("Inventory load failed", err));
  }, [user]);

  // --- ЛОГІКА ВАЛІДАЦІЇ ---
  const validateUsername = (val) => {
    if (/^[a-zA-Z0-9_]{3,20}$/.test(val)) setUsernameStatus("ok");
    else setUsernameStatus("error");
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Дозволені формати: JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Максимальний розмір файлу — 5MB");
      return;
    }
    setAvatarFile(file);
    setSelectedAvatarItem(null);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  // --- ЛОГІКА ВІТРИН ---
  const addShowcase = () => {
    const name = newShowcaseName.trim();
    if (!name) return;
    setShowcases(prev => [...prev, { id: Date.now(), name, items: [] }]);
    setNewShowcaseName("");
  };

  const addItemToShowcase = (showcaseId, item) => {
    setShowcases(prev => prev.map(s => {
      if (s.id === showcaseId && s.items.length < 10) {
        return { ...s, items: [...s.items, item] };
      }
      return s;
    }));
  };

  const removeItemFromShowcase = (showcaseId, itemId) => {
    setShowcases(prev => prev.map(s => {
      if (s.id === showcaseId) {
        return { ...s, items: s.items.filter(i => i.id !== itemId) };
      }
      return s;
    }));
  };

  // --- ЗБЕРЕЖЕННЯ ---
  const handleSave = async () => {
    if (usernameStatus === "error") {
      setError("Виправте помилки в імені користувача");
      return;
    }

    setSaving(true);
    setError("");
    const headers = { 
      Authorization: `Bearer ${user.token}`,
      "Content-Type": "application/json"
    };

    try {
      // 1. Аватар (якщо файл)
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        await fetch(`${BASE}/api/profile/me/avatar`, { 
          method: "POST", 
          headers: { Authorization: `Bearer ${user.token}` }, 
          body: fd 
        });
      }

      // 2. Основні дані
      const payload = {
        username: username.trim(),
        bio: bio.trim(),
        avatarInventoryItemId: selectedAvatarItem?.id || null,
        backgroundInventoryItemId: selectedBg?.id || null,
        hideComments,
        privateLibrary,
        showcases: showcases.map(s => ({
          name: s.name,
          itemIds: s.items.map(i => i.id)
        }))
      };

      const res = await fetch(`${BASE}/api/profile/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Сервер відхилив зміни");

      const updatedData = await res.json();
      onSaved?.(updatedData);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const currentAvatarUrl = avatarPreview || selectedAvatarItem?.imageUrl || 
    (profileData?.user?.photo ? `${BASE}/avatars/${profileData.user.photo}` : "/no-image.png");

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
          {/* TAB 0: GENERAL */}
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

          {/* TAB 1: AVATAR */}
          {activeTab === 1 && (
            <div className="epm-section">
              <div className="epm-avatar-setup">
                <div className="epm-preview-main">
                  <img src={currentAvatarUrl} alt="Preview" />
                  <button onClick={() => fileInputRef.current.click()}>Завантажити фото</button>
                  <input type="file" ref={fileInputRef} hidden onChange={handleAvatarFile} accept="image/*" />
                </div>
                <div className="epm-inventory-sub">
                  <p>Або виберіть предмет:</p>
                  <div className="epm-grid-mini">
                    {inventory.map(item => (
                      <div key={item.id} className={`epm-item ${selectedAvatarItem?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedAvatarItem(item)}>
                        <img src={item.imageUrl} title={item.name} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND */}
          {activeTab === 2 && (
            <div className="epm-section">
              <p>Доступні фони з інвентаря:</p>
              <div className="epm-grid-bg">
                {bgInventory.map(item => (
                  <div key={item.id} className={`epm-bg-card ${selectedBg?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedBg(item)}>
                    <img src={item.imageUrl} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHOWCASES */}
          {activeTab === 3 && (
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
                          <img src={it.imageUrl} />
                        </div>
                      ))}
                      {s.items.length < 5 && <div className="epm-sc-add-placeholder">+</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 4 && (
            <div className="epm-section">
              <ToggleRow label="Приховати коментарі" checked={hideComments} onChange={setHideComments} />
              <ToggleRow label="Приватна бібліотека" checked={privateLibrary} onChange={setPrivateLibrary} />
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