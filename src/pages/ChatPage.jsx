import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { IMAGE_ENDPOINTS, FALLBACK_IMAGE } from "../api/imageHelper";

const API = "https://localhost:7059/api/chat";
const GLOBAL_API = "https://localhost:7059/api/globalchat";

export default function ChatPage({ user }) {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [activeGlobal, setActiveGlobal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [globalMessages, setGlobalMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [moneyAmount, setMoneyAmount] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [myInventory, setMyInventory] = useState([]);
  const [selectedInvItem, setSelectedInvItem] = useState(null);
  const [viewImage, setViewImage] = useState(null); // просмотр фото в полном размере

  const messagesEndRef = useRef();
  const pollRef = useRef();
  const imageInputRef = useRef();
  const location = useLocation();

  const headers = { Authorization: `Bearer ${user?.token}` };

  async function loadConversations() {
    if (!user?.token) return;
    const res = await fetch(`${API}/conversations`, { headers });
    if (res.ok) setConversations(await res.json());
  }

  async function loadMessages(partnerId) {
    const res = await fetch(`${API}/messages/${partnerId}`, { headers });
    if (res.ok) setMessages(await res.json());
  }

  async function loadGlobalMessages() {
    const res = await fetch(GLOBAL_API);
    if (res.ok) setGlobalMessages(await res.json());
  }

  async function loadAllUsers() {
    if (!user?.token) return;
    const res = await fetch("https://localhost:7059/api/users", { headers });
    if (res.ok) {
      const data = await res.json();
      setAllUsers(data.filter(u => u.id !== user.id));
    }
  }

  async function loadMyInventory() {
    const res = await fetch("https://localhost:7059/api/market/inventory/my", { headers });
    if (res.ok) setMyInventory(await res.json());
  }

  useEffect(() => {
    loadConversations();
    loadAllUsers();
    loadGlobalMessages();
  }, [user]);

  useEffect(() => {
    if (location.state?.partnerId) {
      setActivePartner({ id: location.state.partnerId, username: location.state.partnerUsername, photo: "" });
      setActiveGlobal(false);
    }
  }, [location.state]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeGlobal) {
      pollRef.current = setInterval(loadGlobalMessages, 2000);
    } else if (activePartner) {
      loadMessages(activePartner.id);
      pollRef.current = setInterval(() => {
        loadMessages(activePartner.id);
        loadConversations();
      }, 2000);
    }
    return () => clearInterval(pollRef.current);
  }, [activePartner, activeGlobal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, globalMessages]);

  useEffect(() => {
    if (search.length < 1) { setSearchResults([]); return; }
    setSearchResults(allUsers.filter(u => u.username.toLowerCase().includes(search.toLowerCase())));
  }, [search, allUsers]);

  useEffect(() => {
    if (showItemModal && user?.token) loadMyInventory();
  }, [showItemModal]);

  async function handleSend() {
    if (!text.trim()) return;
    if (activeGlobal) {
      const res = await fetch(GLOBAL_API, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() })
      });
      if (res.ok) { const data = await res.json(); setGlobalMessages(prev => [...prev, data]); setText(""); }
      return;
    }
    if (!activePartner) return;
    const res = await fetch(`${API}/messages`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activePartner.id, text: text.trim() })
    });
    if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data]); setText(""); loadConversations(); }
  }

  async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);

    if (activeGlobal) {
      const res = await fetch(`${GLOBAL_API}/image`, {
        method: "POST",
        headers,
        body: formData
      });
      if (res.ok) { const data = await res.json(); setGlobalMessages(prev => [...prev, data]); }
    } else if (activePartner) {
      formData.append("receiverId", activePartner.id);
      const res = await fetch(`${API}/send-image`, {
        method: "POST",
        headers,
        body: formData
      });
      if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data]); loadConversations(); }
    }
  }

  async function handleSendMoney() {
    const amount = parseFloat(moneyAmount);
    if (!amount || amount <= 0) return;
    const res = await fetch(`${API}/send-money`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activePartner.id, amount })
    });
    if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data]); setShowMoneyModal(false); setMoneyAmount(""); loadConversations(); }
  }

  async function handleSendItem() {
    if (!selectedInvItem) return;
    const res = await fetch(`${API}/send-item`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activePartner.id, inventoryItemId: selectedInvItem })
    });
    if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data]); setShowItemModal(false); setSelectedInvItem(null); loadConversations(); }
  }

  function openChat(partner) { setActivePartner(partner); setActiveGlobal(false); setSearch(""); setSearchResults([]); }
  function openGlobal() { setActivePartner(null); setActiveGlobal(true); loadGlobalMessages(); }

  function renderMessage(msg) {
    const isMine = activeGlobal ? msg.userId === user.id : msg.senderId === user.id;
    const username = activeGlobal ? msg.username : null;

    let content;

    if (msg.type === "image") {
      const imgUrl = IMAGE_ENDPOINTS.chatImage(msg.imageFileName);
      content = (
        <div style={{ borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", overflow: "hidden", cursor: "pointer" }}
          onClick={() => setViewImage(imgUrl)}>
          <img src={imgUrl} alt="фото"
            style={{ maxWidth: "260px", maxHeight: "200px", objectFit: "cover", display: "block" }}
            onError={e => {
              e.target.src = FALLBACK_IMAGE;
              e.target.style.opacity = '0.6';
              e.target.style.backgroundColor = '#2a2a3e';
            }} />
          <div style={{ padding: "4px 8px", background: isMine ? "#7c3aed" : "#1a1a2e", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.6)" : "#555", textAlign: "right" }}>
            {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      );
    } else if (msg.type === "money") {
      content = (
        <div style={{ padding: "12px 16px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMine ? "#7c3aed" : "#1a1a2e", border: isMine ? "none" : "1px solid #2a2a3e", minWidth: "160px" }}>
          <p style={{ margin: 0, fontSize: "22px", textAlign: "center" }}>💰</p>
          <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: "bold", textAlign: "center", color: "#facc15" }}>{msg.amount}$</p>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.6)" : "#555", textAlign: "center" }}>{isMine ? "Відправлено" : "Отримано"}</p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.5)" : "#555", textAlign: "right" }}>
            {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      );
    } else if (msg.type === "item") {
      content = (
        <div style={{ padding: "12px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMine ? "#7c3aed" : "#1a1a2e", border: isMine ? "none" : "1px solid #2a2a3e", minWidth: "160px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", color: isMine ? "rgba(255,255,255,0.7)" : "#666" }}>🎁 {isMine ? "Відправлено предмет" : "Отримано предмет"}</p>
          {msg.item && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: "#2a2a3e", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {msg.item.photo && msg.item.photo !== "default_item.png"
                  ? <img src={IMAGE_ENDPOINTS.itemImage(msg.item.photo)} alt={msg.item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => {
                    e.target.style.display = "none";
                  }} />
                  : <span style={{ fontSize: "24px" }}>🎮</span>}
              </div>
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>{msg.item.name}</span>
            </div>
          )}
          <p style={{ margin: "6px 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.5)" : "#555", textAlign: "right" }}>
            {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      );
    } else {
      content = (
        <div style={{ padding: "10px 14px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMine ? "#7c3aed" : "#1a1a2e", border: isMine ? "none" : "1px solid #2a2a3e" }}>
          <p style={{ margin: 0, fontSize: "14px", wordBreak: "break-word" }}>{msg.text}</p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.6)" : "#555", textAlign: "right" }}>
            {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
            {!activeGlobal && isMine && <span style={{ marginLeft: "4px" }}>{msg.isRead ? " ✓✓" : " ✓"}</span>}
          </p>
        </div>
      );
    }

    return (
      <div key={msg.id} style={{ display: "flex", gap: "10px", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isMine ? "#7c3aed" : "#2a2a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "bold", flexShrink: 0 }}>
          {activeGlobal ? msg.username[0].toUpperCase() : (isMine ? user.username[0].toUpperCase() : activePartner?.username[0].toUpperCase())}
        </div>
        <div style={{ maxWidth: "60%" }}>
          {activeGlobal && !isMine && <p style={{ color: "#7c3aed", fontSize: "11px", margin: "0 0 3px 4px" }}>{username}</p>}
          {content}
        </div>
      </div>
    );
  }

  const leftList = search.length >= 1 ? searchResults : allUsers;
  const currentMessages = activeGlobal ? globalMessages : messages;

  if (!user) return (
    <div style={{ textAlign: "center", marginTop: "100px", color: "#aaa" }}>
      <p>Увійдіть щоб використовувати чат</p>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", background: "#0f0f1a", color: "#fff", overflow: "hidden" }}>

      {/* Левая панель */}
      <div style={{ width: "300px", borderRight: "1px solid #2a2a3e", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #2a2a3e" }}>
          <input type="text" placeholder="Пошук гравця..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#1a1a2e", border: "1px solid #333", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>

        <div onClick={openGlobal} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: activeGlobal ? "#1a1a2e" : "transparent", borderLeft: activeGlobal ? "3px solid #e879f9" : "3px solid transparent", borderBottom: "1px solid #2a2a3e" }}
          onMouseEnter={e => { if (!activeGlobal) e.currentTarget.style.background = "#111122"; }}
          onMouseLeave={e => { if (!activeGlobal) e.currentTarget.style.background = "transparent"; }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #e879f9, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🌍</div>
          <div>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>Глобальний чат</p>
            <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Всі гравці</p>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          <p style={{ color: "#555", fontSize: "11px", padding: "10px 16px 4px", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {search.length >= 1 ? "Результати пошуку" : "Всі гравці"}
          </p>
          {leftList.length === 0 && <p style={{ color: "#555", padding: "20px", textAlign: "center", fontSize: "13px" }}>{search.length >= 1 ? "Нікого не знайдено" : "Немає користувачів"}</p>}
          {leftList.map(u => {
            const conv = conversations.find(c => c.partner.id === u.id);
            const unread = conv?.unreadCount || 0;
            return (
              <div key={u.id} onClick={() => openChat(u)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: activePartner?.id === u.id ? "#1a1a2e" : "transparent", borderLeft: activePartner?.id === u.id ? "3px solid #7c3aed" : "3px solid transparent" }}
                onMouseEnter={e => { if (activePartner?.id !== u.id) e.currentTarget.style.background = "#111122"; }}
                onMouseLeave={e => { if (activePartner?.id !== u.id) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: u.role === "Admin" ? "#7c3aed" : "#2a2a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", flexShrink: 0, position: "relative" }}>
                  {u.username[0].toUpperCase()}
                  {unread > 0 && <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>{u.username}</span>
                    {u.role === "Admin" && <span style={{ background: "#7c3aed", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>Admin</span>}
                  </div>
                  {conv?.lastMessage && (
                    <p style={{ color: "#666", fontSize: "12px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.lastMessage.senderId === user.id ? "Ви: " : ""}
                      {conv.lastMessage.type === "money" ? "💰 Гроші" : conv.lastMessage.type === "item" ? "🎁 Предмет" : conv.lastMessage.type === "image" ? "📷 Фото" : conv.lastMessage.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Правая панель */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!activePartner && !activeGlobal ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "48px" }}>💬</div>
            <p style={{ color: "#555", fontSize: "16px" }}>Виберіть гравця або глобальний чат</p>
          </div>
        ) : (
          <>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: "12px", background: "#0f0f1a" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: activeGlobal ? "linear-gradient(135deg, #e879f9, #7c3aed)" : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: activeGlobal ? "18px" : "16px", fontWeight: "bold" }}>
                {activeGlobal ? "🌍" : activePartner?.username[0].toUpperCase()}
              </div>
              <div>
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>{activeGlobal ? "Глобальний чат" : activePartner?.username}</span>
                {activeGlobal && <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Всі гравці бачать повідомлення</p>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {currentMessages.length === 0 && (
                <p style={{ color: "#555", textAlign: "center", marginTop: "40px", fontSize: "14px" }}>
                  {activeGlobal ? "Поки немає повідомлень 🌍" : "Напишіть перше повідомлення 👋"}
                </p>
              )}
              {currentMessages.map(msg => renderMessage(msg))}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #2a2a3e", display: "flex", gap: "8px", alignItems: "flex-end", background: "#0f0f1a" }}>

              {/* Кнопка фото — для всех чатов */}
              <button onClick={() => imageInputRef.current.click()} title="Відправити фото"
                style={{ padding: "12px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "10px", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>
                📷
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />

              {/* Кнопки денег и предметов — только в личном чате */}
              {!activeGlobal && (
                <>
                  <button onClick={() => setShowMoneyModal(true)} title="Відправити гроші"
                    style={{ padding: "12px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "10px", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>
                    💰
                  </button>
                  <button onClick={() => setShowItemModal(true)} title="Відправити предмет"
                    style={{ padding: "12px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "10px", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>
                    🎁
                  </button>
                </>
              )}

              <textarea value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={activeGlobal ? "Написати всім..." : "Написати повідомлення..."}
                rows={1}
                style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", background: "#1a1a2e", border: "1px solid #333", color: "#fff", fontSize: "14px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: "1.5" }} />
              <button onClick={handleSend} disabled={!text.trim()}
                style={{ padding: "12px 20px", background: activeGlobal ? "linear-gradient(135deg, #e879f9, #7c3aed)" : "#7c3aed", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "18px", opacity: text.trim() ? 1 : 0.4 }}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>

      {/* Просмотр фото в полном размере */}
      {viewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
          onClick={() => setViewImage(null)}>
          <img src={viewImage} alt="фото" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px", objectFit: "contain" }} />
          <button onClick={() => setViewImage(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer", borderRadius: "50%", width: "40px", height: "40px" }}>
            ✕
          </button>
        </div>
      )}

      {/* Модалка отправки денег */}
      {showMoneyModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowMoneyModal(false)}>
          <div style={{ background: "#1a1a2e", borderRadius: "14px", padding: "28px", width: "320px", maxWidth: "90vw" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#fff", marginBottom: "8px" }}>💰 Відправити гроші</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "13px" }}>Отримувач: <strong style={{ color: "#fff" }}>{activePartner?.username}</strong></p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[5, 10, 25, 50].map(amt => (
                <button key={amt} onClick={() => setMoneyAmount(String(amt))}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer", background: moneyAmount === String(amt) ? "#7c3aed" : "#2a2a3e", color: "#fff", border: "none", fontSize: "13px" }}>
                  {amt}$
                </button>
              ))}
            </div>
            <input type="number" placeholder="Своя сума..." value={moneyAmount} onChange={e => setMoneyAmount(e.target.value)} min="0.01" step="0.01"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#2a2a3e", border: "1px solid #333", color: "#fff", marginBottom: "16px", boxSizing: "border-box", outline: "none" }} />
            <button onClick={handleSendMoney} disabled={!moneyAmount}
              style={{ width: "100%", padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "8px", opacity: moneyAmount ? 1 : 0.4 }}>
              Відправити
            </button>
            <button onClick={() => { setShowMoneyModal(false); setMoneyAmount(""); }}
              style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", cursor: "pointer" }}>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Модалка отправки предмета */}
      {showItemModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowItemModal(false)}>
          <div style={{ background: "#1a1a2e", borderRadius: "14px", padding: "28px", width: "420px", maxWidth: "90vw" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#fff", marginBottom: "8px" }}>🎁 Відправити предмет</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "13px" }}>Отримувач: <strong style={{ color: "#fff" }}>{activePartner?.username}</strong></p>
            {myInventory.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", margin: "20px 0" }}>Інвентар порожній</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px", maxHeight: "220px", overflowY: "auto" }}>
                {myInventory.map(ii => (
                  <div key={ii.id} onClick={() => setSelectedInvItem(ii.id)}
                    style={{ background: selectedInvItem === ii.id ? "#7c3aed" : "#2a2a3e", borderRadius: "8px", padding: "10px", cursor: "pointer", border: selectedInvItem === ii.id ? "2px solid #a855f7" : "2px solid transparent", textAlign: "center" }}>
                    {ii.item.photo && ii.item.photo !== "default_item.png"
                      ? <img src={`https://localhost:7059/items/${ii.item.photo}`} alt={ii.item.name} style={{ width: "100%", height: "55px", objectFit: "cover", borderRadius: "4px", marginBottom: "6px" }} onError={e => e.target.style.display = "none"} />
                      : <div style={{ fontSize: "26px", marginBottom: "6px" }}>🎮</div>}
                    <p style={{ color: "#fff", fontSize: "11px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ii.item.name}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleSendItem} disabled={!selectedInvItem}
              style={{ width: "100%", padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "8px", opacity: selectedInvItem ? 1 : 0.4 }}>
              Відправити
            </button>
            <button onClick={() => { setShowItemModal(false); setSelectedInvItem(null); }}
              style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", cursor: "pointer" }}>
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}