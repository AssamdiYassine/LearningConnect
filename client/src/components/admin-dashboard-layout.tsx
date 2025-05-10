import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  FileCheck,
  Settings,
  DollarSign,
  Bell,
  Package,
  FileText,
  Home,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Grid3X3,
  Layers,
  Tag,
  MessageSquare,
  Mail,
  BarChart,
  ArrowUpDown,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NotificationBell from "@/components/notification-bell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    {
      group: "Général",
      items: [
        {
          name: "Tableau de bord",
          path: "/admin/dashboard-new",
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          name: "Analytics",
          path: "/admin/analytics",
          icon: <PieChart className="h-5 w-5" />,
        },
      ],
    },
    {
      group: "Gestion",
      items: [
        {
          name: "Utilisateurs",
          path: "/admin/users",
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: "Cours",
          path: "/admin/courses",
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          name: "Sessions",
          path: "/admin/sessions",
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          name: "Catégories",
          path: "/admin/categories",
          icon: <Tag className="h-5 w-5" />,
        },
      ],
    },
    {
      group: "Modération",
      items: [
        {
          name: "Approbations",
          path: "/admin/pending-courses",
          icon: <FileCheck className="h-5 w-5" />,
        },
        {
          name: "Commentaires",
          path: "/admin/comments",
          icon: <MessageSquare className="h-5 w-5" />,
        },
      ],
    },
    {
      group: "Finances",
      items: [
        {
          name: "Revenus",
          path: "/admin/revenue",
          icon: <DollarSign className="h-5 w-5" />,
        },
        {
          name: "Abonnements",
          path: "/admin/subscriptions",
          icon: <Package className="h-5 w-5" />,
        },
        {
          name: "Paiements",
          path: "/admin/payments",
          icon: <ArrowUpDown className="h-5 w-5" />,
        },
      ],
    },
    {
      group: "Contenu",
      items: [
        {
          name: "Blog",
          path: "/blog/admin",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: "Notifications",
          path: "/admin/notifications",
          icon: <Bell className="h-5 w-5" />,
        },
        {
          name: "E-mails",
          path: "/admin/emails",
          icon: <Mail className="h-5 w-5" />,
        },
      ],
    },
    {
      group: "Système",
      items: [
        {
          name: "Paramètres",
          path: "/admin/settings",
          icon: <Settings className="h-5 w-5" />,
        },
        {
          name: "Site public",
          path: "/",
          icon: <Home className="h-5 w-5" />,
        },
      ],
    },
  ];

  if (!user || user.role !== "admin") {
    return <div>Accès non autorisé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-3 font-bold text-lg text-primary dark:text-white">
            Console d'Administration
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 w-4/5 h-full animate-in slide-in-from-left">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="text-2xl font-bold text-[#5F8BFF] dark:text-white">
                Nec<span className="text-[#7A6CFF]">form</span>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-6">
                <Avatar>
                  <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user.displayName || user.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="space-y-8 pr-4">
                  {navItems.map((group) => (
                    <div key={group.group}>
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-3">
                        {group.group}
                      </h3>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <Button
                            key={item.path}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-base font-normal",
                              location === item.path
                                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white font-medium"
                                : "text-gray-700 dark:text-gray-300"
                            )}
                            onClick={() => {
                              window.location.href = item.path;
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {item.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="pt-4 border-t mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className={cn(
            "fixed left-0 top-0 bottom-0 z-10 hidden md:flex flex-col border-r shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 transition-all ease-in-out duration-300",
            isCollapsed ? "w-[80px]" : "w-[280px]"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div
              className={cn(
                "flex items-center h-16 px-4 border-b shrink-0",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              {!isCollapsed && (
                <Link href="/admin/dashboard">
                  <div className="text-2xl font-bold cursor-pointer text-[#5F8BFF] dark:text-white">
                    Nec<span className="text-[#7A6CFF]">form</span>
                  </div>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <ChevronLeft
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isCollapsed && "rotate-180"
                  )}
                />
              </Button>
            </div>

            {/* User info */}
            {!isCollapsed && (
              <div className="flex items-center gap-3 px-4 py-4 border-b">
                <Avatar>
                  <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <div className="font-medium truncate">{user.displayName || user.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            )}

            {/* Nav items */}
            <ScrollArea className="flex-1">
              <div className={cn("py-2", isCollapsed ? "px-1.5" : "px-3")}>
                {navItems.map((group) => (
                  <div key={group.group} className="mb-6">
                    {!isCollapsed && (
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold ml-3 mb-1">
                        {group.group}
                      </h3>
                    )}
                    <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
                      {group.items.map((item) => (
                        <TooltipProvider key={item.path} delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start",
                                  location === item.path
                                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white font-medium"
                                    : "text-gray-700 dark:text-gray-300",
                                  isCollapsed
                                    ? "h-10 w-10 p-0 flex justify-center"
                                    : "px-3 py-2"
                                )}
                                onClick={() => {
                                  window.location.href = item.path;
                                }}
                              >
                                <span
                                  className={cn(
                                    isCollapsed ? "mr-0" : "mr-3"
                                  )}
                                >
                                  {item.icon}
                                </span>
                                {!isCollapsed && item.name}
                              </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right">
                                {item.name}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Sidebar footer */}
            <div
              className={cn(
                "border-t p-3 flex shrink-0",
                isCollapsed ? "justify-center" : "justify-between items-center"
              )}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(isCollapsed ? "mr-0" : "mr-2")}
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                      {theme === "dark" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {theme === "dark" ? "Mode clair" : "Mode sombre"}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {!isCollapsed && <NotificationBell />}

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      Se déconnecter
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            isCollapsed ? "md:ml-[80px]" : "md:ml-[280px]"
          )}
        >
          <div className="container-wide py-8 px-4 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}