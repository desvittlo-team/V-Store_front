// GlobalChat.jsx — глобальний чат (бачать усі гравці)

import { useEffect, useState, useRef } from "react";

const GLOBAL_API = "https://localhost:7059/api/globalchat";

export default function GlobalChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [viewImage, setViewImage] = useState(null);
  const messagesEndRef = useRef();
  const imageInputRef = useRef();
  const pollRef = useRef();

  const headers = { Authorization: `Bearer ${user?.token}` };

  async function loadMessages() {
    const res = await fetch(GLOBAL_API);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 2000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!text.trim()) return;
    const res = await fetch(GLOBAL_API, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() })
    });
    if (res.ok) {
      const newMessage = await res.json();
      setMessages(prev => [...prev, newMessage]);
      setText("");
    }
  }

  async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${GLOBAL_API}/image`, { method: "POST", headers, body: formData });
    if (res.ok) {
      const newMessage = await res.json();
      setMessages(prev => [...prev, newMessage]);
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

      {/* Шапка */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: "12px", background: "#0f0f1a" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #e879f9, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
          🌍
        </div>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>Глобальний чат</span>
          <p style={{ margin: 0, color: "#666", fontSize: "12px" }}>Всі гравці бачать повідомлення</p>
        </div>
      </div>

      {/* Повідомлення */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {messages.length === 0 && (
          <p style={{ color: "#555", textAlign: "center", marginTop: "40px" }}>Поки немає повідомлень 🌍</p>
        )}
        {messages.map(msg => {
          const isMine = msg.userId === user?.id;
          return (
            <div key={msg.id} style={{ display: "flex", gap: "10px", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isMine ? "#7c3aed" : "#2a2a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "bold", flexShrink: 0 }}>
                {msg.username[0].toUpperCase()}
              </div>
              <div style={{ maxWidth: "60%" }}>
                {!isMine && (
                  <p style={{ color: "#7c3aed", fontSize: "11px", margin: "0 0 3px 4px" }}>{msg.username}</p>
                )}
                {msg.type === "image" ? (
                  <div
                    style={{ borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", overflow: "hidden", cursor: "pointer" }}
                    onClick={() => setViewImage(`https://localhost:7059/chat-images/${msg.imageFileName}`)}
                  >
                    <img
                      src={`https://localhost:7059/chat-images/${msg.imageFileName}`}
                      alt="фото"
                      style={{ maxWidth: "260px", maxHeight: "200px", objectFit: "cover", display: "block" }}
                      onError={e => e.target.style.display = "none"}
                    />
                    <div style={{ padding: "4px 8px", background: isMine ? "#7c3aed" : "#1a1a2e", fontSize: "11px", color: "#555", textAlign: "right" }}>
                      {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "10px 14px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMine ? "#7c3aed" : "#1a1a2e", border: isMine ? "none" : "1px solid #2a2a3e" }}>
                    <p style={{ margin: 0, fontSize: "14px", wordBreak: "break-word" }}>{msg.text}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.6)" : "#555", textAlign: "right" }}>
                      {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле вводу */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #2a2a3e", display: "flex", gap: "8px", alignItems: "flex-end", background: "#0f0f1a" }}>
        <button
          onClick={() => imageInputRef.current.click()}
          style={{ padding: "12px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "10px", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}
        >
          📷
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Написати всім..."
          rows={1}
          style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", background: "#1a1a2e", border: "1px solid #333", color: "#fff", fontSize: "14px", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: "1.5" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{ padding: "12px 20px", background: "linear-gradient(135deg, #e879f9, #7c3aed)", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "18px", opacity: text.trim() ? 1 : 0.4 }}
        >
          ➤
        </button>
      </div>

      {/* Перегляд фото */}
      {viewImage && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
          onClick={() => setViewImage(null)}
        >
          <img src={viewImage} alt="фото" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px" }} />
          <button
            onClick={() => setViewImage(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer", borderRadius: "50%", width: "40px", height: "40px" }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
