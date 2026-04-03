import { CheckCircle, Award, Users, Wrench } from "lucide-react";
import LogoLoop from './LogoLoop';
import SplitText from "./SplitText";


const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

// Partner logos configuration
const partnerLogos = [
  { 
    src: "/logos/dayliff.png", 
    alt: "Dayliff", 
    href: "https://www.dayliff.com" 
  },
  { 
    src: "/logos/grundfos.png", 
    alt: "Grundfos", 
    href: "https://www.grundfos.com" 
  },
  { 
    src: "/logos/taflo.png", 
    alt: "Taflo", 
    href: "https://www.taflo.com" 
  },
  // Add more partners as needed
  { 
    src: "/logos/pedrollo.png", 
    alt: "Pedrollo", 
    href: "https://pedrollo.com" 
  },
  { 
    src: "/logo.png", 
    alt: "Partner 2", 
    href: "https://company2.com" 
  },
];

const features = [
  {
    icon: Award,
    title: "Expert Team",
    description: "Certified professionals with years of experience in water and energy solutions"
  },
  {
    icon: CheckCircle,
    title: "Quality Assured",
    description: "Premium equipment and materials ensuring long-lasting, reliable installations"
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "Committed to improving lives through sustainable water and energy access"
  },
  {
    icon: Wrench,
    title: "Full Support",
    description: "Comprehensive maintenance and support services for all our installations"
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Animated Main Title */}
          <div className="mb-4">
            <SplitText
              text="Why Choose Plasma Water Africa?"
              className="text-4xl md:text-5xl font-bold text-foreground"
              delay={100}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 60 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              onLetterAnimationComplete={handleAnimationComplete}
            />
          </div>

                  {/* Regular Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted expertise delivering sustainable solutions across Africa
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                
                {/* Animated Feature Titles */}
                <div className="mb-2">
                  <SplitText
                    text={feature.title}
                    className="text-xl font-semibold text-foreground"
                    delay={200 + (index * 100)}
                    duration={0.6}
                    ease="power2.out"
                    splitType="words"
                    from={{ opacity: 0, x: -30 }}
                    to={{ opacity: 1, x: 0 }}
                    threshold={0.1}
                    rootMargin="-50px"
                    textAlign="center"
                  />
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Partner Logos Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
           
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Partnering with world-class brands to deliver exceptional quality
            </p>
          </div>
          
          <div className="relative h-32 overflow-hidden">
            <LogoLoop
              logos={partnerLogos}
              speed={100}
              direction="left"
              logoHeight={60}
              gap={60}
              pauseOnHover
              scaleOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Our trusted partners"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;