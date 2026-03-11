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
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Вход</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Войти</button>
        </form>
        <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      </div>
    </div>
  );
}