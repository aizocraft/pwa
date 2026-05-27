// src/components/WhatsAppButton.tsx
'use client';

import React, { useEffect, useState } from "react";
import { X, Send, Minimize2 } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  accountName?: string;
  welcomeMessage?: string;
  avatar?: string;
}
 const whatsappAvatar = "/whatsapp-logo.png"; 
const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = "254728749722",
  accountName = "Plasma Water Africa",
  welcomeMessage = "Hi there! 👋 Welcome to Plasma Water Africa. How can we assist you today?",
  avatar = "/logo.png",
 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
                    document.body.classList.contains('dark') ||
                    document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Check scroll position to hide on certain conditions
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide when scrolling down fast, show when scrolling up or at top
      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = () => {
    const text = message || welcomeMessage;
    const encodedMessage = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
    setMessage("");
  };

  const handleQuickReply = (replyText: string) => {
    const fullMessage = `${replyText}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        } ${isVisible ? 'translate-y-0' : 'translate-y-24'}`}
      >
        <button
          onClick={() => setIsOpen(true)}
         // Remove the gradient classes from this line:
className="group relative bg-transparent text-white rounded-full p-3 shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-pulse-slow"
        >
          {/* Ripple Effect */}
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ripple"></span>
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ripple-delay"></span>
          
          {/* Real WhatsApp Icon from local file */}
          <img 
            src={whatsappAvatar} 
            alt="WhatsApp"
            className="w-8 h-8 relative z-10 object-contain"
          />
          
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* WhatsApp Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-500 transform ${
            isMinimized ? 'h-14' : 'h-[560px]'
          } ${isVisible ? 'translate-y-0' : 'translate-y-24'} animate-slideUp`}
        >
          {/* Header */}
<div className="bg-gradient-to-r from-[#000063] to-[#0043b3] rounded-t-2xl p-4 text-white">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={whatsappAvatar} 
                    alt={accountName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-base">{accountName}</h3>
                  <p className="text-xs text-green-100">Online • Usually replies in minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto h-[420px] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                {/* Welcome Message */}
                <div className="flex items-start gap-2 mb-4 animate-fadeIn">
                  <img 
                    src={avatar} 
                    alt={accountName}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                    }}
                  />
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-3 shadow-md">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {welcomeMessage}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                {/* Quick Reply Buttons */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Quick replies:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickReply("I'm interested in Borehole Drilling services. Can you share pricing and process?")}
                      className="text-xs bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-green-200 dark:border-green-800"
                    >
                      🚰 Borehole Drilling
                    </button>
                    <button
                      onClick={() => handleQuickReply("I need Water Pumps for my project. What options do you have?")}
                      className="text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-blue-200 dark:border-blue-800"
                    >
                      💧 Water Pumps
                    </button>
                    <button
                      onClick={() => handleQuickReply("I'm interested in Solar Water Pumping solutions. Tell me more.")}
                      className="text-xs bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-yellow-200 dark:border-yellow-800"
                    >
                      ☀️ Solar Solutions
                    </button>
                    <button
                      onClick={() => handleQuickReply("I need Water Treatment systems for my home/business.")}
                      className="text-xs bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-cyan-200 dark:border-cyan-800"
                    >
                      💧 Water Treatment
                    </button>
                    <button
                      onClick={() => handleQuickReply("I need a Generator. What sizes and prices do you offer?")}
                      className="text-xs bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-orange-200 dark:border-orange-800"
                    >
                      ⚡ Generators
                    </button>
                    <button
                      onClick={() => handleQuickReply("I need Irrigation System for my farm. Can you help?")}
                      className="text-xs bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-emerald-200 dark:border-emerald-800"
                    >
                      🌾 Irrigation
                    </button>
                    <button
                      onClick={() => handleQuickReply("I'm interested in Swimming Pool construction and maintenance.")}
                      className="text-xs bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-sky-200 dark:border-sky-800"
                    >
                      🏊 Swimming Pools
                    </button>
                    <button
                      onClick={() => handleQuickReply("I need a quotation for multiple products. Can you help?")}
                      className="text-xs bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-3 py-2 rounded-xl transition-all duration-200 text-left border border-purple-200 dark:border-purple-800"
                    >
                      📋 Request Quotation
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>✓ 24/7 Support</span>
                    <span>✓ Free Consultation</span>
                    <span>✓ Quality Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white transition-all"
                    rows={1}
                    style={{ maxHeight: '80px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !welcomeMessage}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl p-2.5 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes rippleDelay {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-ripple {
          animation: ripple 1.5s ease-out infinite;
        }
        
        .animate-ripple-delay {
          animation: rippleDelay 1.5s ease-out infinite 0.75s;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};

export default WhatsAppButton;