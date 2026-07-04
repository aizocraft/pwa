"use client";

import type { Metadata } from 'next';
import { useState, useRef, useEffect } from "react";
import { makeSeo } from '../seo';
import { Sun, Droplets, Battery, Zap, MapPin, X } from "lucide-react";
import Hero from "./Hero";


// Simplified Project Data
const projects = [
  {
    id: 1,
    title: "Solar Installation Showcase",
    location: "Various Locations",
    category: "Solar Installation",
    description: "High-efficiency solar panel installations for residential and commercial properties",
    images: [
      "/images/solar-image1.jpg",
      "/images/solar-image2.jpg",
      "/images/solar-image3.jpg",
      "/images/solar-image4.jpg",
      "/images/solar-4.jpg",
      "/images/solar.jpg",
    ]
  },
  {
    id: 2,
    title: "Borehole Drilling Showcase",
    location: "Various Locations",
    category: "Borehole Drilling",
    description: "Professional borehole drilling services for clean water access",
    images: [
      "/images/borehole_drilling.jpeg", 
      "/images/borehole-drilling1.jpg",
      "/images/borehole-drilling2.jpg",
      "/images/borehole-drilling3.jpg",
      "/images/borehole-drilling4.jpg",
      "/images/borehole-drilling5.jpg",
      "/images/borehole.jpg",
    ]
  },
  {
    id: 3,
    title: "Water Tower Construction Showcase",
    location: "Various Locations",
    category: "Water Tower",
    description: "Elevated water storage towers for reliable water distribution",
    images: [
      "/images/watertower1.jpeg",
      "/images/water_tower1.jpeg", 
      "/images/water_tower2.jpeg", 
      "/images/water_tower3.jpeg", 
      "/images/water_tower4.jpeg", 
      "/images/water_tower5.jpeg", 
      "/images/water_tower6.jpeg", 
      "/images/water_tower7.jpeg", 
      "/images/water_tower8.jpeg", 
      "/images/tower-construction1.jpg",
      "/images/tower-construction2.jpg",
      "/images/watertower.jpg"
    ]
  },
  {
    id: 4,
    title: "Combined Solutions Showcase",
    location: "Various Locations",
    category: "Combined Solution",
    description: "Integrated water and solar energy solutions for maximum efficiency",
    images: [
      "/images/Combined-1.jpg",
      "/images/combined-2.jpg",
      "/images/combined-3.jpg"
    ]
  },
];

const categories = ["All", "Solar Installation", "Borehole Drilling", "Water Tower", "Combined Solution"];

export const metadata: Metadata = makeSeo({
  title: 'Our Projects | Plasma Water Africa',
  description:
    'Explore Plasma Water Africa projects across Kenya, including solar installations, borehole drilling, water towers, and integrated energy-water solutions.',
  canonicalPath: '/projects',
  keywords: [
    'Plasma Water Africa projects',
    'solar installation Kenya projects',
    'borehole drilling Kenya',
    'water tower construction Kenya',
    'renewable energy projects Kenya',
    'water and solar solutions Kenya',
  ],
  openGraph: {
    title: 'Plasma Water Africa Projects',
    description:
      'View our completed and ongoing solar, borehole, and water infrastructure projects across Kenya.',
    url: 'https://plasmawater.co.ke/projects',
    images: [{ url: '/images/plasma-water-africa-logo.png', width: 1200, height: 630, alt: 'Plasma Water Africa Projects' }],
  },
  twitter: {
    title: 'Plasma Water Africa Projects',
    description:
      'See our solar, water, and infrastructure projects across Kenya delivered by Plasma Water Africa.',
    images: ['/images/plasma-water-africa-logo.png'],
  },
});

// ============= BADGE COMPONENT =============
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
    {children}
  </span>
);

// ============= REACT BITS STYLE MASONRY COMPONENT =============
const Masonry = ({ 
  items, 
  onItemClick, 
  renderItem,
  gap = 16,
  columnCount = null
}: { 
  items: any[]; 
  onItemClick?: (item: any) => void; 
  renderItem: (item: any) => React.ReactNode;
  gap?: number;
  columnCount?: number | null;
}) => {
  const [columns, setColumns] = useState(columnCount || 3);
  const [columnItems, setColumnItems] = useState<any[][]>([]);
  const [visibleItems, setVisibleItems] = useState<any[]>([]);

  // Responsive column calculation
  useEffect(() => {
    if (columnCount) {
      setColumns(columnCount);
      return;
    }

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
  }, [columnCount]);

  // Staggered animation for items
  useEffect(() => {
    setVisibleItems([]);
    const timeouts: NodeJS.Timeout[] = [];
    
    items.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => [...prev, item]);
      }, index * 50);
      timeouts.push(timeout);
    });
    
    return () => timeouts.forEach(t => clearTimeout(t));
  }, [items]);

  // Distribute items to columns based on height
  useEffect(() => {
    if (visibleItems.length === 0) return;

    // Create column arrays
    const cols: any[][] = Array.from({ length: columns }, () => []);
    const columnHeights: number[] = new Array(columns).fill(0);
    
    // Get all items with their heights
    const itemsWithHeights = visibleItems.map((item, idx) => ({
      item,
      height: item.precalculatedHeight || 300 + Math.random() * 200
    }));
    
    // Distribute items to shortest column
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
        gap: `${gap}px`
      }}
    >
      {columnItems.map((column, colIndex) => (
        <div
          key={colIndex}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`
          }}
        >
          {column.map((item, itemIndex) => (
            <div
              key={`${item.id}-${colIndex}-${itemIndex}`}
              onClick={() => onItemClick?.(item)}
              className="cursor-pointer transform transition-all duration-500 hover:scale-[0.98] animate-fadeInUp"
              style={{
                animationDelay: `${itemIndex * 50}ms`
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

// ============= GALAXY COMPONENT =============
const Galaxy = ({ 
  mouseRepulsion = true, 
  mouseInteraction = true, 
  density = 1.2, 
  glowIntensity = 0.6, 
  saturation = 0.9, 
  hueShift = 220 
}: { 
  mouseRepulsion?: boolean; 
  mouseInteraction?: boolean; 
  density?: number; 
  glowIntensity?: number; 
  saturation?: number; 
  hueShift?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const starsRef = useRef<Array<{ x: number; y: number; z: number; size: number; color: string; originalX: number; originalY: number }>>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    const numStars = Math.floor((canvas.width * canvas.height) / 10000 * (density || 1));
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      stars.push({
        x: x,
        y: y,
        z: Math.random(),
        size: Math.random() * 2 + 1,
        color: `hsl(${hueShift + Math.random() * 60}, ${(saturation || 0.9) * 100}%, ${50 + Math.random() * 30}%)`,
        originalX: x,
        originalY: y
      });
    }
    starsRef.current = stars;

    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      timeRef.current += 0.005;

      starsRef.current.forEach(star => {
        let x = star.x;
        let y = star.y;
        
        // Mouse repulsion effect
        if (mouseRepulsion && mouseInteraction) {
          const dx = mousePosition.current.x - star.x;
          const dy = mousePosition.current.y - star.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;
          
          if (distance < maxDistance) {
            const angle = Math.atan2(dy, dx);
            const force = (1 - distance / maxDistance) * 30;
            x = star.originalX - Math.cos(angle) * force;
            y = star.originalY - Math.sin(angle) * force;
          } else {
            x = star.originalX;
            y = star.originalY;
          }
        }
        
        // Glow effect
        const glowSize = star.size * (1 + (glowIntensity || 0.6) * Math.sin(timeRef.current * 2 + star.z * 10));
        
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        
        // Gradient for glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2);
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mouseRepulsion, mouseInteraction, density, glowIntensity, saturation, hueShift]);
  
  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// ============= MAIN PROJECTS COMPONENT =============
const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ project: any; imageIndex: number } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  // Filter projects based on active category
  useEffect(() => {
    const filtered = activeCategory === "All" 
      ? projects 
      : projects.filter(project => project.category === activeCategory);
    
    // Create masonry items with random heights for realistic masonry effect
    const items = filtered.flatMap((project, projectIndex) => 
      project.images.map((image: string, imageIndex: number) => ({
        id: `${project.id}-${imageIndex}`,
        img: image,
        project: project,
        imageIndex: imageIndex,
        precalculatedHeight: Math.floor(Math.random() * 200) + 320 // Random heights 320-520px
      }))
    );
    
    setFilteredItems(items);
  }, [activeCategory]);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Solar Installation": return <Sun className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Borehole Drilling": return <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Water Tower": return <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Combined Solution": return <Battery className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <Zap className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Solar Installation": return "from-orange-500 to-amber-600";
      case "Borehole Drilling": return "from-blue-500 to-blue-700";
      case "Water Tower": return "from-green-500 to-green-700";
      case "Combined Solution": return "from-purple-500 to-purple-700";
      default: return "from-gray-500 to-gray-700";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "Solar Installation": return "Solar energy solutions harnessing Africa's abundant sunshine";
      case "Borehole Drilling": return "Reliable groundwater access for communities and agriculture";
      case "Water Tower": return "Water storage and distribution infrastructure projects";
      case "Combined Solution": return "Integrated water and energy systems for complex needs";
      default: return "Comprehensive water and energy solutions across Africa";
    }
  };

  const handleMasonryClick = (item: any) => {
    setSelectedImage({ project: item.project, imageIndex: item.imageIndex });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      {/* Hero Section */}
      <Hero />


      {/* Category Filter - Sticky */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category
                    ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-lg transform scale-105`
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105"
                }`}
              >
                {getCategoryIcon(category)}
                <span className="hidden xs:inline">{category}</span>
                <span className="xs:hidden">
                  {category === "Solar Installation" ? "Solar" : 
                   category === "Borehole Drilling" ? "Borehole" :
                   category === "Water Tower" ? "Water" :
                   category === "Combined Solution" ? "Combined" : "All"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        

          {/* Masonry Grid - React Bits Style */}
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
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                    <Badge className={`bg-gradient-to-r ${getCategoryColor(item.project.category)} text-white shadow-lg text-xs sm:text-sm`}>
                      {item.project.category === "Solar Installation" ? "Solar" :
                       item.project.category === "Borehole Drilling" ? "Borehole" :
                       item.project.category === "Water Tower" ? "Water Tower" :
                       item.project.category === "Combined Solution" ? "Combined" : item.project.category}
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
                onClick={() => setActiveCategory("All")}
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
                    imageIndex: selectedImage.imageIndex - 1
                  });
                }}
                className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/70 transition-all"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {selectedImage.imageIndex < selectedImage.project.images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage({
                    project: selectedImage.project,
                    imageIndex: selectedImage.imageIndex + 1
                  });
                }}
                className="absolute right-3 sm:right-6 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-black/70 transition-all"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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
};

export default ProjectsPage;