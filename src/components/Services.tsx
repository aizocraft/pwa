import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Sun, Building2, CheckCircle2, X, ArrowRight } from "lucide-react";
import TiltedCard from "@/components/TiltedCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Service {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  image: string;
  gradient: string;
  lightGradient: string;
  iconBg: string;
  iconColor: string;
  hoverShadow: string;
}

const services: Service[] = [
  {
    Icon: Droplets,
    title: "Borehole Drilling",
    description:
      "Reliable access to clean groundwater using advanced drilling technology, geological surveys, and sustainable extraction methods.",
    features: [
      "Advanced drilling technology",
      "Geological surveys",
      "Water quality testing",
      "Sustainable extraction",
    ],
    image: "/images/borehole.jpg",
    gradient: "from-blue-600 to-blue-800",
    lightGradient: "from-blue-500 to-blue-700",
    iconBg: "bg-blue-600",
    iconColor: "text-blue-50",
    hoverShadow: "hover:shadow-blue-500/30",
  },
  {
    Icon: Sun,
    title: "Solar Installation",
    description:
      "Complete solar energy solutions from design to installation. Harness Africa's sunshine for clean, reliable power.",
    features: [
      "Custom system design",
      "High-efficiency panels",
      "Battery storage options",
      "Professional installation",
    ],
    image: "/images/solar.jpg",
    gradient: "from-amber-500 to-orange-600",
    lightGradient: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-600",
    iconColor: "text-amber-50",
    hoverShadow: "hover:shadow-amber-500/30",
  },
  {
    Icon: Building2,
    title: "Water Tower Construction",
    description:
      "Expert design and construction of durable water towers for reliable storage and distribution.",
    features: [
      "Structural engineering",
      "Capacity planning",
      "Durable materials",
      "Maintenance support",
    ],
    image: "/images/watertower.jpg",
    gradient: "from-emerald-600 to-green-700",
    lightGradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-600",
    iconColor: "text-emerald-50",
    hoverShadow: "hover:shadow-emerald-500/30",
  },
];

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.25 } },
};

const Services = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-all duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-5">
            Our{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Sustainable water and energy solutions engineered for Africa's future.
          </p>
        </motion.div>

        {/* Desktop: Tilted Cards – hide description & list */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 lg:gap-10">
          {services.map((service, index) => {
            const Icon = service.Icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
              >
                <TiltedCard
                  imageSrc={service.image}
                  altText={service.title}
                  containerHeight="380px"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  rotateAmplitude={6}
                  scaleOnHover={1.04}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="p-8 text-white h-full flex flex-col justify-between">
                      {/* Header */}
                      <div>
                        <div className="flex items-center gap-4 mb-5">
                          <div
                            className={`w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center shadow-2xl ring-4 ring-white/20`}
                          >
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                              {service.title}
                            </h3>
                            <div className="w-16 h-1 bg-white/60 rounded-full mt-2" />
                          </div>
                        </div>

                        {/* Hidden on desktop */}
                        <p className="hidden text-white/90 text-base leading-relaxed mb-6 line-clamp-3">
                          {service.description}
                        </p>
                      </div>

                      {/* Hidden on desktop */}
                      <ul className="hidden space-y-2.5 mb-6">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-white/95 text-sm font-medium">
                            <CheckCircle2 className="h-4.5 w-4.5 text-white mr-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        onClick={() => openModal(service)}
                        className="group w-full h-12 bg-white/15 backdrop-blur-sm text-white font-semibold text-sm rounded-xl border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Explore Service
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  }
                  captionText=""
                  overlayBackground="linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.80) 45%, rgba(0,0,0,0.70) 100%)"
                  borderRadius="28px"
                  borderColor="rgba(255,255,255,0.18)"
                  shadowColor="rgba(0,0,0,0.35)"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Mobile & Tablet: Clean Cards */}
        <div className="grid gap-6 lg:hidden">
          {services.map((service, index) => {
            const Icon = service.Icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`group overflow-hidden rounded-3xl border-0 shadow-xl ${service.hoverShadow} transition-all duration-500 bg-white dark:bg-gray-900`}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute bottom-5 left-6 flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl ${service.iconBg} flex items-center justify-center shadow-xl ring-4 ring-white/30`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white drop-shadow-xl">{service.title}</h3>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-5">
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed font-light">
                      {service.description}
                    </p>

                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-gray-800 dark:text-gray-200 text-sm font-medium">
                          <CheckCircle2 className={`h-5 w-5 ${service.iconColor.replace("50", "500")} mr-3`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => openModal(service)}
                      className={`w-full h-12 text-sm font-semibold bg-gradient-to-r ${service.lightGradient} text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2`}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && selectedService && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${selectedService.gradient} p-6 rounded-t-3xl flex items-center justify-between sticky top-0 z-10`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${selectedService.iconBg} flex items-center justify-center shadow-xl`}>
                      <selectedService.Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{selectedService.title}</h3>
                  </div>
                  <motion.button
                    onClick={closeModal}
                    className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6 text-white" />
                  </motion.button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />

                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {selectedService.description}
                  </p>

                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h4>
                    <ul className="space-y-4">
                      {selectedService.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className={`h-6 w-6 ${selectedService.iconColor.replace("50", "500")} mr-4 mt-0.5 flex-shrink-0`} />
                          <span className="text-gray-800 dark:text-gray-200 text-base font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    size="lg"
                    className={`w-full h-14 text-base font-bold bg-gradient-to-r ${selectedService.lightGradient} text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3`}
                    onClick={() => (window.location.href = "/contact")}
                  >
                    Request a Quote
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
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