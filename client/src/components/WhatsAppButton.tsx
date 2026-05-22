// src/components/WhatsAppButton.tsx
'use client';

import React, { useEffect, useState } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  accountName?: string;
  welcomeMessage?: string;
  avatar?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = "254728749722",
  accountName = "Plasma Water Africa",
  welcomeMessage = "Hi there! 👋 How can we assist you today?",
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
          className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full p-4 shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-pulse-slow"
        >
          {/* Ripple Effect */}
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ripple"></span>
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ripple-delay"></span>
          
          <MessageCircle className="w-7 h-7 relative z-10" />
          
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* WhatsApp Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-500 transform ${
            isMinimized ? 'h-14' : 'h-[520px]'
          } ${isVisible ? 'translate-y-0' : 'translate-y-24'} animate-slideUp`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={avatar} 
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
              <div className="flex-1 p-4 overflow-y-auto h-[380px] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
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
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Quick replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Product pricing 💰",
                      "Technical support 🔧",
                      "Shipping info 🚚",
                      "Warranty details 📋"
                    ].map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(reply)}
                        className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
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
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  We'll respond within 30 minutes ⚡
                </p>
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