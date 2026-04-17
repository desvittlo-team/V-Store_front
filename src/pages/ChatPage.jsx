// ChatPage.jsx — головний файл: збирає UserList, PrivateChat, GlobalChat
// Перемикання між "Особисті" та "Глобальний" вкладками

import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import UserList from "../components/chat/UserList";
import PrivateChat from "../components/chat/PrivateChat";
import GlobalChat from "../components/chat/GlobalChat";

const API = "https://localhost:7059/api/chat";

export default function ChatPage({ user }) {
  const [tab, setTab] = useState("private"); // "private" | "global"

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  const pollRef = useRef();
  const fileInputRef = useRef();
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

  async function searchUsers(query) {
  if (!query || query.length < 2) { setAllUsers([]); return; }
  const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`, { headers });
  if (res.ok) setAllUsers(await res.json());
}
    useEffect(() => {
    loadConversations();
  }, [user]);
  useEffect(() => {
    if (location.state?.partnerId) {
      setActivePartner({ id: location.state.partnerId, username: location.state.partnerUsername, photo: "" });
      setTab("private");
    }
  }, [location.state]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (activePartner && tab === "private") {
      loadMessages(activePartner.id);
      pollRef.current = setInterval(() => {
        loadMessages(activePartner.id);
        loadConversations();
      }, 2000);
    }
    return () => clearInterval(pollRef.current);
  }, [activePartner, tab]);

  async function handleSend() {
    if (!text.trim() || !activePartner) return;
    const res = await fetch(`${API}/messages`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activePartner.id, text: text.trim() })
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setText("");
      loadConversations();
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file || !activePartner) return;
    e.target.value = "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("receiverId", activePartner.id);
    const res = await fetch(`${API}/send-image`, { method: "POST", headers, body: formData });
    if (res.ok) {
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      loadConversations();
    }
  }

  function openChat(partner) {
    setActivePartner(partner);
    setSearch("");
  }

  if (!user) return <div className="chat-empty-state">Увійдіть щоб використовувати чат</div>;

  return (
    <div className="chat-layout">

      {/* Ліва панель: вкладки + список */}
      <div className="chat-sidebar">

        {/* Перемикач вкладок */}
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a3e" }}>
          <button
            onClick={() => setTab("private")}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: tab === "private" ? "2px solid #7c3aed" : "2px solid transparent",
              color: tab === "private" ? "#fff" : "#666",
              cursor: "pointer",
              fontWeight: tab === "private" ? "bold" : "normal",
              fontSize: "13px",
              transition: "all 0.2s"
            }}
          >
            💬 Особисті
          </button>
          <button
            onClick={() => setTab("global")}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: tab === "global" ? "2px solid #e879f9" : "2px solid transparent",
              color: tab === "global" ? "#fff" : "#666",
              cursor: "pointer",
              fontWeight: tab === "global" ? "bold" : "normal",
              fontSize: "13px",
              transition: "all 0.2s"
            }}
          >
            🌍 Глобальний
          </button>
        </div>

        {/* Список юзерів — тільки у вкладці "Особисті" */}
        {tab === "private" && (
          <UserList
            user={user}
            conversations={conversations}
            allUsers={allUsers}
            search={search}
            setSearch={setSearch}
            activePartner={activePartner}
            onOpenChat={openChat}
          />
        )}

        {/* У вкладці "Глобальний" список не потрібен */}
        {tab === "global" && (
          <div style={{ padding: "20px 16px", color: "#555", fontSize: "13px", textAlign: "center" }}>
            Загальний чат для всіх гравців
          </div>
        )}
      </div>

      {/* Права частина */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {tab === "private" ? (
          <PrivateChat
            user={user}
            activePartner={activePartner}
            messages={messages}
            text={text}
            setText={setText}
            onSend={handleSend}
            onFileSelect={handleFileSelect}
            viewImage={viewImage}
            setViewImage={setViewImage}
          />
        ) : (
          <GlobalChat user={user} />
        )}
      </div>

    </div>
  );
}
