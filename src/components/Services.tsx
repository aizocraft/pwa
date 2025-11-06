import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Sun, Building2 } from "lucide-react";

const services = [
  {
    icon: Droplets,
    title: "Borehole Drilling",
    description: "Professional water borehole drilling services using advanced equipment and techniques. We provide reliable access to clean groundwater for residential, commercial, and agricultural needs.",
    features: ["Advanced drilling technology", "Geological surveys", "Water quality testing", "Sustainable extraction"]
  },
  {
    icon: Sun,
    title: "Solar Installation",
    description: "Complete solar energy solutions from design to installation. We harness Africa's abundant sunshine to provide clean, renewable power for homes, businesses, and communities.",
    features: ["Custom system design", "High-efficiency panels", "Battery storage options", "Professional installation"]
  },
  {
    icon: Building2,
    title: "Water Tower Construction",
    description: "Expert water tower design and construction for reliable water storage and distribution. Our structures ensure consistent water pressure and supply for communities and facilities.",
    features: ["Structural engineering", "Capacity planning", "Durable materials", "Maintenance support"]
  }
];

const Services = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive water and energy solutions tailored to Africa's unique needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 border-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4 shadow-soft">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
