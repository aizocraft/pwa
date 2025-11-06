import { CheckCircle, Award, Users, Wrench } from "lucide-react";

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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Plasma Water Africa
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trusted expertise delivering sustainable solutions across Africa
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:scale-110 transition-transform">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
