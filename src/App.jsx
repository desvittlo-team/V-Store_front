import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GamesPage from "./pages/GamesPage";
import AdminPage from "./pages/AdminPage";
import LibraryPage from "./pages/LibraryPage";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [balance, setBalance] = useState(null);

  const fetchBalance = useCallback(() => {
    if (!user?.token) return;
    fetch("https://localhost:7059/api/library/balance", {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setBalance(data.balance))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // автообновление каждые 3 секунды
  useEffect(() => {
    if (!user?.token) return;
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} balance={balance} setBalance={setBalance} />
      <Routes>
        <Route path="/" element={<GamesPage user={user} balance={balance} onPurchase={fetchBalance} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="/library" element={<LibraryPage user={user} />} />
        <Route path="/admin" element={user?.role === "Admin" ? <AdminPage user={user} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}