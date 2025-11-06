import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Sun, Droplets, Battery, Zap } from "lucide-react";
import { useState } from "react";

const projects = [
  {
    title: "Solar Panel Installation - Residential",
    location: "Nairobi, Kenya",
    category: "Solar Installation",
    images: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564053489984-317bbd824340?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?w=800&h=600&fit=crop"
    ]
  },
  {
    title: "Community Borehole Project",
    location: "Kampala, Uganda",
    category: "Borehole Drilling",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1577896851231-70ef18861754?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=600&fit=crop"
    ]
  },
  {
    title: "Water Tower Construction",
    location: "Dar es Salaam, Tanzania",
    category: "Water Tower",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1577896851231-70ef18861754?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop"
    ]
  },
  {
    title: "Commercial Solar Farm",
    location: "Kigali, Rwanda",
    category: "Solar Installation",
    images: [
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564053489984-317bbd824340?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?w=800&h=600&fit=crop"
    ]
  },
  {
    title: "Hospital Water System",
    location: "Mombasa, Kenya",
    category: "Combined Solution",
    images: [
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop"
    ]
  },
  {
    title: "Urban Solar Grid",
    location: "Lagos, Nigeria",
    category: "Solar Installation",
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564053489984-317bbd824340?w=800&h=600&fit=crop"
    ]
  },
  {
    title: "Rural Water Supply",
    location: "Addis Ababa, Ethiopia",
    category: "Borehole Drilling",
    images: [
      "https://images.unsplash.com/photo-1577896851231-70ef18861754?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=600&fit=crop"
    ]
  },
  {
    title: "Industrial Water System",
    location: "Cairo, Egypt",
    category: "Water Tower",
    images: [
      "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1577896851231-70ef18861754?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop"
    ]
  }
];

const categories = ["All", "Solar Installation", "Borehole Drilling", "Water Tower", "Combined Solution"];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ project: any; imageIndex: number } | null>(null);

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      {/* Simple Hero Section */}
      <section className="py-12 bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Projects
            </h1>
            
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 border-2 ${
                  activeCategory === category
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-400"
                }`}
              >
                {getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project, projectIndex) => (
              <div key={projectIndex} className="space-y-4">
                {project.images.map((image, imageIndex) => (
                  <div
                    key={imageIndex}
                    className="group relative cursor-pointer bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    onClick={() => setSelectedImage({ project, imageIndex })}
                  >
                    <img
                      src={image}
                      alt={`${project.title} - ${imageIndex + 1}`}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/70 backdrop-blur-sm text-white border-0">
                        {project.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Zap className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                There are no projects in the {activeCategory.toLowerCase()} category yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.project.images[selectedImage.imageIndex]}
              alt={selectedImage.project.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600 text-white border-0">
                    {selectedImage.project.category}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold">{selectedImage.project.title}</h3>
                <p className="text-blue-200">{selectedImage.project.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Projects;