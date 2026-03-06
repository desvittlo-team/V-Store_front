import { useEffect, useState } from "react";
import { getGames, addGame, updateGame, deleteGame } from "../api/games";

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
    setPreview(`https://localhost:7059/pics/${game.photo}`);
    setPhotoFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const token = user?.token;

    if (!token) {
      setError("Не авторизован. Войдите заново.");
      return;
    }

    try {
      let photoName = form.photo;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const res = await fetch("https://localhost:7059/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Ошибка загрузки фото");
        const data = await res.json();
        photoName = data.fileName;
      }

      const gameData = { ...form, photo: photoName };

      if (editId) {
        const updated = await updateGame(editId, gameData, token);
        setGames(games.map((g) => (g.id === editId ? updated : g)));
        setEditId(null);
      } else {
        const created = await addGame(gameData, token);
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
    const token = user?.token;
    try {
      await deleteGame(id, token);
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

        <label className="photo-label" style={{ cursor: "pointer", border: "1px dashed #555", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
          {preview
            ? <img src={preview} alt="preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "6px" }} />
            : <span>Нажми чтобы выбрать фото</span>}
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
                  width={60}
                  onError={(e) => (e.target.style.display = "none")}
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