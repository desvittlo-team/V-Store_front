import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const API = "https://localhost:7059/api/chat";

export default function ChatPage({ user }) {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef();
  const pollRef = useRef();
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

  async function loadAllUsers() {
    if (!user?.token) return;
    const res = await fetch("https://localhost:7059/api/users", { headers });
    if (res.ok) {
      const data = await res.json();
      setAllUsers(data.filter(u => u.id !== user.id));
    }
  }

  useEffect(() => {
    loadConversations();
    loadAllUsers();
  }, [user]);

  // открыть чат если пришли со страницы гравців
  useEffect(() => {
    if (location.state?.partnerId) {
      setActivePartner({
        id: location.state.partnerId,
        username: location.state.partnerUsername,
        photo: ""
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (!activePartner) return;
    loadMessages(activePartner.id);
    pollRef.current = setInterval(() => {
      loadMessages(activePartner.id);
      loadConversations();
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [activePartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // поиск — фильтрует локально по allUsers
  useEffect(() => {
    if (search.length < 1) {
      setSearchResults([]);
      return;
    }
    const filtered = allUsers.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResults(filtered);
  }, [search, allUsers]);

  async function handleSend() {
    if (!text.trim() || !activePartner) return;
    const res = await fetch(`${API}/messages`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activePartner.id, text: text.trim() })
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setText("");
      loadConversations();
    }
  }

  function openChat(partner) {
    setActivePartner(partner);
    setSearch("");
    setSearchResults([]);
  }

  // список для левой панели — поиск или все юзеры
  const leftList = search.length >= 1 ? searchResults : allUsers;

  if (!user) return (
    <div style={{ textAlign: "center", marginTop: "100px", color: "#aaa" }}>
      <p>Увійдіть щоб використовувати чат</p>
    </div>
  );

  return (
    <div style={{
      display: "flex", height: "calc(100vh - 64px)",
      background: "#0f0f1a", color: "#fff", overflow: "hidden"
    }}>

      {/* Левая панель */}
      <div style={{
        width: "300px", borderRight: "1px solid #2a2a3e",
        display: "flex", flexDirection: "column", flexShrink: 0
      }}>

        {/* Поиск */}
        <div style={{ padding: "16px", borderBottom: "1px solid #2a2a3e" }}>
          <input
            type="text"
            placeholder="Пошук гравця..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: "8px",
              background: "#1a1a2e", border: "1px solid #333", color: "#fff",
              fontSize: "14px", outline: "none", boxSizing: "border-box"
            }}
          />
        </div>

        {/* Список пользователей */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <p style={{ color: "#555", fontSize: "11px", padding: "10px 16px 4px", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {search.length >= 1 ? "Результати пошуку" : "Всі гравці"}
          </p>

          {leftList.length === 0 && (
            <p style={{ color: "#555", padding: "20px", textAlign: "center", fontSize: "13px" }}>
              {search.length >= 1 ? "Нікого не знайдено" : "Немає користувачів"}
            </p>
          )}

          {leftList.map(u => {
            const conv = conversations.find(c => c.partner.id === u.id);
            const unread = conv?.unreadCount || 0;
            return (
              <div
                key={u.id}
                onClick={() => openChat(u)}
                style={{
                  padding: "12px 16px", cursor: "pointer", display: "flex",
                  alignItems: "center", gap: "12px",
                  background: activePartner?.id === u.id ? "#1a1a2e" : "transparent",
                  borderLeft: activePartner?.id === u.id ? "3px solid #7c3aed" : "3px solid transparent"
                }}
                onMouseEnter={e => { if (activePartner?.id !== u.id) e.currentTarget.style.background = "#111122"; }}
                onMouseLeave={e => { if (activePartner?.id !== u.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: u.role === "Admin" ? "#7c3aed" : "#2a2a3e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: "bold", flexShrink: 0, position: "relative"
                }}>
                  {u.username[0].toUpperCase()}
                  {unread > 0 && (
                    <span style={{
                      position: "absolute", top: "-4px", right: "-4px",
                      background: "#ef4444", color: "#fff", borderRadius: "50%",
                      width: "18px", height: "18px", fontSize: "11px",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {unread}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>{u.username}</span>
                    {u.role === "Admin" && (
                      <span style={{ background: "#7c3aed", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>
                        Admin
                      </span>
                    )}
                  </div>
                  {conv?.lastMessage && (
                    <p style={{ color: "#666", fontSize: "12px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.lastMessage.senderId === user.id ? "Ви: " : ""}{conv.lastMessage.text}
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
        {!activePartner ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "48px" }}>💬</div>
            <p style={{ color: "#555", fontSize: "16px" }}>Виберіть гравця щоб написати</p>
          </div>
        ) : (
          <>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #2a2a3e",
              display: "flex", alignItems: "center", gap: "12px", background: "#0f0f1a"
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", background: "#7c3aed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: "bold"
              }}>
                {activePartner.username[0].toUpperCase()}
              </div>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>{activePartner.username}</span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {messages.length === 0 && (
                <p style={{ color: "#555", textAlign: "center", marginTop: "40px", fontSize: "14px" }}>
                  Напишіть перше повідомлення 👋
                </p>
              )}
              {messages.map(msg => {
                const isMine = msg.senderId === user.id;
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "60%", padding: "10px 14px",
                      borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMine ? "#7c3aed" : "#1a1a2e",
                      border: isMine ? "none" : "1px solid #2a2a3e"
                    }}>
                      <p style={{ margin: 0, fontSize: "14px", wordBreak: "break-word" }}>{msg.text}</p>
                      <p style={{ margin: "4px 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.6)" : "#555", textAlign: "right" }}>
                        {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                        {isMine && <span style={{ marginLeft: "4px" }}>{msg.isRead ? " ✓✓" : " ✓"}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{
              padding: "16px 20px", borderTop: "1px solid #2a2a3e",
              display: "flex", gap: "12px", alignItems: "flex-end", background: "#0f0f1a"
            }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Напишіть повідомлення..."
                rows={1}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: "12px",
                  background: "#1a1a2e", border: "1px solid #333", color: "#fff",
                  fontSize: "14px", outline: "none", resize: "none",
                  fontFamily: "inherit", lineHeight: "1.5"
                }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                style={{
                  padding: "12px 20px", background: "#7c3aed", color: "#fff",
                  border: "none", borderRadius: "12px", cursor: "pointer",
                  fontSize: "18px", opacity: text.trim() ? 1 : 0.4,
                  transition: "opacity 0.2s"
                }}
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}