'use client';

import { useState, useRef, useEffect, type ReactNode, useCallback } from 'react';
import { Sun, Droplets, Battery, Zap, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Hero from './Hero';
import Image from 'next/image';

// Types
interface Project {
  id: number;
  title: string;
  location: string;
  category: string;
  description: string;
  images: string[];
}

interface MasonryItem {
  id: string;
  img: string;
  project: Project;
  imageIndex: number;
  precalculatedHeight: number;
}

// ============= PROJECT DATA =============
const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Solar Installation Showcase',
    location: 'Various Locations',
    category: 'Solar Installation',
    description: 'High-efficiency solar panel installations for residential and commercial properties',
    images: [
      '/images/solar-image1.jpg',
      '/images/solar-image2.jpg',
      '/images/solar-image3.jpg',
      '/images/solar-image4.jpg',
      '/images/solar-4.jpg',
      '/images/solar.jpg',
    ],
  },
  {
    id: 2,
    title: 'Borehole Drilling Showcase',
    location: 'Various Locations',
    category: 'Borehole Drilling',
    description: 'Professional borehole drilling services for clean water access',
    images: [
      '/images/borehole_drilling.jpeg',
      '/images/borehole-drilling1.jpg',
      '/images/borehole-drilling2.jpg',
      '/images/borehole-drilling3.jpg',
      '/images/borehole-drilling4.jpg',
      '/images/borehole-drilling5.jpg',
      '/images/borehole.jpg',
    ],
  },
  {
    id: 3,
    title: 'Water Tower Construction Showcase',
    location: 'Various Locations',
    category: 'Water Tower',
    description: 'Elevated water storage towers for reliable water distribution',
    images: [
      '/images/watertower1.jpeg',
      '/images/water_tower1.jpeg',
      '/images/water_tower2.jpeg',
      '/images/water_tower3.jpeg',
      '/images/water_tower4.jpeg',
      '/images/water_tower5.jpeg',
      '/images/water_tower6.jpeg',
      '/images/water_tower7.jpeg',
      '/images/water_tower8.jpeg',
      '/images/tower-construction1.jpg',
      '/images/tower-construction2.jpg',
      '/images/watertower.jpg',
    ],
  },
  {
    id: 4,
    title: 'Combined Solutions Showcase',
    location: 'Various Locations',
    category: 'Combined Solution',
    description: 'Integrated water and solar energy solutions for maximum efficiency',
    images: [
      '/images/Combined-1.jpg',
      '/images/combined-2.jpg',
      '/images/combined-3.jpg',
    ],
  },
];

const CATEGORIES = ['All', 'Solar Installation', 'Borehole Drilling', 'Water Tower', 'Combined Solution'];

// ============= UTILITY FUNCTIONS =============
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Solar Installation': return <Sun className="w-4 h-4 sm:w-5 sm:h-5" />;
    case 'Borehole Drilling': return <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />;
    case 'Water Tower': return <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />;
    case 'Combined Solution': return <Battery className="w-4 h-4 sm:w-5 sm:h-5" />;
    default: return <Zap className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Solar Installation': return 'from-orange-500 to-amber-600';
    case 'Borehole Drilling': return 'from-blue-500 to-blue-700';
    case 'Water Tower': return 'from-green-500 to-green-700';
    case 'Combined Solution': return 'from-purple-500 to-purple-700';
    default: return 'from-gray-500 to-gray-700';
  }
};

const getCategoryShortName = (category: string) => {
  switch (category) {
    case 'Solar Installation': return 'Solar';
    case 'Borehole Drilling': return 'Borehole';
    case 'Water Tower': return 'Water Tower';
    case 'Combined Solution': return 'Combined';
    default: return category;
  }
};

// ============= COMPONENTS =============
const Badge = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
    {children}
  </span>
);

// ============= MASONRY GRID =============
const Masonry = ({
  items,
  onItemClick,
  renderItem,
  gap = 16,
}: {
  items: MasonryItem[];
  onItemClick?: (item: MasonryItem) => void;
  renderItem: (item: MasonryItem) => ReactNode;
  gap?: number;
}) => {
  const [columns, setColumns] = useState(3);
  const [columnItems, setColumnItems] = useState<MasonryItem[][]>([]);
  const [visibleItems, setVisibleItems] = useState<MasonryItem[]>([]);

  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(2);
      else if (width < 1280) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Staggered animation
  useEffect(() => {
    setVisibleItems([]);
    const timeouts: NodeJS.Timeout[] = [];

    items.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => [...prev, item]);
      }, index * 50);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [items]);

  // Distribute items to columns
  useEffect(() => {
    if (visibleItems.length === 0) return;

    const cols: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights: number[] = new Array(columns).fill(0);

    const itemsWithHeights = visibleItems.map((item) => ({
      item,
      height: item.precalculatedHeight || 300 + Math.random() * 200,
    }));

    itemsWithHeights.forEach(({ item, height }) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      cols[shortestColumn].push(item);
      columnHeights[shortestColumn] += height;
    });

    setColumnItems(cols);
  }, [visibleItems, columns]);

  return (
    <div
      className="w-full"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: `${gap}px`,
      }}
    >
      {columnItems.map((column, colIndex) => (
        <div
          key={colIndex}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`,
          }}
        >
          {column.map((item, itemIndex) => (
            <div
              key={`${item.id}-${colIndex}-${itemIndex}`}
              onClick={() => onItemClick?.(item)}
              className="cursor-pointer transform transition-all duration-500 hover:scale-[0.98] animate-fadeInUp"
              style={{
                animationDelay: `${itemIndex * 50}ms`,
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ============= MAIN COMPONENT =============
export default function ProjectsPageContent() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<{ project: Project; imageIndex: number } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [filteredItems, setFilteredItems] = useState<MasonryItem[]>([]);

  // Filter projects based on active category
  useEffect(() => {
    const filtered = activeCategory === 'All' 
      ? PROJECTS 
      : PROJECTS.filter(project => project.category === activeCategory);

    const items = filtered.flatMap((project) =>
      project.images.map((image: string, imageIndex: number) => ({
        id: `${project.id}-${imageIndex}`,
        img: image,
        project,
        imageIndex,
        precalculatedHeight: Math.floor(Math.random() * 200) + 320,
      }))
    );

    setFilteredItems(items);
  }, [activeCategory]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowLeft' && selectedImage.imageIndex > 0) {
        setSelectedImage({
          project: selectedImage.project,
          imageIndex: selectedImage.imageIndex - 1,
        });
      } else if (e.key === 'ArrowRight' && selectedImage.imageIndex < selectedImage.project.images.length - 1) {
        setSelectedImage({
          project: selectedImage.project,
          imageIndex: selectedImage.imageIndex + 1,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const handleMasonryClick = useCallback((item: MasonryItem) => {
    setSelectedImage({ project: item.project, imageIndex: item.imageIndex });
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      <Hero />

      {/* Category Filter - Sticky */}
      <div
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
            : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category
                    ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-lg transform scale-105`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                }`}
              >
                {getCategoryIcon(category)}
                <span className="hidden xs:inline">{category}</span>
                <span className="xs:hidden">
                  {category === 'Solar Installation'
                    ? 'Solar'
                    : category === 'Borehole Drilling'
                    ? 'Borehole'
                    : category === 'Water Tower'
                    ? 'Water'
                    : category === 'Combined Solution'
                    ? 'Combined'
                    : 'All'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length > 0 ? (
            <Masonry
              items={filteredItems}
              onItemClick={handleMasonryClick}
              gap={16}
              renderItem={(item) => (
                <div className="relative group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500">
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img
                      src={item.img}
                      alt={`${item.project.title} - ${item.imageIndex + 1}`}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                    <Badge className={`bg-gradient-to-r ${getCategoryColor(item.project.category)} text-white shadow-lg text-xs sm:text-sm`}>
                      {getCategoryShortName(item.project.category)}
                    </Badge>
                  </div>

                  {/* Info Card - Slide up on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
                    <div className="bg-black/80 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h3 className="text-white font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 line-clamp-2">
                        {item.project.title}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-blue-200 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{item.project.location}</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm mt-2 sm:mt-3 line-clamp-2">
                        {item.project.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            />
          ) : (
            // Empty State
            <div className="text-center py-16 sm:py-24">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                No Projects Found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base md:text-lg max-w-md mx-auto mb-6 sm:mb-8 px-4">
                We're constantly expanding our portfolio. Check back soon for new {activeCategory.toLowerCase()} projects!
              </p>
              <button
                onClick={() => handleCategoryChange('All')}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                View All Projects
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] sm:max-w-5xl max-h-[90vh]">
            <img
              src={selectedImage.project.images[selectedImage.imageIndex]}
              alt={selectedImage.project.title}
              className="max-w-full max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl"
            />

            {/* Image Info */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="bg-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white border border-white/10">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Badge className={`bg-gradient-to-r ${getCategoryColor(selectedImage.project.category)} text-white text-xs sm:text-sm`}>
                    {selectedImage.project.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-blue-200 text-xs sm:text-sm">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{selectedImage.project.location}</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{selectedImage.project.title}</h3>
                <p className="text-blue-100 text-sm sm:text-base">
                  Image {selectedImage.imageIndex + 1} of {selectedImage.project.images.length}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 sm:-top-16 right-0 text-white hover:text-gray-300 transition-colors bg-black/50 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/70"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </button>

            {/* Navigation Buttons */}
            {selectedImage.imageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage({
                    project: selectedImage.project,
                    imageIndex: selectedImage.imageIndex - 1,
                  });
                }}
                className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/70 transition-all"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            )}

            {selectedImage.imageIndex < selectedImage.project.images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage({
                    project: selectedImage.project,
                    imageIndex: selectedImage.imageIndex + 1,
                  });
                }}
                className="absolute right-3 sm:right-6 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/70 transition-all"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Responsive utilities */
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}