'use client'

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Product } from '../types/product';

interface FilterSidebarProps {
  products: Product[];
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
}

export default function FilterSidebar({ products, onFiltersChange, currentFilters }: FilterSidebarProps) {
  const [openCategories, setOpenCategories] = useState(true);
  const [openPrice, setOpenPrice] = useState(false);
  const [openRating, setOpenRating] = useState(false);

  // Extract unique categories, tags, price range
  const categories = Array.from(new Set(products.map(p => p.category)));
  const ratings = [5, 4, 3];
  const minPrice = Math.min(...products.map(p => Number(p.price)));
  const maxPrice = Math.max(...products.map(p => Number(p.price)));

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newFilters = {
      ...currentFilters,
      category: checked 
        ? [...(currentFilters.category || []), category]
        : (currentFilters.category || []).filter((c: string) => c !== category)
    };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Filters</h2>
        <button 
          onClick={clearAllFilters}
          className="text-white/80 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <button 
          className="flex items-center justify-between w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white mb-2"
          onClick={() => setOpenCategories(!openCategories)}
        >
          Categories
          <ChevronDown className={`w-5 h-5 transition-transform ${openCategories ? 'rotate-180' : ''}`} />
        </button>
        {openCategories && (
          <div className="space-y-2 mt-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(currentFilters.category || []).includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="w-5 h-5 rounded accent-solar-yellow-500 text-solar-yellow-500 bg-white/20 border-white/50 focus:ring-solar-yellow-500"
                />
                <span className="text-white font-medium group-hover:text-solar-yellow-400">
                  {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <button 
          className="flex items-center justify-between w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white mb-2"
          onClick={() => setOpenPrice(!openPrice)}
        >
          Price Range ($ {minPrice} - $ {maxPrice.toFixed(0)})
          <ChevronDown className={`w-5 h-5 transition-transform ${openPrice ? 'rotate-180' : ''}`} />
        </button>
        {openPrice && (
          <div className="space-y-2 mt-2">
            <div className="flex space-x-2">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={currentFilters.minPrice || minPrice}
                onChange={(e) => onFiltersChange({
                  ...currentFilters,
                  minPrice: Number(e.target.value)
                })}
                className="flex-1 accent-solar-yellow-500 bg-white/20 rounded-lg h-2 cursor-pointer"
              />
              <span className="text-sm text-white font-mono min-w-[60px] text-right">
                ${Number(currentFilters.minPrice || minPrice).toFixed(0)}
              </span>
            </div>
            <div className="flex space-x-2">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={currentFilters.maxPrice || maxPrice}
                onChange={(e) => onFiltersChange({
                  ...currentFilters,
                  maxPrice: Number(e.target.value)
                })}
                className="flex-1 accent-solar-yellow-500 bg-white/20 rounded-lg h-2 cursor-pointer"
              />
              <span className="text-sm text-white font-mono min-w-[60px] text-right">
                ${Number(currentFilters.maxPrice || maxPrice).toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div>
        <button 
          className="flex items-center justify-between w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white mb-2"
          onClick={() => setOpenRating(!openRating)}
        >
          Rating
          <ChevronDown className={`w-5 h-5 transition-transform ${openRating ? 'rotate-180' : ''}`} />
        </button>
        {openRating && (
          <div className="space-y-2 mt-2">
            {ratings.map((rating) => (
              <label key={rating} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  checked={currentFilters.minRating === rating}
                  onChange={(e) => onFiltersChange({
                    ...currentFilters,
                    minRating: e.target.checked ? rating : undefined
                  })}
                  className="w-5 h-5 rounded accent-solar-yellow-500 text-solar-yellow-500 bg-white/20 border-white/50 focus:ring-solar-yellow-500"
                />
                <div className="flex items-center gap-1">
                  {[...Array(rating)].map((_, i) => (
                    <span key={i} className="w-4 h-4 text-solar-yellow-400 fill-current">★</span>
                  ))}
                  <span className="text-white font-medium group-hover:text-solar-yellow-400">
                    & up
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
