import React, { useRef, useEffect } from 'react';
import './CategoryNav.css';
import type { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  isFixed?: boolean;
  navHeight?: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  isFixed = false,
  navHeight = 52,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // When activeCategory changes, smoothly center the active chip.
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
    const section = document.getElementById(`cat-section-${categoryId}`);
    if (section) {
      // When fixed, compensate the nav height; when not fixed, no offset needed.
      const offset = isFixed ? navHeight + 8 : 8;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Placeholder that reserves space when bar is fixed */}
      {isFixed && <div style={{ height: navHeight }} aria-hidden="true" />}

      <div className={`category-nav-container${isFixed ? ' is-fixed' : ''}`}>
        <div className="container" style={{ padding: '0' }}>
          <div className="category-nav-scroll" ref={scrollRef}>
            {categories.map((category) => (
              <button
                key={category.id}
                data-cat-btn={category.id}
                className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleClick(category.id)}
              >
                {category.icon && <span className="cat-icon">{category.icon}</span>}
                <span className="cat-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
