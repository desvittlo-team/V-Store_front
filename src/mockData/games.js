const API_BASE = "https://localhost:7059/api";

export const getGames = async () => {
  const res = await fetch(`${API_BASE}/games`);
  if (!res.ok) throw new Error("Ошибка при загрузке игр");
  return res.json();
};

export const getGameById = async (id) => {
  const res = await fetch(`${API_BASE}/games/${id}`);
  if (!res.ok) throw new Error("Игра не найдена");
  return res.json();
};

export const getUserLibrary = async (token) => {
  const res = await fetch(`${API_BASE}/library`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Ошибка доступа к библиотеке");
  return res.json();
};