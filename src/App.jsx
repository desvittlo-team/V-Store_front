import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GamesPage from "./pages/GamesPage";
import AdminPage from "./pages/AdminPage";
import LibraryPage from "./pages/LibraryPage";
import ChatPage from "./pages/ChatPage"; 
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import GameDetailsPage from "./pages/GameDetailsPage"; 
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [balance, setBalance] = useState(0);

  const fetchBalance = () => {
    if (!user?.token) return;
    fetch("https://localhost:7059/api/library/balance", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => res.ok ? res.json() : { balance: 0 })
      .then(data => setBalance(data.balance))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} balance={balance} setBalance={setBalance} />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<GamesPage user={user} balance={balance} onPurchase={fetchBalance}/>}/>
          <Route path="/game/:id" element={<GameDetailsPage user={user} />} /> 
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/library" element={<LibraryPage user={user} />} />
          <Route path="/chat" element={<ChatPage user={user} />} />
          <Route path="/cart" element={<CartPage user={user} />} />
          <Route path="/admin" element={user?.role === "Admin" ? <AdminPage user={user} /> : <Navigate to="/" />}/>
          <Route path="/profile/:id" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="/market" element={<MarketPage user={user} onPurchase={fetchBalance} />} />
          <Route path="/wishlist" element={<WishlistPage user={user} onPurchase={fetchBalance} />} />
          <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} balance={balance} setBalance={setBalance} fetchBalance={fetchBalance} />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}