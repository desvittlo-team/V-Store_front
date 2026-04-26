import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import searchIcon from '../assets/search.png';
import filterIcon from '../assets/filter.png';
import gridIcon from '../assets/grid_view.png';
import listIcon from '../assets/list_view.png';

import LibrarySidebar    from '../components/library/LibrarySidebar';
import LibraryFeed       from '../components/library/LibraryFeed';
import LibraryCollection from '../components/library/LibraryCollection';
import LibraryGamePage   from '../components/library/LibraryGamePage';

import '../style/Library.css';

const API = "https://localhost:7059";

export default function LibraryPage({ user }) {
  const navigate = useNavigate();

  const [games, setGames]         = useState([]);
  const [community, setCommunity] = useState([]);
  const [news, setNews]           = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [search, setSearch]           = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [viewMode, setViewMode]       = useState("grid");
  const [activeTab, setActiveTab]     = useState("all");

  useEffect(() => {
    if (!user?.token) { navigate("/login"); return; }

    const headers = { Authorization: `Bearer ${user.token}` };

    fetch(`${API}/api/library`, { headers })
      .then(r => r.ok ? r.json() : []).then(setGames).catch(console.error);

    fetch(`${API}/api/screenshots`, { headers })
      .then(r => r.ok ? r.json() : []).then(setCommunity).catch(console.error);

    fetch(`${API}/api/globalchat`, { headers })
      .then(r => r.ok ? r.json() : []).then(setNews).catch(console.error);

    fetch(`${API}/api/users`, { headers })
      .then(r => r.ok ? r.json() : []).then(setUsersList).catch(console.error);

  }, [user, navigate]);

  if (!user) return null;

  const filteredGames = games.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getImgUrl = (photo) =>
    photo ? `${API}/images/${photo}` : '/no-image.png';

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString('uk-UA') : "";

  return (
    <div className="library-layout">
      <LibrarySidebar
        games={filteredGames}
        selectedGame={selectedGame}
        onSelect={setSelectedGame}
        getImgUrl={getImgUrl}
      />

      <main className="library-main-content">
        {!selectedGame ? (
          <div className="library-home-view">

            <div className="library-top-bar">
              <div className="library-search">
                <img src={searchIcon} alt="search" className="icon-sm" />
                <input
                  type="text"
                  placeholder="Пошук у Бібліотеці..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="library-filters">
                <button className="filter-btn">
                  <img src={filterIcon} alt="filter" className="icon-sm" /> Фільтри
                </button>
                <div className="view-toggle">
                  <span>Вид:</span>
                  <img
                    src={gridIcon}
                    alt="grid"
                    className={`icon-sm view-icon ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                  />
                  <img
                    src={listIcon}
                    alt="list"
                    className={`icon-sm view-icon ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                  />
                </div>
              </div>
            </div>

            <LibraryFeed
              news={news}
              community={community}
              formatDate={formatDate}
            />

            <LibraryCollection
              games={filteredGames}
              viewMode={viewMode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSelect={setSelectedGame}
              getImgUrl={getImgUrl}
            />
          </div>
        ) : (
          <LibraryGamePage
            game={selectedGame}
            usersList={usersList}
            onBack={() => setSelectedGame(null)}
            getImgUrl={getImgUrl}
            formatDate={formatDate}
          />
        )}
      </main>
    </div>
  );
}
