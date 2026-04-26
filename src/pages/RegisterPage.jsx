import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import '../style/Auth.css';

export default function RegisterPage({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Паролі не співпадають!");
      return;
    }
    try {
      const data = await register(username, email, password);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      navigate("/");
    } catch (err) {
      setError(err.message || "Помилка сервера. Можливо, БД не підключена.");
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Створіть новий акаунт</h2>
        {error && <p className="error-msg">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Логін</label>
            <input 
              type="text" 
              placeholder="Придумайте новий логін..." 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              placeholder="Введіть ваш e-mail..." 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Пароль</label>
            <input 
              type="password" 
              placeholder="Придумайте новий пароль..." 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Повторіть пароль</label>
            <input 
              type="password" 
              placeholder="Напишіть пароль ще раз..." 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="auth-options-row" style={{ marginTop: "10px" }}>
            <label className="custom-checkbox">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              Я погоджуюсь з <a href="#" className="terms-link"> Умовами використання</a>
            </label>
          </div>

          <div className="auth-action-box">
            <button type="submit" className="btn-primary">Продовжити</button>
            <p className="auth-switch-text">
              Маєте акаунт? <Link to="/login">Авторизуйтесь</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}