// UserList.jsx — бічна панель: пошук + список юзерів/розмов

export default function UserList({ user, conversations, allUsers, search, setSearch, activePartner, onOpenChat }) {
  const leftList = search.length >= 1
  ? allUsers
  : conversations.map(c => c.partner);
  return (
    <div className="chat-sidebar">
      <div className="chat-search-box">
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="chat-search-input"
        />
      </div>

      <div className="chat-user-list">
        {leftList.map(u => {
          const conv = conversations.find(c => c.partner.id === u.id);
          const unread = conv?.unreadCount || 0;
          return (
            <div
              key={u.id}
              onClick={() => onOpenChat(u)}
              className={`chat-user-item ${activePartner?.id === u.id ? "active" : ""}`}
            >
              <div className="chat-avatar">
                {u.username[0].toUpperCase()}
                {unread > 0 && <span className="unread-badge">{unread}</span>}
              </div>
              <div className="chat-user-info">
                <div className="chat-username-row">
                  <span className="chat-username">{u.username}</span>
                  {conv && <span className="chat-date">Сьогодні</span>}
                </div>
                {conv?.lastMessage && (
                  <p className="chat-last-message">
                    {conv.lastMessage.senderId === user.id ? "Ви: " : ""}
                    {conv.lastMessage.type === "image" ? "Фото" : conv.lastMessage.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
