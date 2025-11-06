import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, Eye, Users, Plus, Minus, Star, Droplets, Zap } from "lucide-react";
import { useState } from "react";

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We maintain the highest standards in all our installations and services"
  },
  {
    icon: Target,
    title: "Sustainability",
    description: "Committed to environmentally responsible and long-lasting solutions"
  },
  {
    icon: Eye,
    title: "Innovation",
    description: "Utilizing cutting-edge technology to deliver superior results"
  },
  {
    icon: Users,
    title: "Community",
    description: "Focused on improving lives and empowering African communities"
  }
];

const faqs = [
  {
    question: "What services do you offer?",
    answer:
      "Plasma Water Africa offers a range of services including borehole drilling, maintenance, water pumps, solar products, water treatment, generators, and irrigation systems."
  },
  {
    question: "How can I contact Plasma Water Africa?",
    answer:
      "You can contact us through our website's contact form, by phone, or via email. Our customer support team is always ready to assist you with any inquiries."
  },
  {
    question: "What areas do you serve?",
    answer:
      "We serve clients across multiple African countries, providing reliable water and energy solutions in both rural and urban areas."
  },
  {
    question: "What makes Plasma Water Africa different?",
    answer:
      "Our commitment to sustainability, community empowerment, and technical excellence sets us apart from others in the industry."
  },
  {
    question: "Do you provide customized solutions?",
    answer:
      "Yes, we design solutions tailored to each client's needs, ensuring efficiency, reliability, and long-term value."
  }
];

const About = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [rating, setRating] = useState(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-primary to-blue-700 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-400 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-pulse-slow delay-500" />
        </div>

        {/* Floating Icons */}
        <div className="absolute top-20 right-32 opacity-30 animate-float">
          <Droplets size={48} />
        </div>
        <div className="absolute bottom-32 left-32 opacity-30 animate-float-delayed">
          <Zap size={48} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
                      
            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
              About Plasma Water
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-3xl mx-auto font-light">
              Pioneering innovative technologies and practices to ensure equitable access to clean water and sustainable energy. 
            </p>

   
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            className="w-full h-12 text-background" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              fill="currentColor"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              fill="currentColor"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </section>

      {/* Mission & Vision - Updated to match screenshot */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Vision Card */}
            <Card className="border-2 border-primary/20 shadow-soft hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Lorem Ipsum
                </p>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="border-2 border-secondary/20 shadow-soft hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Lorem Ipsum.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 border-2 group"
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ + Feedback */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          
          {/* FAQ Section - Updated to match screenshot */}
          <Card className="shadow-soft border-2">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary/50 transition-colors duration-200">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="font-semibold text-primary text-lg pr-4">
                        {faq.question}
                      </span>
                      {openIndex === index ? (
                        <Minus size={20} className="text-primary flex-shrink-0" />
                      ) : (
                        <Plus size={20} className="text-primary flex-shrink-0" />
                      )}
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-4 pt-2 text-muted-primary bg-gray-50/50 border-t border-gray-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card className="shadow-soft border-2">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground text-center mb-4">
                We Value Your Feedback!
              </h2>
              
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={32}
                    className={`cursor-pointer transition-colors mx-1 ${
                      i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    } hover:scale-110 transform duration-200`}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>

              {/* Feedback Form */}
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    What did you like or dislike about our services?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Share your experience with us..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Please select a category for your feedback:
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200">
                    <option>Service Quality</option>
                    <option>Customer Support</option>
                    <option>Response Time</option>
                    <option>Pricing</option>
                    <option>Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors duration-200 shadow-soft hover:shadow-elevated transform hover:-translate-y-0.5"
                >
                  Submit Feedback
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;