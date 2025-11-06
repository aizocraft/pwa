import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Sun, Building2, CheckCircle, Zap, ArrowRight, Play, Pause, Battery, Wifi, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const servicesDetail = [
  {
    icon: Droplets,
    title: "Borehole Drilling",
    description: "Professional water borehole drilling services using advanced equipment and techniques.",
    features: [
      "Comprehensive geological surveys and site assessment",
      "Advanced drilling technology up to 300 meters depth",
      "Complete water quality testing and analysis",
      "Pump installation and setup",
      "Sustainable water extraction methods",
      "Ongoing maintenance and support"
    ],
    benefits: [
      "Reliable access to clean groundwater",
      "Reduced dependence on municipal water",
      "Cost-effective long-term solution",
      "Perfect for residential, commercial, and agricultural use"
    ],
    stats: [
      { value: "300m", label: "Max Depth" },
      { value: "24h", label: "Support" },
      { value: "99%", label: "Success Rate" }
    ],
    color: "from-cyan-400 to-blue-500",
    bgColor: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20"
  },
  {
    icon: Sun,
    title: "Solar Installation",
    description: "Complete solar energy solutions from design to installation and maintenance.",
    features: [
      "Custom system design based on energy needs",
      "High-efficiency solar panels and inverters",
      "Battery storage systems for 24/7 power",
      "Professional installation and commissioning",
      "Grid-tied and off-grid solutions",
      "Monitoring and maintenance packages"
    ],
    benefits: [
      "Significant reduction in electricity costs",
      "Clean, renewable energy source",
      "Reliable power in areas with unstable grid",
      "Increased property value"
    ],
    stats: [
      { value: "25y", label: "Warranty" },
      { value: "90%", label: "Efficiency" },
      { value: "0.5h", label: "Installation" }
    ],
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
  },
  {
    icon: Building2,
    title: "Water Tower Construction",
    description: "Expert water tower design and construction for reliable water storage and distribution.",
    features: [
      "Structural engineering and design",
      "Capacity planning (5,000 to 100,000+ liters)",
      "High-quality corrosion-resistant materials",
      "Pressure optimization systems",
      "Foundation and support structure",
      "Complete installation and testing"
    ],
    benefits: [
      "Consistent water pressure throughout facility",
      "Emergency water reserve capacity",
      "Efficient water distribution network",
      "Reduced pump cycling and energy costs"
    ],
    stats: [
      { value: "100kL", label: "Capacity" },
      { value: "10y", label: "Durability" },
      { value: "50%", label: "Energy Save" }
    ],
    color: "from-blue-400 to-purple-500",
    bgColor: "from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
  }
];

const Services = () => {
  const [activeService, setActiveService] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveService((prev) => (prev + 1) % servicesDetail.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const handleServiceClick = (index: number) => {
    setActiveService(index);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
      <Navbar />
      
      {/* Enhanced Hero Section */}
      <section className="pt-12 pb-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-500" />
        </div>

        {/* Floating Icons */}
        <div className="absolute top-24 right-24 opacity-20 animate-float">
          <Zap className="h-12 w-12 text-cyan-400" />
        </div>
        <div className="absolute bottom-28 left-28 opacity-20 animate-float-delayed">
          <Droplets className="h-16 w-16 text-blue-400" />
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-5 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
                       
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
                     </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"/>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"/>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Service Navigation */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-950/95 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {servicesDetail.map((service, index) => {
              const Icon = service.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleServiceClick(index)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-500 border-2 backdrop-blur-sm ${
                    activeService === index
                      ? `bg-gradient-to-r ${service.color} text-white border-transparent shadow-2xl scale-105`
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-cyan-400 hover:scale-105 hover:shadow-lg"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {service.title}
                </button>
              );
            })}
            
            {/* Auto-play Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-4 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700 hover:border-cyan-400 transition-all duration-300"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Services Detail */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {servicesDetail.map((service, index) => {
            const Icon = service.icon;
            if (index !== activeService) return null;
            
            return (
              <div key={index} className="animate-scale-in">
                <div className="max-w-7xl mx-auto">
                  {/* Service Header */}
                  <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-2xl`}>
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
                      {service.title}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Stats Cards */}
                    {service.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="text-center group">
                        <div className={`p-8 rounded-2xl bg-gradient-to-br ${service.bgColor} border border-gray-200 dark:border-gray-800 group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}>
                          <div className={`text-4xl font-black bg-gradient-to-r ${service.color} bg-clip-text text-transparent mb-2`}>
                            {stat.value}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 font-semibold">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Features Card */}
                    <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <Shield className={`h-6 w-6 ${service.color.replace('from-', 'text-').replace(' to-', '')}`} />
                          What's Included
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start group/item">
                              <CheckCircle className={`h-6 w-6 ${service.color.replace('from-', 'text-').replace(' to-', '')} mr-3 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300`} />
                              <span className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Benefits Card */}
                    <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <Zap className={`h-6 w-6 ${service.color.replace('from-', 'text-').replace(' to-', '')}`} />
                          Key Benefits
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {service.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start group/item">
                              <div className={`w-3 h-3 rounded-full ${service.color.replace('from-', 'bg-').replace(' to-', '')} mr-3 mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300`} />
                              <span className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Button */}
                  <div className="text-center mt-12">
                    <a href="/contact">
                      <Button 
                        size="lg" 
                        className={`bg-gradient-to-r ${service.color} hover:scale-105 text-white text-lg px-12 py-6 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 group`}
                      >
                        <span className="flex items-center gap-3">
                          Get Started
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;