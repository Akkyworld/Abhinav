import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Info, Bell, Mail, LogIn, Menu, X, LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", icon: <Home className="h-4 w-4" />, label: "Home" },
    { path: "/about", icon: <Info className="h-4 w-4" />, label: "About" },
    { path: "/alerts", icon: <Bell className="h-4 w-4" />, label: "Alerts" },
    user && { path: "/alerts/create", icon: <Plus className="h-4 w-4" />, label: "Create Alert" },
    { path: "/contact", icon: <Mail className="h-4 w-4" />, label: "Contact" },
  ].filter(Boolean);

  return (
    <nav className="bg-white shadow-xl mb-8 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold text-gray-900">ReliefLink Nepal</span>
          </Link>

          <button
            className="md:hidden p-2 rounded-md text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              item && (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`flex items-center gap-2 px-4 py-2 text-base font-medium transition-all
                      ${isActive(item.path) 
                        ? "bg-blue-400 hover:bg-blue-500 text-white" 
                        : "text-gray-900 hover:bg-blue-50 hover:text-blue-500"}`}
                    size="lg"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            ))}
            {user ? (
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-500 transition-all"
                size="lg"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button
                  variant={isActive("/auth") ? "default" : "ghost"}
                  className={`flex items-center gap-2 px-4 py-2 text-base font-medium transition-all
                    ${isActive("/auth") 
                      ? "bg-blue-400 hover:bg-blue-500 text-white" 
                      : "text-gray-900 hover:bg-blue-50 hover:text-blue-500"}`}
                  size="lg"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-1 absolute top-16 left-0 right-0 bg-white shadow-lg border-t animate-in slide-in-from-top">
            {navItems.map((item) => (
              item && (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`flex items-center w-full justify-start gap-2 px-4 py-3 text-base font-medium transition-all
                      ${isActive(item.path) 
                        ? "bg-blue-400 hover:bg-blue-500 text-white" 
                        : "text-gray-900 hover:bg-blue-50 hover:text-blue-500"}`}
                    size="lg"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            ))}
            {user ? (
              <Button
                variant="ghost"
                className="flex items-center w-full justify-start gap-2 px-4 py-3 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-500 transition-all"
                size="lg"
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant={isActive("/auth") ? "default" : "ghost"}
                  className={`flex items-center w-full justify-start gap-2 px-4 py-3 text-base font-medium transition-all
                    ${isActive("/auth") 
                      ? "bg-blue-400 hover:bg-blue-500 text-white" 
                      : "text-gray-900 hover:bg-blue-50 hover:text-blue-500"}`}
                  size="lg"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};