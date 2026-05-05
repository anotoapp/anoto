import React, { useRef, useEffect } from 'react';
import './CategoryNav.css';
import type { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // When activeCategory changes (either from click or IntersectionObserver),
  // smoothly center the active chip in the horizontal scroll strip.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(
      `[data-cat-btn="${activeCategory}"]`
    );
    if (!activeBtn) return;

    const containerCenter = container.getBoundingClientRect().width / 2;
    const btnCenter =
      activeBtn.offsetLeft + activeBtn.getBoundingClientRect().width / 2;
    container.scrollTo({
      left: btnCenter - containerCenter,
      behavior: 'smooth',
    });
  }, [activeCategory]);

  const handleClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    // Scroll the page section into view
    const section = document.getElementById(`cat-section-${categoryId}`);
    if (section) {
      // Offset for sticky header (≈ 130 px)
      const top =
        section.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="category-nav-container">
      <div className="category-nav-scroll" ref={scrollRef}>
        {categories.map((category) => (
          <button
            key={category.id}
            data-cat-btn={category.id}
            className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleClick(category.id)}
          >
            {category.icon && <span className="cat-icon">{category.icon}</span>}
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};
