"use client";

import { useState, useRef, useEffect, type ReactNode, useCallback } from 'react';
import { Sun, Droplets, Battery, Zap, MapPin, X, ChevronLeft, ChevronRight, Play, Grid3x3, LayoutList } from 'lucide-react';
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
  videos?: string[];
}

interface MasonryItem {
  id: string;
  img: string;
  project: Project;
  imageIndex: number;
  precalculatedHeight: number;
  isVideo?: boolean;
}

// ============= PROJECT DATA =============
const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Solar Installation Showcase',
    location: 'Various Locations',
    category: 'Solar Installation',
    description: 'High-efficiency solar panel installations with advanced inverter systems for residential and commercial properties',
    images: [
      '/portfolio/solar1.jpg',
      '/portfolio/solar2.jpg',
      '/portfolio/solar3.jpg',
      '/portfolio/solar4.jpg',
      '/portfolio/solar5.jpg',
      '/portfolio/solar6.jpg',
      '/portfolio/solar7.jpg',
      '/portfolio/inv1.jpg',
      '/portfolio/inv2.jpg',
      '/portfolio/inv3.jpg',
      '/portfolio/inv4.jpg',
      '/portfolio/inv5.jpg',
    ],
    videos: [
      '/portfolio/solar01.mp4',
      '/portfolio/inv00.mp4',
      '/portfolio/inv01.mp4',
      '/portfolio/inv02.mp4',
    ],
  },
  {
    id: 2,
    title: 'Borehole Drilling Showcase',
    location: 'Various Locations',
    category: 'Borehole Drilling',
    description: 'Professional borehole drilling services for clean water access in residential and agricultural projects',
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
    description: 'Elevated water storage towers for reliable water distribution in communities and industrial areas',
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
    description: 'Integrated water and solar energy solutions for maximum efficiency and sustainability',
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
  const [selectedImage, setSelectedImage] = useState<{ project: Project; imageIndex: number; isVideo?: boolean } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [filteredItems, setFilteredItems] = useState<MasonryItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filter projects based on active category
  useEffect(() => {
    const filtered = activeCategory === 'All' 
      ? PROJECTS 
      : PROJECTS.filter(project => project.category === activeCategory);

    const items: MasonryItem[] = [];

    filtered.forEach((project) => {
      // Add images
      project.images.forEach((image: string, imageIndex: number) => {
        items.push({
          id: `${project.id}-img-${imageIndex}`,
          img: image,
          project,
          imageIndex,
          precalculatedHeight: Math.floor(Math.random() * 200) + 320,
          isVideo: false,
        });
      });

      // Add videos
      if (project.videos) {
        project.videos.forEach((video: string, videoIndex: number) => {
          items.push({
            id: `${project.id}-vid-${videoIndex}`,
            img: video,
            project,
            imageIndex: videoIndex,
            precalculatedHeight: Math.floor(Math.random() * 200) + 380,
            isVideo: true,
          });
        });
      }
    });

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
        const allMedia = [
          ...selectedImage.project.images.map((_, idx) => ({ isVideo: false, idx })),
          ...(selectedImage.project.videos?.map((_, idx) => ({ isVideo: true, idx })) || [])
        ];
        const prevItem = allMedia[selectedImage.imageIndex - 1];
        setSelectedImage({
          project: selectedImage.project,
          imageIndex: selectedImage.imageIndex - 1,
          isVideo: prevItem.isVideo,
        });
      } else if (e.key === 'ArrowRight') {
        const allMedia = [
          ...selectedImage.project.images.map((_, idx) => ({ isVideo: false, idx })),
          ...(selectedImage.project.videos?.map((_, idx) => ({ isVideo: true, idx })) || [])
        ];
        if (selectedImage.imageIndex < allMedia.length - 1) {
          const nextItem = allMedia[selectedImage.imageIndex + 1];
          setSelectedImage({
            project: selectedImage.project,
            imageIndex: selectedImage.imageIndex + 1,
            isVideo: nextItem.isVideo,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const handleMasonryClick = useCallback((item: MasonryItem) => {
    setSelectedImage({ 
      project: item.project, 
      imageIndex: item.imageIndex,
      isVideo: item.isVideo,
    });
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Get current media (image or video) for modal
  const getCurrentMedia = () => {
    if (!selectedImage) return null;
    
    const allMedia = [
      ...selectedImage.project.images.map(img => ({ src: img, isVideo: false })),
      ...(selectedImage.project.videos?.map(vid => ({ src: vid, isVideo: true })) || [])
    ];
    
    return allMedia[selectedImage.imageIndex] || null;
  };

  const getTotalMediaCount = (project: Project) => {
    return project.images.length + (project.videos?.length || 0);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      <Hero />

      {/* Category Filter - Sticky with improved micro-interactions */}
      <div
        className={`sticky top-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl'
            : 'bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`relative flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-xl font-semibold text-[10px] sm:text-xs md:text-sm transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  activeCategory === category
                    ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-lg shadow-${category === 'Solar Installation' ? 'orange' : category === 'Borehole Drilling' ? 'blue' : category === 'Water Tower' ? 'green' : 'purple'}-500/30 transform scale-105`
                    : 'bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/80 hover:scale-105 hover:shadow-md'
                }`}
              >
                <span className="transition-transform duration-300 group-hover:rotate-12">
                  {getCategoryIcon(category)}
                </span>
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
                {activeCategory === category && (
                  <span className="absolute inset-0 animate-pulse bg-white/10 rounded-xl" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results count with micro-animation */}
          <div className="mb-6 sm:mb-8 md:mb-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filteredItems.length}</span> items
              </span>
              {filteredItems.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  <span className="animate-pulse">●</span>
                  {filteredItems.filter(i => i.isVideo).length} videos
                </span>
              )}
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <Masonry
              items={filteredItems}
              onItemClick={handleMasonryClick}
              gap={16}
              renderItem={(item) => (
                <div 
                  className="relative group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Media Container */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    {item.isVideo ? (
                      <>
                        <video
                          src={item.img}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          muted
                          playsInline
                          loop
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all duration-500 group-hover:bg-black/20 group-hover:backdrop-blur-sm">
                          <div className="rounded-full bg-white/95 backdrop-blur-sm p-3 sm:p-4 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-white">
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-black/80 ml-0.5 transition-transform duration-300 group-hover:scale-110" />
                          </div>
                        </div>
                        {/* Video progress bar animation on hover */}
                        {hoveredItem === item.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 animate-progress" />
                        )}
                      </>
                    ) : (
                      <img
                        src={item.img}
                        alt={`${item.project.title} - ${item.imageIndex + 1}`}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Badges with micro-interactions */}
                  <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-10 flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge className={`bg-gradient-to-r ${getCategoryColor(item.project.category)} text-white shadow-lg text-[9px] sm:text-xs md:text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                      {getCategoryShortName(item.project.category)}
                    </Badge>
                    {item.isVideo && (
                      <Badge className="bg-red-500/90 backdrop-blur-sm text-white shadow-lg text-[9px] sm:text-xs md:text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse">
                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        Video
                      </Badge>
                    )}
                  </div>

                  {/* Info Card - Slide up with improved animation */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-4 lg:p-5 transform translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out z-10">
                    <div className="bg-black/80 backdrop-blur-xl rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/5 shadow-xl">
                      <h3 className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg mb-0.5 sm:mb-1 md:mb-2 line-clamp-2 transition-all duration-300 group-hover:tracking-wide">
                        {item.project.title}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-blue-200/80 text-[10px] sm:text-xs md:text-sm">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                        <span className="truncate">{item.project.location}</span>
                      </div>
                      <p className="text-gray-300/80 text-[9px] sm:text-xs md:text-sm mt-1 sm:mt-1.5 md:mt-2 lg:mt-3 line-clamp-2 transition-all duration-300 group-hover:text-gray-200">
                        {item.project.description}
                      </p>
                    </div>
                  </div>

                  {/* Image counter badge - shows on hover */}
                  <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10">
                      {item.imageIndex + 1}
                    </span>
                  </div>
                </div>
              )}
            />
          ) : (
            // Empty State with improved animation
            <div className="text-center py-16 sm:py-24 md:py-32 animate-fadeIn">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center transform transition-all duration-500 hover:scale-110">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                No Projects Found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base md:text-lg max-w-md mx-auto mb-6 sm:mb-8 px-4">
                We're constantly expanding our portfolio. Check back soon for new {activeCategory.toLowerCase()} projects!
              </p>
              <button
                onClick={() => handleCategoryChange('All')}
                className="group bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base inline-flex items-center gap-2"
              >
                View All Projects
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Media Modal with improved UI */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] sm:max-w-5xl max-h-[90vh]">
            {/* Media Container */}
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {getCurrentMedia()?.isVideo ? (
                <video
                  src={getCurrentMedia()?.src}
                  className="max-w-full max-h-[75vh] object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={getCurrentMedia()?.src}
                  alt={selectedImage.project.title}
                  className="max-w-full max-h-[75vh] object-contain"
                />
              )}
            </div>

            {/* Media Info - Sliding up from bottom */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 animate-slideUp">
              <div className="bg-black/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white border border-white/10 shadow-2xl transition-all duration-300 hover:bg-black/90">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Badge className={`bg-gradient-to-r ${getCategoryColor(selectedImage.project.category)} text-white text-[10px] sm:text-xs md:text-sm transition-all duration-300 hover:scale-105`}>
                    {selectedImage.project.category}
                  </Badge>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-blue-200 text-[10px] sm:text-xs md:text-sm">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                    <span>{selectedImage.project.location}</span>
                  </div>
                  {selectedImage.isVideo && (
                    <Badge className="bg-red-500/90 text-white text-[10px] sm:text-xs md:text-sm animate-pulse">
                      <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      Video
                    </Badge>
                  )}
                  <span className="ml-auto text-[10px] sm:text-xs text-white/40">
                    {selectedImage.imageIndex + 1} / {getTotalMediaCount(selectedImage.project)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1">
                  {selectedImage.project.title}
                </h3>
              </div>
            </div>

            {/* Close Button with hover effect */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 sm:-top-12 md:-top-14 right-0 text-white hover:text-gray-300 transition-all duration-300 bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 md:p-2.5 hover:bg-black/70 hover:scale-110 rotate-0 hover:rotate-90"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>

            {/* Navigation Buttons with improved hover */}
            {selectedImage.imageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const allMedia = [
                    ...selectedImage.project.images.map((_, idx) => ({ isVideo: false, idx })),
                    ...(selectedImage.project.videos?.map((_, idx) => ({ isVideo: true, idx })) || [])
                  ];
                  const prevItem = allMedia[selectedImage.imageIndex - 1];
                  setSelectedImage({
                    project: selectedImage.project,
                    imageIndex: selectedImage.imageIndex - 1,
                    isVideo: prevItem.isVideo,
                  });
                }}
                className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 sm:p-2.5 md:p-3 hover:bg-black/70 transition-all duration-300 hover:scale-110 group"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:-translate-x-0.5" />
              </button>
            )}

            {selectedImage.imageIndex < getTotalMediaCount(selectedImage.project) - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const allMedia = [
                    ...selectedImage.project.images.map((_, idx) => ({ isVideo: false, idx })),
                    ...(selectedImage.project.videos?.map((_, idx) => ({ isVideo: true, idx })) || [])
                  ];
                  const nextItem = allMedia[selectedImage.imageIndex + 1];
                  setSelectedImage({
                    project: selectedImage.project,
                    imageIndex: selectedImage.imageIndex + 1,
                    isVideo: nextItem.isVideo,
                  });
                }}
                className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 sm:p-2.5 md:p-3 hover:bg-black/70 transition-all duration-300 hover:scale-110 group"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
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

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
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