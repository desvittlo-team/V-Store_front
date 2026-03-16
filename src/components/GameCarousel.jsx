import { useRef } from "react";

export default function GameCarousel({ title, games, renderCard }) {
  const scrollRef = useRef(null);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!games || games.length === 0) return null;

  return (
    <section className="category-section">
      <div className="section-header">
        <h2 className="category-title">{title}</h2>
        <span className="arrow-link">❯</span>
      </div>
      
      <div className="carousel-container">
        <button className="carousel-btn left" onClick={() => scroll(-320)}>❮</button>
        
        <div className="carousel-track" ref={scrollRef}>
          {games.map(renderCard)}
        </div>
        
        <button className="carousel-btn right" onClick={() => scroll(320)}>❯</button>
      </div>
    </section>
  );
}