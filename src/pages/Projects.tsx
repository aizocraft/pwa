import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Sun, Droplets, Battery, Zap, MapPin, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Masonry from "@/components/Masonry";
import Galaxy from "@/components/Galaxy";

const projects = [
  {
    title: "Solar Panel Installation - Residential",
    location: "Nairobi, Kenya",
    category: "Solar Installation",
    images: [
      "/images/solar-image1.jpg",
      "/images/solar-image2.jpg",
      "/images/solar-image3.jpg",
      "/images/solar-image4.jpg",
      "/images/solar-4.jpg"
    ]
  },
  {
    title: "Community Borehole Project",
    location: "Kampala, Uganda",
    category: "Borehole Drilling",
    images: [
      "/images/borehole-drilling1.jpg",
      "/images/borehole-drilling2.jpg",
      "/images/borehole-drilling3.jpg",
      "/images/borehole-drilling4.jpg",
      "/images/borehole-drilling5.jpg"
    ]
  },
  {
    title: "Water Tower Construction",
    location: "Dar es Salaam, Tanzania",
    category: "Water Tower",
    images: [
      "/images/tower-construction1.jpg",
      "/images/tower-construction2.jpg",
      "/images/watertower.jpg"
    ]
  },
  {
    title: "Commercial Solar Farm",
    location: "Kigali, Rwanda",
    category: "Solar Installation",
    images: [
      "/images/solar.jpg",
      "/images/solar-image1.jpg",
      "/images/solar-image2.jpg",
      "/images/solar-image3.jpg"
    ]
  },
  {
    title: "Hospital Water System",
    location: "Mombasa, Kenya",
    category: "Combined Solution",
    images: [
      "/images/Combined-1.jpg",
      "/images/combined-2.jpg",
      "/images/combined-3.jpg"
    ]
  },
  {
    title: "Urban Solar Grid",
    location: "Lagos, Nigeria",
    category: "Solar Installation",
    images: [
      "/images/solar-image4.jpg",
      "/images/solar-4.jpg",
      "/images/solar.jpg"
    ]
  },
  {
    title: "Rural Water Supply",
    location: "Addis Ababa, Ethiopia",
    category: "Borehole Drilling",
    images: [
      "/images/borehole.jpg",
      "/images/borehole-drilling1.jpg",
      "/images/borehole-drilling2.jpg"
    ]
  },
  {
    title: "Industrial Water System",
    location: "Cairo, Egypt",
    category: "Water Tower",
    images: [
      "/images/watertower.jpg",
      "/images/tower-construction1.jpg",
      "/images/tower-construction2.jpg"
    ]
  }
];

const categories = ["All", "Solar Installation", "Borehole Drilling", "Water Tower", "Combined Solution"];

// Masonry items configuration
const createMasonryItems = (projects: any[]) => {
  return projects.flatMap((project, projectIndex) => 
    project.images.map((image: string, imageIndex: number) => ({
      id: `${projectIndex}-${imageIndex}`,
      img: image,
      url: "#",
      height: Math.floor(Math.random() * 200) + 300, // Random heights between 300-500px
      project: project,
      imageIndex: imageIndex
    }))
  );
};

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ project: any; imageIndex: number } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  const masonryItems = createMasonryItems(filteredProjects);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Solar Installation":
        return <Sun className="h-5 w-5" />;
      case "Borehole Drilling":
        return <Droplets className="h-5 w-5" />;
      case "Water Tower":
        return <Droplets className="h-5 w-5" />;
      case "Combined Solution":
        return <Battery className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Solar Installation":
        return "from-orange-500 to-amber-600";
      case "Borehole Drilling":
        return "from-blue-500 to-blue-700";
      case "Water Tower":
        return "from-green-500 to-green-700";
      case "Combined Solution":
        return "from-purple-500 to-purple-700";
      default:
        return "from-gray-500 to-gray-700";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "Solar Installation":
        return "Solar energy solutions harnessing Africa's abundant sunshine";
      case "Borehole Drilling":
        return "Reliable groundwater access for communities and agriculture";
      case "Water Tower":
        return "Water storage and distribution infrastructure projects";
      case "Combined Solution":
        return "Integrated water and energy systems for complex needs";
      default:
        return "Comprehensive water and energy solutions across Africa";
    }
  };

  // Handle masonry item click
  const handleMasonryClick = (item: any) => {
    setSelectedImage({ project: item.project, imageIndex: item.imageIndex });
  };

  // Scroll to gallery function
  const scrollToGallery = () => {
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      {/* Enhanced Hero Section with Galaxy */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[120px] max-h-[120px] overflow-hidden">
        {/* Galaxy Background */}
        <div className="absolute inset-0 z-0">
          <Galaxy 
            mouseRepulsion={true}
            mouseInteraction={true}
            density={1.2}
            glowIntensity={0.6}
            saturation={0.9}
            hueShift={220}
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/60 to-blue-900/80 z-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
           

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Our <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Projects</span>
            </h1>

          </div>
        </div>
      
      </section>

      {/* Category Tabs with enhanced styling */}
      <section className={`py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border-2 ${
                  activeCategory === category
                    ? `bg-gradient-to-r ${getCategoryColor(category)} text-white border-transparent shadow-lg transform scale-105`
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:shadow-md"
                }`}
              >
                {getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Gallery Section */}
      <section id="gallery-section" className="py-16 bg-gray-50 dark:bg-gray-800 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          {activeCategory === "All" ? (
            <div className="text-center mb-16">
             
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Discover our comprehensive collection of sustainable water and energy projects
              </p>
            </div>
          ) : (
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-4">
                {getCategoryIcon(activeCategory)}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
                  {activeCategory} Projects
                </h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {getCategoryDescription(activeCategory)}
              </p>
            </div>
          )}

          {/* Masonry Grid */}
          {masonryItems.length > 0 ? (
            <Masonry
              items={masonryItems}
              ease="power3.out"
              duration={0.6}
              stagger={0.05}
              animateFrom="bottom"
              scaleOnHover={true}
              hoverScale={0.95}
              blurToFocus={true}
              colorShiftOnHover={false}
              onItemClick={handleMasonryClick}
              renderItem={(item) => (
                <div className="relative group cursor-pointer transform transition-all duration-500 hover:z-10">
                  <img
                    src={item.img}
                    alt={`${item.project.title} - ${item.imageIndex + 1}`}
                    className="w-full h-auto object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`bg-gradient-to-r ${getCategoryColor(item.project.category)} text-white border-0 backdrop-blur-sm shadow-lg`}>
                      {item.project.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                        {item.project.title}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-200 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{item.project.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </div>
              )}
            />
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-24">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center shadow-2xl">
                <Zap className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-4">
                No Projects Found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-lg max-w-md mx-auto mb-8">
                We're constantly expanding our portfolio. Check back soon for new {activeCategory.toLowerCase()} projects!
              </p>
              <button
                onClick={() => setActiveCategory("All")}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <img
              src={selectedImage.project.images[selectedImage.imageIndex]}
              alt={selectedImage.project.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-6 text-white border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`bg-gradient-to-r ${getCategoryColor(selectedImage.project.category)} text-white border-0 text-sm py-1 px-3`}>
                    {selectedImage.project.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-blue-300 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedImage.project.location}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedImage.project.title}</h3>
                <p className="text-blue-100 text-lg">Project Image {selectedImage.imageIndex + 1} of {selectedImage.project.images.length}</p>
              </div>
            </div>
            
            {/* Enhanced Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-16 right-0 text-white hover:text-gray-300 transition-colors bg-black/50 backdrop-blur-sm rounded-full p-3 hover:bg-black/70"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Projects;