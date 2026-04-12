// Утиліта для безпечного завантаження зображень з fallback

export const IMAGE_ENDPOINTS = {
  chatImage: (filename) => `https://localhost:7059/chat-images/${filename}`,
  itemImage: (filename) => `https://localhost:7059/items/${filename}`,
  gameImage: (filename) => `https://localhost:7059/images/${filename}`,
  heroBg: (filename) => `https://localhost:7059/pics/${filename}`,
  screenshot: (filename) => `https://localhost:7059/screenshots/${filename}`,
};

export const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%232a2a3e" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" font-size="16" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

// Обробник помилки завантаження для img елементів
export const handleImageError = (e, fallback = FALLBACK_IMAGE) => {
  if (e.target.style) {
    e.target.src = fallback;
    e.target.style.opacity = '0.6';
  }
};

// Функція для перевірки доступності зображення
export const checkImageAvailable = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response.ok || response.status === 0; // 0 for no-cors mode
  } catch (err) {
    return false;
  }
};
