import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">VStore</Link>
      <div className="nav-links">
        <Link to="/">Игры</Link>
        {user?.role === "Admin" && <Link to="/admin">Админ</Link>}
        {user ? (
          <>
            <span>{user.username}</span>
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}