const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          
          {/* Logo and name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="Plasma Water Africa Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Plasma Water Africa
            </span>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Plasma Water Africa. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
