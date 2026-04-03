import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import boreholeImage from "@/assets/borehole-drilling5.jpg";
import solarImage from "@/assets/solar.jpg";
import watertowerImage from "@/assets/watertower.jpg";
import SplitText from "./SplitText";
import ShinyText from './ShinyText';
import Counter from "./Counter";
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
              text="Experts in borehole drilling, solar installations, and water tower construction. Bringing clean water and renewable energy to communities across the continent." 
              disabled={false} 
              speed={2} 
              className="text-xl md:text-2xl text-white/95 leading-relaxed font-medium drop-shadow-lg" 
            />
          </div>

          {/* Buttons */}
         {/* Enhanced Buttons */}
<div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
  <Button 
    size="lg" 
    onClick={() => window.location.href = '/contact'}
    className="relative bg-accent hover:bg-accent/90 text-primary-foreground text-lg px-12 py-8 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-semibold border-2 border-accent overflow-hidden group"
  >
    {/* Animated background shine effect */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    
    {/* Ripple effect container */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 ripple-effect"></div>
    </div>

    {/* Button content with animation */}
    <span className="relative z-10 flex items-center justify-center">
      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
        Get Started
      </span>
      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
    </span>

    {/* Success state animation */}
    <div className="absolute inset-0 bg-green-500 scale-0 group-focus:scale-100 transition-transform duration-500 rounded-md"></div>
  </Button>

  <Button 
    size="lg" 
    variant="outline"
    onClick={() => window.location.href = '/about'}
    className="relative border-3 border-white text-white hover:bg-white hover:text-primary text-lg px-12 py-8 transition-all duration-300 font-semibold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-primary-foreground overflow-hidden group"
  >
    {/* Gradient border animation */}
    <div className="absolute inset-0 border-3 border-transparent bg-gradient-to-r from-accent via-white to-accent bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
    
    {/* Background slide effect */}
    <div className="absolute inset-0 bg-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
    
    {/* Icon that appears on hover */}
    <svg className="absolute left-4 w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 -translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>

    <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300">
      Learn More
    </span>

    {/* Floating particles effect */}
    <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className="absolute w-1 h-1 bg-accent/30 rounded-full top-1/4 left-1/4 animate-float"></div>
      <div className="absolute w-1 h-1 bg-accent/30 rounded-full top-1/3 right-1/3 animate-float" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute w-1 h-1 bg-accent/30 rounded-full bottom-1/4 left-1/2 animate-float" style={{animationDelay: '1s'}}></div>
    </div>
  </Button>
</div>

         {/* Animated Stats Section */}
<div className="hidden md:block mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
  <div className="text-center group">
    <div className="relative">
      <div className="text-3xl font-bold text-accent drop-shadow-lg">
        <Counter end={500} duration={2} suffix="+" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:via-white/20 transition-all duration-500"></div>
    </div>
    <div className="text-lg text-white/90 mt-2 group-hover:text-white transition-colors duration-300 flex items-center justify-center">
      <svg className="w-5 h-5 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      Boreholes Drilled
    </div>
    <div className="w-0 group-hover:w-12 h-0.5 bg-accent mx-auto mt-3 transition-all duration-500"></div>
  </div>

  <div className="text-center group">
    <div className="relative">
      <div className="text-3xl font-bold text-accent drop-shadow-lg">
        <Counter end={100} duration={2.5} suffix="+" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:via-white/20 transition-all duration-500"></div>
    </div>
    <div className="text-lg text-white/90 mt-2 group-hover:text-white transition-colors duration-300 flex items-center justify-center">
      <svg className="w-5 h-5 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      Solar Installations
    </div>
    <div className="w-0 group-hover:w-12 h-0.5 bg-accent mx-auto mt-3 transition-all duration-500"></div>
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