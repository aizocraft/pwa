// src/components/Services.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Sun, Building2, CheckCircle2, X, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Service {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  longDescription: string;
  image: string;
  gradient: string;
  lightGradient: string;
  iconBg: string;
  iconColor: string;
  hoverShadow: string;
  stats: { value: string; label: string }[];
}

const services: Service[] = [
  {
    Icon: Droplets,
    title: "Borehole Drilling",
    description: "Reliable access to clean groundwater using advanced drilling technology, geological surveys, and sustainable extraction methods.",
    longDescription: "Our borehole drilling service utilizes state-of-the-art technology and geological expertise to provide sustainable water solutions. We conduct comprehensive site assessments, utilize advanced drilling rigs, and implement strict quality control measures to ensure optimal water yield and purity.",
    features: [
      "Advanced drilling technology",
      "Geological surveys",
      "Water quality testing",
      "Sustainable extraction",
      "Pump installation",
      "Maintenance contracts"
    ],
    image: "/images/borehole.jpg",
    gradient: "from-blue-600 to-blue-800",
    lightGradient: "from-blue-500 to-blue-700",
    iconBg: "bg-blue-600",
    iconColor: "text-blue-50",
    hoverShadow: "hover:shadow-blue-500/30",
    stats: [
      { value: "500+", label: "Projects" },
      { value: "98%", label: "Success Rate" },
      { value: "24/7", label: "Support" }
    ]
  },
  {
    Icon: Sun,
    title: "Solar Installation",
    description: "Complete solar energy solutions from design to installation. Harness Africa's sunshine for clean, reliable power.",
    longDescription: "Transform your energy consumption with our custom solar solutions. We design, supply, and install high-efficiency solar systems tailored to your specific needs, reducing your carbon footprint while maximizing energy savings.",
    features: [
      "Custom system design",
      "High-efficiency panels",
      "Battery storage options",
      "Professional installation",
      "Smart monitoring",
      "10-year warranty"
    ],
    image: "/images/solar.jpg",
    gradient: "from-amber-500 to-orange-600",
    lightGradient: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-600",
    iconColor: "text-amber-50",
    hoverShadow: "hover:shadow-amber-500/30",
    stats: [
      { value: "1MW+", label: "Installed" },
      { value: "40%", label: "Savings" },
      { value: "25+", label: "Experts" }
    ]
  },
  {
    Icon: Building2,
    title: "Water Tower Construction",
    description: "Expert design and construction of durable water towers for reliable storage and distribution.",
    longDescription: "Our water tower construction service delivers robust, long-lasting structures engineered to withstand environmental challenges. We specialize in elevated storage solutions that ensure consistent water pressure and supply for communities and industries.",
    features: [
      "Structural engineering",
      "Capacity planning",
      "Durable materials",
      "Maintenance support",
      "Seismic design",
      "Corrosion protection"
    ],
    image: "/images/watertower.jpg",
    gradient: "from-emerald-600 to-green-700",
    lightGradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-600",
    iconColor: "text-emerald-50",
    hoverShadow: "hover:shadow-emerald-500/30",
    stats: [
      { value: "50+", label: "Towers" },
      { value: "100K+", label: "People" },
      { value: "30+", label: "Years" }
    ]
  },
];

// Custom 3D Tilt Card Component
const TiltCard3D = ({ 
  children, 
  className = ""
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Fixed variants with correct Framer Motion types
const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.3
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 30, 
    transition: { 
      duration: 0.2,
      type: "tween"
    } 
  },
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const Services = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const openModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => setSelectedService(null), 300);
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16 lg:mb-24"
        >

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">
            What We{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Offer
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light px-4">
            Sustainable water and energy solutions engineered for Africa's future.
          </p>
        </motion.div>

        {/* Desktop: 3D Tilt Cards */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.Icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <TiltCard3D>
                  <div 
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl transition-all duration-500 cursor-pointer"
                    onClick={() => openModal(service)}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-85 group-hover:opacity-75 transition-opacity duration-500`} />
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-6 lg:p-8 min-h-[360px] lg:min-h-[380px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                          <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${service.iconBg} flex items-center justify-center shadow-2xl ring-4 ring-white/20 transform transition-transform duration-300 group-hover:scale-110`}>
                            <Icon className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl lg:text-2xl font-bold text-white leading-tight">
                              {service.title}
                            </h3>
                            <div className="w-12 h-0.5 bg-white/60 rounded-full mt-2 transition-all duration-300 group-hover:w-20" />
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {hoveredIndex === index && (
                            <motion.p 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.3 }}
                              className="text-white/90 text-sm leading-relaxed"
                            >
                              {service.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(service);
                        }}
                        className="w-full h-11 lg:h-12 bg-white/15 backdrop-blur-sm text-white font-semibold text-sm rounded-xl border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                      >
                        Explore Service
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </TiltCard3D>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile & Tablet: Clean Cards */}
        <div className="grid gap-5 sm:gap-6 lg:hidden">
          {services.map((service, index) => {
            const Icon = service.Icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`group overflow-hidden rounded-2xl sm:rounded-3xl border-0 shadow-xl ${service.hoverShadow} transition-all duration-500 bg-white dark:bg-gray-900 hover:scale-[1.02] cursor-pointer`}
                  onClick={() => openModal(service)}
                >
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-6 flex items-center gap-2 sm:gap-3">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${service.iconBg} flex items-center justify-center shadow-xl ring-4 ring-white/30 transform transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-xl">{service.title}</h3>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light line-clamp-2">
                      {service.description}
                    </p>

                    {/* Stats Section for Mobile */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {service.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className={`text-base sm:text-lg font-bold ${service.iconColor.replace("50", "600")}`}>{stat.value}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <ul className="space-y-2 sm:space-y-3">
                      {service.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-medium">
                          <CheckCircle2 className={`h-4 w-4 sm:h-5 sm:w-5 ${service.iconColor.replace("50", "500")} mr-2 sm:mr-3 flex-shrink-0`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(service);
                      }}
                      className={`w-full h-11 sm:h-12 text-sm font-semibold bg-gradient-to-r ${service.lightGradient} text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group`}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Modal */}
        <AnimatePresence mode="wait">
          {isModalOpen && selectedService && (
            <motion.div
              key="modal-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={closeModal}
            >
              <motion.div
                key="modal-content"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[95%] sm:max-w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with gradient */}
                <div className={`relative bg-gradient-to-r ${selectedService.gradient} p-4 sm:p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${selectedService.iconBg} flex items-center justify-center shadow-xl flex-shrink-0`}>
                        <selectedService.Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{selectedService.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                          <span className="text-white/80 text-xs sm:text-sm">Trusted Solution</span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={closeModal}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all flex-shrink-0 ml-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                    >
                      <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </motion.button>
                  </div>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(90vh-100px)]">
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Image */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg">
                      <img
                        src={selectedService.image}
                        alt={selectedService.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                      {selectedService.longDescription}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 py-3 sm:py-4 border-y border-gray-200 dark:border-gray-700">
                      {selectedService.stats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className={`text-lg sm:text-2xl font-bold ${selectedService.iconColor.replace("50", "600")}`}>{stat.value}</div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {selectedService.features.map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start"
                          >
                            <CheckCircle2 className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedService.iconColor.replace("50", "500")} mr-2 sm:mr-3 mt-0.5 flex-shrink-0`} />
                            <span className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      className={`w-full h-11 sm:h-14 text-sm sm:text-base font-bold bg-gradient-to-r ${selectedService.lightGradient} text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 group`}
                      onClick={() => {
                        closeModal();
                        setTimeout(() => {
                          window.location.href = "/contact";
                        }, 200);
                      }}
                    >
                      Request a Quote
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Services;