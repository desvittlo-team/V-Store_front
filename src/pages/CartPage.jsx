import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from '../assets/search.png';
import wishlistIcon from '../assets/wishlist.png';
import cartIcon from '../assets/cart.png';

export default function CartPage({ user }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`https://localhost:7059/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [user]);

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`https://localhost:7059/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await fetch(`https://localhost:7059/api/cart/clear/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCartItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`https://localhost:7059/api/cart/checkout/${user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        alert("Оплата успішна! Товари додано до вашої бібліотеки.");
        setCartItems([]);
        navigate("/library");
      }
    } catch (err) {
      alert("Помилка при оплаті");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.game.price * item.quantity), 0);
  };

  const getImgUrl = (photo) => photo ? `https://localhost:7059/images/${photo}` : '/no-image.png';

  if (loading) return null;

  return (
    <div className="main-container" style={{ paddingTop: "20px", paddingBottom: "80px" }}>
      <div className="store-top-bar" style={{ margin: "0 0 40px 0", padding: "0" }}>
        <div className="store-search">
          <input type="text" placeholder="Пошук у Крамниці..." />
          <img src={searchIcon} alt="search" className="icon-sm" />
        </div>
        <div className="store-top-right">
          <div className="store-top-links">
            <span className="active">Каталог</span>
            <span>Новини</span>
          </div>
          <div className="store-top-actions">
            <button className="icon-btn-circle"><img src={wishlistIcon} alt="wishlist" /></button>
            <button className="icon-btn-circle"><img src={cartIcon} alt="cart" /></button>
          </div>
        </div>
      </div>

      <div className="cart-layout">
        <h1 className="cart-page-title">Мій кошик</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart-msg">
            <h2>Ваш кошик порожній</h2>
            <button className="cart-btn-primary" onClick={() => navigate("/")} style={{ width: "250px", marginTop: "20px" }}>
              Повернутись до Крамниці
            </button>
          </div>
        ) : (
          <div className="cart-content-grid">
            <div className="cart-items-column">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img 
                    src={getImgUrl(item.game.photo)} 
                    alt={item.game.name} 
                    className="cart-item-img"
                    onError={(e) => { e.target.src = '/no-image.png'; }}
                  />
                  
                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <h3 className="cart-item-name">{item.game.name}</h3>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                    
                    <div className="cart-item-footer">
                      <span className="cart-wishlist-link">Перемістити до Бажаного</span>
                      <div className="cart-price-block">
                        <span className="cart-current-price">{item.game.price > 0 ? `${item.game.price}₴` : "Безкоштовно"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-column">
              <div className="summary-row total">
                <span>Усього</span>
                <span>{calculateTotal()}₴</span>
              </div>
              <p className="summary-disclaimer">
                Якщо застосовано, податок із продажу буде розраховано в процесі оплати.
              </p>
              <div className="summary-actions">
                <button className="cart-btn-primary" onClick={handleCheckout}>
                  Перейти до оплати
                </button>
                <button className="cart-btn-secondary" onClick={() => navigate("/")}>
                  Продовжити покупки
                </button>
                <button className="cart-btn-transparent" onClick={clearCart}>
                  Очистити кошик
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}