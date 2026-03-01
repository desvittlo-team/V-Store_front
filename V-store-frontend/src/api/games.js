const API = "https://localhost:7059/api";

export async function getGames() {
  const res = await fetch(`${API}/games`);
  return res.json();
}

export async function addGame(game, token) {
  const res = await fetch(`${API}/admin/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(game),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Ошибка");
  return data;
}

export async function updateGame(id, game, token) {
  const res = await fetch(`${API}/admin/games/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(game),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Ошибка");
  return data;
}

export async function deleteGame(id, token) {
  const res = await fetch(`${API}/admin/games/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ошибка удаления");
}