import { useEffect, useState } from "react";
import { getGames } from "../api/games";

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGames()
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Загрузка...</p>;

  return (
    <div className="games-page">
      <h1>Каталог игр</h1>
      <div className="games-grid">
        {games.map((game) => (
          <div className="game-card" key={game.id}>
            <img
              src={`https://localhost:7059/images/${game.photo}`}
              alt={game.name}
              onError={(e) => (e.target.src = "/placeholder.png")}
            />
            <h3>{game.name}</h3>
            <p>{game.surname}</p>
            <span>⭐ {game.gpa}</span>
          </div>
        ))}
      </div>
    </div>
  );
}