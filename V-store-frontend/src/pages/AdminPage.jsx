import { useEffect, useState } from "react";
import { getGames, addGame, updateGame, deleteGame } from "../api/games";

const empty = { name: "", surname: "", age: 0, gpa: 0, photo: "" };

export default function AdminPage({ user }) {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    getGames().then(setGames);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      let photoName = form.photo;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);

        const res = await fetch("https://localhost:7059/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });
        const data = await res.json();
        photoName = data.fileName;
      }

      const gameData = { ...form, photo: photoName };

      if (editId) {
        const updated = await updateGame(editId, gameData, user.token);
        setGames(games.map((g) => (g.id === editId ? updated : g)));
        setEditId(null);
      } else {
        const created = await addGame(gameData, user.token);
        setGames([...games, created]);
      }

      setForm(empty);
      setPhotoFile(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(game) {
    setEditId(game.id);
    setForm({
      name: game.name,
      surname: game.surname,
      age: game.age,
      gpa: game.gpa,
      photo: game.photo,
    });
  }

  async function handleDelete(id) {
    if (!confirm("Удалить игру?")) return;
    try {
      await deleteGame(id, user.token);
      setGames(games.filter((g) => g.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-page">
      <h1>Админ панель</h1>
      {error && <p className="error">{error}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editId ? "Редактировать игру" : "Добавить игру"}</h2>
        <input name="name" placeholder="Название" value={form.name} onChange={handleChange} required />
        <input name="surname" placeholder="Разработчик" value={form.surname} onChange={handleChange} required />
        <input name="age" type="number" placeholder="Возраст" value={form.age} onChange={handleChange} />
        <input name="gpa" type="number" step="0.1" placeholder="Рейтинг" value={form.gpa} onChange={handleChange} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />
        <div className="form-buttons">
          <button type="submit">{editId ? "Сохранить" : "Добавить"}</button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm(empty); }}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Разработчик</th>
            <th>Рейтинг</th>
            <th>Фото</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.name}</td>
              <td>{game.surname}</td>
              <td>{game.gpa}</td>
              <td>
                <img
                  src={`https://localhost:7059/pics/${game.photo}`}
                  alt={game.name}
                  width={60}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </td>
              <td>
                <button onClick={() => handleEdit(game)}>✏️</button>
                <button onClick={() => handleDelete(game.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}