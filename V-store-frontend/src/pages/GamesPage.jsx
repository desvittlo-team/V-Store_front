import { useEffect, useState } from "react";
import { getGames, deleteGame } from "../api/games";
import { useNavigate } from "react-router-dom";

export default function GamesPage({ user }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getGames()
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Удалить игру?")) return;
    const token = user?.token;
    try {
      await deleteGame(id, token);
      setGames(games.filter((g) => g.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p className="loading">Загрузка...</p>;

  return (
    <div className="games-page">
      <h1>Каталог игр</h1>
      {user?.role === "Admin" && (
        <button onClick={() => navigate("/admin")} style={{ marginBottom: "20px", padding: "10px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          + Добавить игру
        </button>
      )}
      <div className="games-grid">
        {games.map((game) => (
          <div className="game-card" key={game.id}>
                <img
                  src={`https://localhost:7059/images/${game.photo}`}
                  alt={game.name}
                  width={60}
                  onError={(e) => (e.target.style.display = "none")}
                />
            <h3>{game.name}</h3>
            <p>{game.surname}</p>
            <span>⭐ {game.gpa}</span>
            {user?.role === "Admin" && (
              <div style={{ padding: "8px 12px", display: "flex", gap: "8px" }}>
                <button onClick={() => navigate(`/admin?edit=${game.id}`)}>✏️</button>
                <button onClick={() => handleDelete(game.id)}>🗑️</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}