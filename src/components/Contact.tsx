import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Zap, Droplets, Sparkles, MessageCircle } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Handle form submission
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
      {/* Enhanced Minimal Header */}
      <section className="pt-8 pb-6 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl animate-pulse-slow delay-500" />
        </div>

        {/* Floating Icons */}
        <div className="absolute top-20 right-20 opacity-20 animate-float">
          <MessageCircle className="h-8 w-8 text-cyan-400" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20 animate-float-delayed">
          <Send className="h-8 w-8 text-blue-400" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/10">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium tracking-wider">GET IN TOUCH</span>
            </div>
          
          </div>
        </div>

        {/* Minimal Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-8 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="py-16 bg-white dark:bg-gray-950 transition-colors duration-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Enhanced Contact Info - Ultra Modern */}
            <div className="space-y-8">
              <div className="group">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  {/* Location Card */}
                  <div className="group/card relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-0 group-hover/card:opacity-30 transition duration-500"></div>
                    <div className="relative flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-lg">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300 shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Ruiru Kamakis</h3>
                        <p className="text-gray-600 dark:text-gray-400">Location</p>
                      </div>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="group/card relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover/card:opacity-30 transition duration-500"></div>
                    <div className="relative flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-lg">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300 shadow-lg">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">plasmawaterafrica@gmail.com</h3>
                        <p className="text-gray-600 dark:text-gray-400">Email</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="group/card relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-0 group-hover/card:opacity-30 transition duration-500"></div>
                    <div className="relative flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-lg">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300 shadow-lg">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">0710-743-793</h3>
                        <p className="text-gray-600 dark:text-gray-400">Phone</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Social Media with Real Logos */}
              <div className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  Connect with us
                </h3>
                <div className="flex gap-3">
                  {/* Facebook */}
                  <a
                    href="#"
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 group shadow-lg hover:shadow-2xl"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Twitter */}
                  <a
                    href="#"
                    className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 group shadow-lg hover:shadow-2xl"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="#"
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 group shadow-lg hover:shadow-2xl"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.2 14.815 3.71 13.664 3.71 12.367s.49-2.448 1.297-3.323c.875-.806 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.806.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.806-2.026 1.297-3.323 1.297zm7.716 0c-.36 0-.639-.279-.639-.639v-5.978c0-.36.279-.639.639-.639h1.556c.36 0 .639.279.639.639v5.978c0 .36-.279.639-.639.639h-1.556zm1.556-7.195h-1.556c-.982 0-1.775.793-1.775 1.775v5.978c0 .982.793 1.775 1.775 1.775h1.556c.982 0 1.775-.793 1.775-1.775v-5.978c0-.982-.793-1.775-1.775-1.775z"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="#"
                    className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 group shadow-lg hover:shadow-2xl"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="#"
                    className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 group shadow-lg hover:shadow-2xl"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
        
            </div>

            {/* Enhanced Contact Form - Futuristic */}
            <div className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                {/* Form Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">Contact us</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-cyan-400" />
                      Full Name
                    </label>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name" 
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-cyan-300 dark:hover:border-cyan-600"
                      required
                    />
                  </div>

                  {/* Combined Email/Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      
                      Email  / <Phone className="h-4 w-4 text-green-400" /> Phone 
                    </label>
                    <Input 
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="Enter your email or phone number" 
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600"
                      required
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-pink-400" />
                      Message
                    </label>
                    <Textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type your message here..." 
                      rows={5}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-400 dark:focus:border-pink-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-pink-300 dark:hover:border-pink-600 resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>

                {/* Form Footer */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    We typically respond within 1 hour during business hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;