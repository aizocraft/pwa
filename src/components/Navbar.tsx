import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Droplets, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Projects", path: "/projects" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/logo.png" 
              className="w-12 h-12 rounded-full md:w-16 md:h-16" 
              alt="Plasma Water Africa Logo" 
            />
            <span className="hidden md:inline text-xl font-semibold text-foreground">Plasma Water Africa</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={`px-4 ${
                    isActive(link.path)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
 {/* Mobile Menu Button */}
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetTrigger asChild className="md:hidden">
    <Button variant="ghost" size="icon">
      <Menu className="h-6 w-6" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-64">
    <div className="flex flex-col space-y-4 mt-8">
      {/* Mobile Logo Header */}
      <div className="flex items-center space-x-3 px-4 mb-6">
        <img
          src="/logo.png"
          alt="Plasma Water Africa Logo"
          className="w-10 h-10 rounded-full object-cover md:w-12 md:h-12"
        />
        <span className="text-lg font-semibold text-foreground leading-tight">
          Plasma Water Africa
        </span>
      </div>

      {/* Navigation Links */}
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => setIsOpen(false)}
        >
          <Button
            variant="ghost"
            className={`w-full justify-start text-base ${
              isActive(link.path)
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground hover:bg-muted"
            }`}
          >
            {link.name}
          </Button>
        </Link>
      ))}
    </div>
  </SheetContent>
</Sheet>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
