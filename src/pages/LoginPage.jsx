import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
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
        <h2 className="auth-title">Авторизуйтесь, щоб продовжити</h2>
        {error && <p className="error-msg">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Логін або e-mail</label>
            <input 
              type="email" 
              placeholder="Введіть ваш логін або e-mail..." 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Пароль</label>
            <input 
              type="password" 
              placeholder="Введіть ваш пароль..." 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="auth-options-row">
            <label className="custom-checkbox">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Запам'ятати мене
            </label>
            <Link to="/forgot-password" className="forgot-password-link">Не пам'ятаю пароль</Link>
          </div>

          <div className="auth-action-box">
            <button type="submit" className="btn-primary">Продовжити</button>
            <p className="auth-switch-text">
              Не маєте акаунту? <Link to="/register">Зареєструйтесь</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}