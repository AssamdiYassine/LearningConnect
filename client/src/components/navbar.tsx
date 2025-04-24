import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import UserDropdown from "@/components/user-dropdown";
import { useQuery } from "@tanstack/react-query";
import { 
  Bell, 
  HelpCircle, 
  Home, 
  Info, 
  Book, 
  Calendar, 
  CreditCard, 
  UserCog, 
  Settings, 
  Menu, 
  X, 
  LogOut
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationItem from "@/components/notification-item";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import OnboardingTrigger from "@/components/onboarding/onboarding-trigger";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Accueil", roles: ["student", "trainer", "admin"], public: true, icon: <Home className="h-4 w-4 mr-2" /> },
    { path: "/about", label: "À propos", roles: ["student", "trainer", "admin"], public: true, icon: <Info className="h-4 w-4 mr-2" /> },
    { path: "/catalog", label: "Formations", roles: ["student", "trainer", "admin"], icon: <Book className="h-4 w-4 mr-2" /> },
    { path: "/schedule", label: "Mon calendrier", roles: ["student", "trainer", "admin"], icon: <Calendar className="h-4 w-4 mr-2" /> },
    { path: "/subscription", label: "Abonnement", roles: ["student"], icon: <CreditCard className="h-4 w-4 mr-2" /> },
    { path: "/trainer", label: "Espace formateur", roles: ["trainer"], icon: <UserCog className="h-4 w-4 mr-2" /> },
    { path: "/admin", label: "Administration", roles: ["admin"], icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  // Filter links based on user role or public status
  const filteredLinks = navLinks.filter(link => 
    link.public || (user && link.roles.includes(user.role))
  );

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled 
        ? "bg-white/95 backdrop-blur-sm shadow-md" 
        : "bg-gradient-to-r from-primary-900/90 to-purple-900/90 text-white"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className={cn(
                  "font-heading font-bold text-xl cursor-pointer transition-colors duration-300",
                  scrolled ? "text-primary-600" : "text-white"
                )}>
                  TechFormPro
                </div>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-6">
              {filteredLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={cn(
                    "flex items-center px-3 py-1 transition-colors duration-200 rounded-full text-sm font-medium",
                    location === link.path
                      ? scrolled 
                        ? "bg-primary-100 text-primary-800" 
                        : "bg-white/20 text-white"
                      : scrolled 
                        ? "text-gray-700 hover:bg-gray-100" 
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center">
            {user ? (
              <div className="flex items-center space-x-1">
                <OnboardingTrigger className="mr-1" variant={scrolled ? "default" : "outline"} />
                
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant={scrolled ? "ghost" : "outline"} 
                        size="icon" 
                        className={cn(
                          "relative",
                          !scrolled && "text-white border-white/40 hover:bg-white/10"
                        )}
                      >
                        <Bell className="h-5 w-5" />
                        {unreadNotifications.length > 0 && (
                          <Badge className="absolute top-0 right-0 h-2 w-2 p-0 bg-red-500 rounded-full" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-2 font-medium">Notifications</div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notification) => (
                            <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                              <NotificationItem notification={notification} />
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">Aucune notification</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <UserDropdown />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button 
                    variant={scrolled ? "outline" : "secondary"} 
                    size="sm"
                    className={!scrolled ? "bg-white/10 text-white hover:bg-white/20 border-white/40" : ""}
                  >
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    size="sm"
                    className={!scrolled ? "bg-white text-primary-800 hover:bg-white/90" : ""}
                  >
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            {user && (
              <div className="relative mr-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={scrolled ? "ghost" : "outline"} 
                      size="icon" 
                      className={cn(
                        "relative",
                        !scrolled ? "text-white border-white/40 hover:bg-white/10" : ""
                      )}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotifications.length > 0 && (
                        <Badge className="absolute top-0 right-0 h-2 w-2 p-0 bg-red-500 rounded-full" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2 font-medium">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                            <NotificationItem notification={notification} />
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">Aucune notification</div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant={scrolled ? "ghost" : "outline"} 
                  size="icon"
                  className={cn(
                    !scrolled ? "text-white border-white/40 hover:bg-white/10" : ""
                  )}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl font-bold text-primary-600">
                    TechFormPro
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-4">
                  {user && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                          <span className="text-sm font-medium">
                            {user.displayName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{user.displayName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-primary-500 mt-1 capitalize">Role: {user.role}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {filteredLinks.map((link) => (
                      <Link 
                        key={link.path} 
                        href={link.path}
                      >
                        <SheetClose asChild>
                          <Button
                            variant={location === link.path ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start text-base",
                              location === link.path
                                ? "bg-primary-100 text-primary-800 hover:bg-primary-200" 
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {link.icon}
                            {link.label}
                          </Button>
                        </SheetClose>
                      </Link>
                    ))}
                  </div>
                  
                  {user && (
                    <div className="mt-8">
                      <OnboardingTrigger variant="card" />
                    </div>
                  )}
                </div>
                
                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? "Déconnexion en cours..." : "Déconnexion"}
                    </Button>
                  ) : (
                    <div className="space-y-2 w-full">
                      <Link href="/auth" className="w-full">
                        <SheetClose asChild>
                          <Button className="w-full" variant="outline">
                            Se connecter
                          </Button>
                        </SheetClose>
                      </Link>
                      <Link href="/auth" className="w-full">
                        <SheetClose asChild>
                          <Button className="w-full">
                            S'inscrire
                          </Button>
                        </SheetClose>
                      </Link>
                    </div>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
