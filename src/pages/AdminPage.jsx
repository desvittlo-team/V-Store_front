import { useEffect, useState } from "react";
import { getGames, addGame, updateGame, deleteGame } from "../api/games";
import "../style/AdminPage.css"; 
import binIcon from "../assets/bin.png";   
import changeIcon from "../assets/change.png";

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
    <div className="admin-page main-container">
      <div className="admin-header">
        <h1 className="admin-title">Админ панель</h1>
      </div>
      
      {error && <div className="toast-notification admin-error">{error}</div>}

      <div className="admin-content">
        {/* ФОРМА ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ */}
        <form className="admin-form-panel" onSubmit={handleSubmit}>
          <h2>{editId ? "Редактировать игру" : "Добавить игру"}</h2>
          
          <div className="admin-form-grid">
            <input className="admin-input" name="name" placeholder="Название *" value={form.name} onChange={handleChange} required />
            <input className="admin-input" name="surname" placeholder="Разработчик *" value={form.surname} onChange={handleChange} required />
            <input className="admin-input" name="age" type="number" placeholder="Возраст" value={form.age} onChange={handleChange} />
            <input className="admin-input" name="gpa" type="number" step="0.1" placeholder="Рейтинг" value={form.gpa} onChange={handleChange} />
          </div>

          <label className="admin-photo-label">
            {preview
              ? <img src={preview} alt="preview" className="admin-preview-img" />
              : <span>📷 Нажми чтобы выбрать обложку</span>}
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </label>

          <div className="admin-form-actions">
            <button className="btn-primary" type="submit">
              {editId ? "Сохранить изменения" : "+ Добавить игру"}
            </button>
            {editId && (
              <button className="btn-cancel" type="button" onClick={() => { setEditId(null); setForm(empty); setPreview(null); }}>
                Отмена
              </button>
            )}
          </div>
        </form>

        {/* ТАБЛИЦА ИГР */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Обложка</th>
                <th>Название</th>
                <th>Разработчик</th>
                <th>Рейтинг</th>
                <th className="center-col">Действия</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="admin-id-col">#{game.id}</td>
                  <td>
                    <div className="admin-table-img-wrapper">
                      <img
                        src={`https://localhost:7059/images/${game.photo}`}
                        alt={game.name}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                  </td>
                  <td className="admin-name-col">{game.name}</td>
                  <td className="admin-dev-col">{game.surname}</td>
                  <td className="admin-rating-col">{game.gpa} <span style={{color: '#f5a623'}}>★</span></td>
                  <td className="admin-actions-col">
                    <button className="icon-action-btn" onClick={() => handleEdit(game)} title="Редактировать">
                      <img src={changeIcon} alt="edit" />
                    </button>
                    <button className="icon-action-btn danger" onClick={() => handleDelete(game.id)} title="Удалить">
                      <img src={binIcon} alt="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}