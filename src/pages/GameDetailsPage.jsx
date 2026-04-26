import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../style/GameDetailsPage.css';
import userIcon from "../assets/user.png";
import bellIcon from "../assets/bell2.png"; 
import dotsIcon from "../assets/dots.png";

export default function GameDetailsPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [activeCommunityFilter, setActiveCommunityFilter] = useState("all");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortType, setSortType] = useState("Популярні");
  const [message, setMessage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`https://localhost:7059/api/games/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Game not found");
        return res.json();
      })
      .then(gameData => {
        setGame(gameData);
        setPosts([
          {
            id: 1, type: "forum", author: "NikaNii", avatar: userIcon, date: "25.02.2024",
            title: "Питання для початківців",
            text: "Я трохи втратив уявлення про цю гру...",
            image: `https://localhost:7059/images/${gameData.photo}`, likes: "1.5k", comments: "500", isLiked: true
          },
          {
            id: 2, type: "screenshot", author: "Юзернейм", avatar: userIcon, date: "25.02.2024",
            title: null,
            text: "Крутий вид!",
            image: `https://localhost:7059/images/${gameData.photo}`, likes: "2.5k", comments: "2.5k", isLiked: false
          }
        ]);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!user?.token) return;
    
    fetch("https://localhost:7059/api/wishlist/ids", {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Помилка сервера"); 
        return res.json();
      })
      .then(ids => {
        setIsInWishlist(ids.includes(parseInt(id)));
      })
      .catch(err => console.log("Помилка завантаження wishlist", err));
  }, [id, user?.token]);

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleBuy = async () => {
    if (!user?.token) return navigate("/login");
    try {
      const res = await fetch(`https://localhost:7059/api/library/buy/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) showToast("Гру придбано та додано до бібліотеки!");
      else showToast(`${data.message || "Помилка"}`);
    } catch {
      showToast("Помилка з'єднання з сервером");
    }
  };

  const addToCart = async () => {
    if (!user?.token) return navigate("/login");
    try {
      const res = await fetch(`https://localhost:7059/api/cart`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify({ userId: user.id, gameId: parseInt(id), quantity: 1 })
      });
      if (res.ok) showToast("Гру додано у кошик!");
      else showToast("Помилка при додаванні");
    } catch {
      showToast("Помилка сервера");
    }
  };

  const toggleWishlist = async () => {
    if (!user?.token) return navigate("/login");
    try {
      const method = isInWishlist ? "DELETE" : "POST";
      const res = await fetch(`https://localhost:7059/api/wishlist/${id}`, {
        method,
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setIsInWishlist(!isInWishlist);
        showToast(isInWishlist ? "Видалено зі списку бажань" : "Додано до списку бажань");
      } else {
        const data = await res.json();
        showToast(data.message || "Помилка");
      }
    } catch {
      showToast("Помилка сервера");
    }
  };

  const handleCreatePost = async () => {
    if (!user?.token) return navigate("/login");
    if (!postFile) return showToast("Виберіть скріншот або відео!");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", postFile);
    if (postCaption) formData.append("caption", postCaption);
    formData.append("gameId", id);

    try {
      const res = await fetch("https://localhost:7059/api/screenshots/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });
      
      const data = await res.json();

      if (res.ok) {
        showToast("Пост успішно опубліковано!");
        
        setIsCreatePostModalOpen(false);
        
        const newPost = {
          id: data.id || Date.now(),
          type: "screenshot",
          author: user.username,
          avatar: user.photo ? `https://localhost:7059/avatars/${user.photo}` : userIcon,
          date: "Щойно",
          title: null,
          text: postCaption,
          image: `https://localhost:7059/screenshots/${data.fileName}`,
          likes: 0, comments: 0, isLiked: false
        };
        setPosts([newPost, ...posts]);
        
        setPostCaption("");
        setPostFile(null);
      } else {
        showToast("Помилка при публікації");
      }
    } catch {
      showToast("Помилка з'єднання з сервером");
    } finally {
      setUploading(false);
    }
  };

  if (!game) return null;

  const mockTags = ["шутер", "екшн", "кіберпанк", "відкритий світ", "майбутнє"];

  const filteredPosts = posts.filter(post => {
    if (activeCommunityFilter === "all") return true;
    if (activeCommunityFilter === "screens") return post.type === "screenshot";
    return post.type === activeCommunityFilter;
  });

  return (
    <div className="game-details-page main-container">
      {message && <div className="toast-notification">{message}</div>}

      <div className="details-tabs">
        <button className={activeTab === "about" ? "active" : ""} onClick={() => setActiveTab("about")}>Про гру</button>
        <button className={activeTab === "specs" ? "active" : ""} onClick={() => setActiveTab("specs")}>Характеристики</button>
        <button className={activeTab === "community" ? "active" : ""} onClick={() => setActiveTab("community")}>Спільнота</button>
      </div>

      <div className="details-header">
        <div>
          <h1>{game.name}</h1>
          {activeTab === "community" && (
            <div className="community-stats">
              <span><strong>10 000</strong> підписників</span>
              <span><strong>5 267</strong> <span className="online-dot">●</span> онлайн</span>
            </div>
          )}
        </div>
        {activeTab !== "community" && <div className="rating-stars">5.0 ⭐⭐⭐⭐⭐</div>}
      </div>

      <div className="details-grid">
        <div className="details-main">
          
          {activeTab === "about" && (
            <div className="tab-content about-tab">
              <div className="main-media"><img src={`https://localhost:7059/images/${game.photo}`} alt={game.name} /></div>
              <div className="tags-row">{mockTags.map(tag => <span key={tag} className="game-tag">{tag}</span>)}</div>
              <div className="game-description">
                <p>{game.name} — неймовірна гра від студії {game.surname || "невідомого розробника"}.</p>
              </div>
              <h2 className="section-title">Комплекти</h2>
              <div className="bundle-card">
                <h3>{game.name} Standard Edition</h3>
                <div className="bundle-price-row">
                  <span>{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</span>
                  <button className="buy-btn-small" onClick={addToCart}>У кошик</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="tab-content specs-tab">
              <div className="specs-grid">
                <div className="spec-column">
                  <h3>Мінімальні налаштування</h3>
                  <div className="spec-item"><strong>ОС:</strong> Windows 10/11</div>
                  <div className="spec-item"><strong>Процесор:</strong> Core i5-8400</div>
                  <div className="spec-item"><strong>Пам'ять:</strong> 8 GB RAM</div>
                  <div className="spec-item"><strong>Графіка:</strong> GTX 1060</div>
                </div>
                <div className="spec-column">
                  <h3>Рекомендовані налаштування</h3>
                  <div className="spec-item"><strong>ОС:</strong> Windows 11</div>
                  <div className="spec-item"><strong>Процесор:</strong> Core i7-12700</div>
                  <div className="spec-item"><strong>Пам'ять:</strong> 16 GB RAM</div>
                  <div className="spec-item"><strong>Графіка:</strong> RTX 3060</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "community" && (
            <div className="tab-content community-tab">
              {filteredPosts.map(post => (
                <div className="community-post-card" key={post.id}>
                  <div className="post-header">
                    <div className="post-author-info">
                      <img src={post.avatar} alt="avatar" className="post-avatar" />
                      <div>
                        <div className="post-username">{post.author}</div>
                        <div className="post-date">{post.date}</div>
                      </div>
                    </div>
                    <button className="post-options">•••</button>
                  </div>

                  <div className="post-content">
                    {post.type === "guide" ? (
                      <div className="guide-content">
                        <img src={post.image} alt="guide thumb" className="guide-thumbnail" />
                        <div className="guide-info">
                          <h3>{post.title}</h3>
                          <p>{post.text}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {post.title && <h3>{post.title}</h3>}
                        {post.type === "screenshot" && <p style={{marginBottom: '10px'}}>{post.text}</p>}
                        
                        <div className="post-media">
                          {post.type === "video" ? (
                            <div className="video-container">
                              <img src={post.image} alt="video thumb" />
                              <div className="play-button"></div>
                            </div>
                          ) : (
                            <img src={post.image} alt="post media" />
                          )}
                        </div>
                        
                        {post.type !== "screenshot" && <p>{post.text}</p>}
                      </>
                    )}
                  </div>

                  <div className="post-actions">
                    <button className={`post-btn ${post.isLiked ? 'liked' : ''}`}>
                      {post.isLiked ? '❤️' : '🤍'} {post.likes}
                    </button>
                    <button className="post-btn">💬 {post.comments}</button>
                    <button className="post-btn">📤 Поділитись</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-sidebar">
          {activeTab !== "community" ? (
            <>
              <img className="sidebar-img" src={`https://localhost:7059/images/${game.photo}`} alt="cover" />
              <h2 className="sidebar-price">{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</h2>
              <button className="action-btn buy" onClick={handleBuy}>Купити</button>
              <div className="cart-actions">
                <button className="action-btn add-cart" onClick={addToCart}>Додати у кошик</button>
                <button className={`action-btn wishlist-btn ${isInWishlist ? "active" : ""}`} onClick={toggleWishlist}>
                  {isInWishlist ? "♥" : "♡"}
                </button>
              </div>
              <div className="meta-info">
                <div className="meta-row"><span>Дата виходу</span> <span>2024</span></div>
                <div className="meta-row"><span>Розробник</span> <span>{game.surname}</span></div>
                <div className="meta-row"><span>Рейтинг</span> <span>{game.gpa || "9.0"}</span></div>
              </div>
            </>
          ) : (
            <div className="community-sidebar-content">
              <div className="community-actions-row">
                <button className="btn-create-post" onClick={() => setIsCreatePostModalOpen(true)}>＋ Створити пост</button>
                <button className="btn-icon-circle"><img src={bellIcon} alt="bell" style={{width: '20px', filter: 'brightness(0) invert(1)'}}/></button>
                <button className="btn-icon-circle"><img src={dotsIcon} alt="dots" style={{width: '20px', filter: 'brightness(0) invert(1)'}}/></button>
              </div>

              <div className="community-filters-card">
                <div className="sort-wrapper">
                  <div className="sort-dropdown" onClick={() => setIsSortOpen(!isSortOpen)}>
                    Сортування: <strong>{sortType} ˅</strong>
                  </div>
                  {isSortOpen && (
                    <div className="sort-dropdown-menu">
                      {["Спочатку популярні", "Спочатку нові", "За оцінкою", "За кількістю коментарів"].map(s => (
                        <div 
                          key={s} 
                          className={`sort-item ${sortType === s ? 'active' : ''}`} 
                          onClick={() => { setSortType(s); setIsSortOpen(false); }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <input type="text" placeholder={`Пошук: ${activeCommunityFilter === 'all' ? 'Усі розділи' : sortType}...`} className="community-search" />
                
                <div className="filter-list">
                  <button className={`filter-item ${activeCommunityFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveCommunityFilter('all')}>Усі розділи</button>
                  <button className={`filter-item ${activeCommunityFilter === 'forum' ? 'active' : ''}`} onClick={() => setActiveCommunityFilter('forum')}>Форум</button>
                  <button className={`filter-item ${activeCommunityFilter === 'screens' ? 'active' : ''}`} onClick={() => setActiveCommunityFilter('screens')}>Скріншоти</button>
                  <button className={`filter-item ${activeCommunityFilter === 'video' ? 'active' : ''}`} onClick={() => setActiveCommunityFilter('video')}>Відео</button>
                  <button className={`filter-item ${activeCommunityFilter === 'guide' ? 'active' : ''}`} onClick={() => setActiveCommunityFilter('guide')}>Гайди</button>
                  <button className={`filter-item ${activeCommunityFilter === 'news' ? 'active' : ''}`} onClick={() => setActiveCommunityFilter('news')}>Новини</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {isCreatePostModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreatePostModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Створити пост у спільноті</h2>

            <div style={{marginTop: '15px'}}>
              <label style={{display: "block", marginBottom: "8px", color: "#8ab4bc", fontSize: "13px"}}>Опис або текст поста (необов'язково)</label>
              <textarea
                rows="4"
                placeholder="Що у вас нового?"
                value={postCaption}
                onChange={e => setPostCaption(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#00141f", color: "#fff", border: "1px solid #046075", boxSizing: "border-box", outline: "none", resize: "vertical" }}
              ></textarea>
            </div>

            <div style={{marginTop: '20px'}}>
              <label style={{display: "block", marginBottom: "8px", color: "#8ab4bc", fontSize: "13px"}}>Прикріпити файл (Скріншот / Відео)</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={e => setPostFile(e.target.files[0])}
                style={{ width: "100%", padding: "10px", background: "#00232d", borderRadius: "8px", border: "1px dashed #046075", color: "#fff", cursor: "pointer" }}
              />
            </div>

            <div style={{marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setIsCreatePostModalOpen(false)} 
                style={{ background: "transparent", color: "#ff7675", border: "none", cursor: "pointer", padding: "10px 20px", fontSize: "14px" }}
              >
                Скасувати
              </button>
              <button 
                onClick={handleCreatePost} 
                disabled={uploading} 
                style={{ background: "#24E5C2", color: "#021a1f", border: "none", borderRadius: "20px", padding: "10px 30px", fontWeight: "bold", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}
              >
                {uploading ? "Завантаження..." : "Опублікувати"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}