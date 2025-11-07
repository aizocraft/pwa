import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Sun, Building2, CheckCircle, Zap, ArrowRight, Play, Pause, Shield, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CircularGallery from "@/components/CircularGallery";

// Service Images Mapping
const serviceImages: Record<string, { image: string; text: string }[]> = {
  Borehole: [
    { image: "/images/borehole-drilling1.jpg", text: "Site Survey" },
    { image: "/images/borehole-drilling2.jpg", text: "Drilling Rig" },
    { image: "/images/borehole-drilling3.jpg", text: "Deep Bore" },
    { image: "/images/borehole-drilling4.jpg", text: "Pump Setup" },
    { image: "/images/borehole-drilling5.jpg", text: "Water Flow" },
    { image: "/images/borehole.jpg", text: "Clean Supply" },
  ],
  Solar: [
    { image: "/images/solar-image1.jpg", text: "Panel Array" },
    { image: "/images/solar-image2.jpg", text: "Inverter" },
    { image: "/images/solar-image3.jpg", text: "Battery Bank" },
    { image: "/images/solar-image4.jpg", text: "Roof Mount" },
    { image: "/images/solar-4.jpg", text: "Off-Grid" },
    { image: "/images/solar.jpg", text: "Energy Harvest" },
  ],
  "Water Tower": [
    { image: "/images/tower-construction1.jpg", text: "Foundation" },
    { image: "/images/tower-construction2.jpg", text: "Steel Frame" },
    { image: "/images/watertower.jpg", text: "Completed Tower" },
    { image: "/images/Combined-1.jpg", text: "Full System" },
    { image: "/images/combined-2.jpg", text: "Distribution" },
    { image: "/images/combined-3.jpg", text: "Infrastructure" },
  ],
};

// Service Data
const servicesDetail = [
  {
    category: "Water",
    icon: Droplets,
    title: "Borehole Drilling",
    description: "Professional water borehole drilling services using advanced equipment and techniques.",
    features: [
      "Comprehensive geological surveys and site assessment",
      "Advanced drilling technology up to 300 meters depth",
      "Complete water quality testing and analysis",
      "Pump installation and setup",
      "Sustainable water extraction methods",
      "Ongoing maintenance and support",
    ],
    benefits: [
      "Reliable access to clean groundwater",
      "Reduced dependence on municipal water",
      "Cost-effective long-term solution",
      "Perfect for residential, commercial, and agricultural use",
    ],
    stats: [
      { value: "300m", label: "Max Depth" },
      { value: "24h", label: "Support" },
      { value: "99%", label: "Success Rate" },
    ],
    color: "from-cyan-400 to-blue-500",
    bgColor: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
  },
  {
    category: "Energy",
    icon: Sun,
    title: "Solar Installation",
    description: "Complete solar energy solutions from design to installation and maintenance.",
    features: [
      "Custom system design based on energy needs",
      "High-efficiency solar panels and inverters",
      "Battery storage systems for 24/7 power",
      "Professional installation and commissioning",
      "Grid-tied and off-grid solutions",
      "Monitoring and maintenance packages",
    ],
    benefits: [
      "Significant reduction in electricity costs",
      "Clean, renewable energy source",
      "Reliable power in areas with unstable grid",
      "Increased property value",
    ],
    stats: [
      { value: "25y", label: "Warranty" },
      { value: "90%", label: "Efficiency" },
      { value: "0.5h", label: "Installation" },
    ],
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
  },
  {
    category: "Infrastructure",
    icon: Building2,
    title: "Water Tower Construction",
    description: "Expert water tower design and construction for reliable water storage and distribution.",
    features: [
      "Structural engineering and design",
      "Capacity planning (5,000 to 100,000+ liters)",
      "High-quality corrosion-resistant materials",
      "Pressure optimization systems",
      "Foundation and support structure",
      "Complete installation and testing",
    ],
    benefits: [
      "Consistent water pressure throughout facility",
      "Emergency water reserve capacity",
      "Efficient water distribution network",
      "Reduced pump cycling and energy costs",
    ],
    stats: [
      { value: "100kL", label: "Capacity" },
      { value: "10y", label: "Durability" },
      { value: "50%", label: "Energy Save" },
    ],
    color: "from-blue-400 to-purple-500",
    bgColor: "from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20",
  },
];

const Services = () => {
  const [activeService, setActiveService] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof servicesDetail[0] | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter services
  const filteredServices = filterCategory
    ? servicesDetail.filter((s) => s.category === filterCategory)
    : servicesDetail;

  // Auto-play carousel
  useEffect(() => {
    if (isPlaying && filteredServices.length > 1) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveService((prev) => (prev + 1) % filteredServices.length);
            return 0;
          }
          return prev + 100 / (5000 / 100);
        });
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, filteredServices.length]);

  const handleServiceClick = (index: number) => {
    setActiveService(index);
    setProgress(0);
    setIsPlaying(false);
  };

  const openServiceModal = (service: typeof servicesDetail[0]) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setIsPlaying(false);
  };

  const trackEvent = (action: string, label: string) => {
    console.log(`Analytics: ${action} - ${label}`);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Preload first image of each gallery
  useEffect(() => {
    const preload = () => {
      Object.values(serviceImages).forEach((group) => {
        if (group[0]?.image) {
          const img = new Image();
          img.src = group[0].image;
        }
      });
    };
    preload();
  }, []);

  if (filteredServices.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <section className="py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Services Found</h2>
          <p className="text-gray-600 dark:text-gray-400">Try a different category.</p>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-500">
      <Navbar />

      {/* Hero */}
      <section className="pt-16 pb-24 bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 dark:from-gray-950 dark:via-blue-950 dark:to-cyan-950 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-40 right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
              Our Services
            </h1>
          
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50 dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Filters & Tabs */}
      <section className="py-6 bg-white/95 dark:bg-gray-950/95 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {["All", "Water", "Energy", "Infrastructure"].map((cat) => (
              <motion.button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat === "All" ? null : cat);
                  setActiveService(0);
                  setProgress(0);
                  trackEvent("Filter", cat);
                }}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  filterCategory === (cat === "All" ? null : cat)
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {filteredServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.button
                  key={i}
                  onClick={() => handleServiceClick(i)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                    activeService === i
                      ? `bg-gradient-to-r ${service.color} text-white border-transparent shadow-lg`
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-cyan-400"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-5 w-5" />
                  {service.title}
                </motion.button>
              );
            })}
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </motion.button>
          </div>

          {isPlaying && filteredServices.length > 1 && (
            <motion.div className="mt-4 w-full bg-gray-200 rounded-full h-1.5" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }}>
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Service Details + Gallery */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              if (index !== activeService) return null;

              const galleryKey = service.title.includes("Water Tower")
                ? "Water Tower"
                : service.title.split(" ")[0];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="max-w-7xl mx-auto">
                    <motion.div className="text-center mb-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{service.description}</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-12">
                      {service.stats.map((stat, i) => (
                        <motion.div
                          key={i}
                          className="text-center"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className={`p-6 rounded-xl bg-gradient-to-br ${service.bgColor} border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all`}>
                            <div className={`text-3xl font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent mb-2`}>
                              {stat.value}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                          <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                              <Shield className={`h-6 w-6 ${service.color.replace("from-", "text-").replace(" to-", "")}`} />
                              What's Included
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {service.features.map((f, i) => (
                                <li key={i} className="flex items-start">
                                  <CheckCircle className={`h-5 w-5 ${service.color.replace("from-", "text-").replace(" to-", "")} mr-3 mt-1`} />
                                  <span className="text-gray-700 dark:text-gray-300">{f}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <Card className="border-0 shadow-lg hover:shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                          <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                              <Zap className={`h-6 w-6 ${service.color.replace("from-", "text-").replace(" to-", "")}`} />
                              Key Benefits
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {service.benefits.map((b, i) => (
                                <li key={i} className="flex items-start">
                                  <div className={`w-3 h-3 rounded-full ${service.color.replace("from-", "bg-").replace(" to-", "")} mr-3 mt-2`} />
                                  <span className="text-gray-700 dark:text-gray-300">{b}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Circular Gallery */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="mt-16"
                    >
                      <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                        Project Gallery
                      </h3>
                      <div className="h-96 w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
                        <CircularGallery
                          items={serviceImages[galleryKey] || []}
                          bend={2}
                          textColor="#ffffff"
                          borderRadius={0.08}
                          font="bold 24px Figtree"
                          scrollSpeed={3}
                          scrollEase={0.08}
                        />
                      </div>
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Scroll • Drag • Mouse Wheel
                      </p>
                    </motion.div>

                    <motion.div className="text-center mt-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                      <Button
                        size="lg"
                        className={`bg-gradient-to-r ${service.color} text-white text-lg px-10 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl`}
                        onClick={() => {
                          openServiceModal(service);
                          trackEvent("View Details", service.title);
                        }}
                      >
                        <span className="flex items-center gap-3">
                          View Details
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${selectedService.color} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <selectedService.icon className="h-6 w-6 text-white" />
                  <h3 className="text-lg font-bold text-white">{selectedService.title}</h3>
                </div>
                <motion.button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6 text-white" />
                </motion.button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedService.description}</p>
                <h4 className="text-lg font-semibold mb-4">Features</h4>
                <ul className="space-y-3 mb-6">
                  {selectedService.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className={`h-5 w-5 ${selectedService.color.replace("from-", "text-").replace(" to-", "")} mr-3 mt-1`} />
                      <span className="text-gray-700 dark:text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <h4 className="text-lg font-semibold mb-4">Benefits</h4>
                <ul className="space-y-3 mb-6">
                  {selectedService.benefits.map((b, i) => (
                    <li key={i} className="flex items-start">
                      <div className={`w-3 h-3 rounded-full ${selectedService.color.replace("from-", "bg-").replace(" to-", "")} mr-3 mt-2`} />
                      <span className="text-gray-700 dark:text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {selectedService.stats.map((s, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-xl font-bold bg-gradient-to-r ${selectedService.color} bg-clip-text text-transparent`}>
                        {s.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                <a href="/contact" className="block">
                  <Button
                    size="lg"
                    className={`w-full bg-gradient-to-r ${selectedService.color} text-white rounded-xl font-semibold`}
                    onClick={() => trackEvent("Get Started", selectedService.title)}
                  >
                    Get Started
                  </Button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Services;