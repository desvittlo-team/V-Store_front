import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GamesPage from "./pages/GamesPage";
import AdminPage from "./pages/AdminPage";
import LibraryPage from "./pages/LibraryPage";
import ScreenshotsPage from "./pages/ScreenshotsPage";
import UsersPage from "./pages/ChatPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [balance, setBalance] = useState(null);

  const fetchBalance = () => {
    if (!user?.token) return;

    fetch("https://localhost:7059/api/library/balance", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => res.json())
      .then(data => setBalance(data.balance))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();

    if (!user?.token) return;

    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} balance={balance} setBalance={setBalance}/>
      <Routes>
        <Route path="/" element={ <GamesPage user={user} balance={balance} onPurchase={fetchBalance}/>}/>
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="/library" element={<LibraryPage user={user} />} />
        <Route path="/users" element={<UsersPage user={user} />} />
        <Route path="/chat" element={<ChatPage user={user} />} />
        <Route path="/admin" element={ user?.role === "Admin" ? <AdminPage user={user} /> : <Navigate to="/" />}/>
        <Route path="/screenshots" element={<ScreenshotsPage user={user} />} />
        <Route path="/profile/:id" element={<ProfilePage user={user} setUser={setUser} />} />
        <Route path="/market" element={<MarketPage user={user} onPurchase={fetchBalance} />} />
      </Routes>
    </BrowserRouter>
  );
}