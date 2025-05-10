import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Bell,
} from "lucide-react";
import NotificationBell from "@/components/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  // Handle sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click close for mobile menu
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest("nav")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  // Close menu when changing location
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { name: "Catalogue", path: "/catalog" },
    { name: "Calendrier", path: "/schedule" },
    { name: "Tarifs", path: "/subscription" },
    { name: "Blog", path: "/blog" },
    { name: "À propos", path: "/about" },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${
        sticky ? "header-sticky py-3" : "py-4 bg-transparent"
      }`}
    >
      <div className="container-wide">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-[#5F8BFF] dark:text-white">
              Nec<span className="text-[#7A6CFF]">form</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => window.location.href = item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive(item.path)
                    ? "text-primary dark:text-white font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white"
                }`}
              >
                {item.name}
              </div>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {user.displayName || user.username}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <div 
                      className="w-full cursor-pointer"
                      onClick={() => window.location.href = user.role === "admin" ? "/admin-dashboard" : user.role === "trainer" ? "/trainer-dashboard" : "/student-dashboard"}
                    >
                      Mon tableau de bord
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div 
                      className="w-full cursor-pointer"
                      onClick={() => window.location.href = "/profile"}
                    >
                      Mon profil
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div 
                      className="w-full cursor-pointer"
                      onClick={() => window.location.href = "/achievements"}
                    >
                      Mes réussites
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth">Connexion</Link>
                </Button>
                <Button className="bg-accent hover:bg-accent/90" asChild>
                  <Link href="/auth?register=true">S'inscrire</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="rounded-full"
              aria-label="Open menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <div 
                  key={item.path}
                  onClick={() => window.location.href = item.path}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.name}
                </div>
              ))}

              {/* Auth Buttons Mobile */}
              <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                {user ? (
                  <>
                    <div
                      onClick={() => window.location.href = user.role === "admin" ? "/admin-dashboard" : user.role === "trainer" ? "/trainer-dashboard" : "/student-dashboard"}
                      className="block px-4 py-3 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      Mon tableau de bord
                    </div>
                    <div
                      onClick={() => window.location.href = "/profile"}
                      className="block px-4 py-3 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      Mon profil
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => window.location.href = "/auth"}
                      className="block px-4 py-3 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      Connexion
                    </div>
                    <div
                      onClick={() => window.location.href = "/auth?register=true"}
                      className="block px-4 py-3 rounded-md text-sm font-medium bg-accent text-white hover:bg-accent/90 cursor-pointer"
                    >
                      S'inscrire
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}