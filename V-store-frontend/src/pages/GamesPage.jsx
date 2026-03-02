import { useEffect, useState } from "react";
import { getGames, addGame, updateGame, deleteGame, uploadPhoto } from "../api/games";

const empty = { name: "", surname: "", age: 0, gpa: 0, photo: "" };

export default function AdminPage({ user }) {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getGames().then(setGames);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
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
    setPreview(`http://localhost:7059/pics/${game.photo}`);
    setPhotoFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      let photo = form.photo;
      if (photoFile) {
        photo = await uploadPhoto(photoFile, user.token);
      }
      if (editId) {
        const updated = await updateGame(editId, { ...form, photo }, user.token);
        setGames(games.map((g) => (g.id === editId ? updated : g)));
        setEditId(null);
      } else {
        const created = await addGame({ ...form, photo }, user.token);
        setGames([...games, created]);
      }
      setForm(empty);
      setPreview(null);
      setPhotoFile(null);
    } catch (err) {
      setError(err.message);
    }
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

        <label className="photo-label">
          {preview
            ? <img src={preview} alt="preview" className="photo-preview" />
            : <span>Выбрать фото</span>
          }
          <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
        </label>

        <div className="form-buttons">
          <button type="submit">{editId ? "Сохранить" : "Добавить"}</button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm(empty); setPreview(null); }}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Фото</th>
            <th>Название</th>
            <th>Разработчик</th>
            <th>Рейтинг</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>
              <img
                src={`https://localhost:7059/images/${game.photo}`}
                alt={game.name}
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
              </td>
              <td>{game.name}</td>
              <td>{game.surname}</td>
              <td>{game.gpa}</td>
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