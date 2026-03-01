import { useEffect, useState } from "react";

export default function GameList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://localhost:7059/api/games")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div>
      <h1>Список игр</h1>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Разработчик</th>
            <th>Возраст</th>
            <th>Рейтинг</th>
            <th>Фото</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.name}</td>
              <td>{game.surname}</td>
              <td>{game.age}</td>
              <td>{game.gpa}</td>
              <td>
                <img
                  src={`https://localhost:7059/images/${game.photo}`}
                  alt={game.name}
                  width={60}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}