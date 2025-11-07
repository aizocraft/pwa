import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import boreholeImage from "@/assets/borehole-drilling5.jpg";
import solarImage from "@/assets/solar.jpg";
import watertowerImage from "@/assets/watertower.jpg";
import SplitText from "./SplitText";
import ShinyText from './ShinyText';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    { src: boreholeImage, alt: "Borehole drilling in Africa", opacity: 40 },
    { src: solarImage, alt: "Solar installations in Africa", opacity: 30 },
    { src: watertowerImage, alt: "Water tower construction in Africa", opacity: 35 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleTitleAnimationComplete = () => {
    console.log('Plasma Water Africa title animation completed!');
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Images Carousel with Dot Indicators */}
      <div className="absolute inset-0 z-0">
        {/* Background Images */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image.src} 
              alt={image.alt} 
              className="w-full h-full object-cover"
              style={{ opacity: image.opacity / 100 }}
            />
          </div>
        ))}
        
        {/* Enhanced Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/50 to-primary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentImage 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToImage(index)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl text-center animate-fade-in">
          {/* Animated Main Title */}
          <div className="mb-8">
            <SplitText
              text="Plasma Water Africa"
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
              delay={50}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 80 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              onLetterAnimationComplete={handleTitleAnimationComplete}
            />
          </div>

          {/* Shiny Text Subtitle */}
          <div className="mb-10 max-w-3xl mx-auto">
            <ShinyText 
              text="Expert borehole drilling, solar installations, and water tower construction. Bringing clean water and renewable energy to communities across the continent." 
              disabled={false} 
              speed={2} 
              className="text-xl md:text-2xl text-white/95 leading-relaxed font-medium drop-shadow-lg" 
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-primary-foreground text-lg px-10 py-7 shadow-2xl hover:scale-105 transition-all duration-300 font-semibold border-2 border-accent"
            >
              Get Started
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-3 border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-7 transition-all duration-300 font-semibold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-primary-foreground"
            >
              Learn More
            </Button>
          </div>

          {/* Stats or Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent drop-shadow-lg">500+</div>
              <div className="text-lg text-white/90 mt-2">Boreholes Drilled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent drop-shadow-lg">100+</div>
              <div className="text-lg text-white/90 mt-2">Solar Installations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent drop-shadow-lg">50+</div>
              <div className="text-lg text-white/90 mt-2">Communities Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;