import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationBell } from "@/components/notification-bell";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  Bell, 
  CreditCard, 
  FileText, 
  CheckSquare, 
  Tag, 
  Search, 
  LogOut, 
  ChevronRight, 
  ChevronLeft, 
  Home,
  LineChart, 
  Key, 
  Mail,
  Layers,
  LayoutDashboard,
  ListFilter,
  Building2,
  GraduationCap,
  Briefcase,
  Bookmark
} from "lucide-react";

// Format date in French
const formatDateInFrench = () => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  const dateString = new Date().toLocaleDateString('fr-FR', options);
  return dateString.charAt(0).toUpperCase() + dateString.slice(1);
};

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  path: string;
  isActive?: boolean;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: () => void;
}

// Composant pour chaque élément de la barre latérale
const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  text, 
  path, 
  isActive = false,
  badge,
  badgeVariant = "default",
  onClick
}) => {
  // Utilisez directement le Link de wouter sans balise <a> imbriquée
  return (
    <Link 
      href={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      <span className="flex-grow">{text}</span>
      {badge && (
        <Badge variant={badgeVariant} className="ml-auto">
          {badge}
        </Badge>
      )}
    </Link>
  );
};

// Composant pour les titres de section dans la barre latérale
const SidebarSection: React.FC<{title: string}> = ({ title }) => {
  return (
    <div className="px-3 py-2">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );
};

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { unreadCount } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Formatage du nom d'affichage
  const displayName = user?.displayName || user?.username || "";
  const initials = displayName
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 flex flex-col transition-all duration-300 bg-white border-r shadow-sm ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header avec logo */}
        <div className="flex items-center h-16 px-4 py-4 border-b">
          {!collapsed && (
            <div className="flex-grow">
              <div className="font-bold text-lg bg-gradient-to-r from-[#1D2B6C] to-[#7A6CFF] bg-clip-text text-transparent">
                Necform Admin
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        {/* Informations utilisateur */}
        <div className={`px-4 py-4 flex items-center gap-3 border-b ${collapsed ? "justify-center" : ""}`}>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-grow">
              <div className="font-medium truncate">{displayName}</div>
              <Badge variant="outline" className="mt-1 text-xs bg-primary/10 text-primary">
                Administrateur
              </Badge>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex-grow overflow-y-auto p-2">
          {!collapsed && (
            <div className="mb-4">
              <div className="relative">
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9"
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          {/* Menu de navigation */}
          <nav className="space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard size={18} />} 
              text="Tableau de bord" 
              path="/admin" 
              isActive={location === "/admin"}
            />

            <SidebarSection title="Gestion" />
            <SidebarItem 
              icon={<Users size={18} />} 
              text="Utilisateurs" 
              path="/admin/users" 
              isActive={location === "/admin/users"}
            />
            <SidebarItem 
              icon={<BookOpen size={18} />} 
              text="Formations" 
              path="/admin/courses" 
              isActive={location === "/admin/courses"}
            />
            <SidebarItem 
              icon={<Calendar size={18} />} 
              text="Sessions" 
              path="/admin/sessions" 
              isActive={location === "/admin/sessions"}
            />
            <SidebarItem 
              icon={<Tag size={18} />} 
              text="Catégories" 
              path="/admin/categories" 
              isActive={location === "/admin/categories"}
              badge={3}
              badgeVariant="secondary"
            />
            
            <SidebarSection title="Gestion des Entreprises" />
            <SidebarItem 
              icon={<Building2 size={18} />} 
              text="Entreprises" 
              path="/admin/enterprises" 
              isActive={location === "/admin/enterprises"}
            />
            <SidebarItem 
              icon={<Briefcase size={18} />} 
              text="Formations Entreprises" 
              path="/admin/enterprise-courses" 
              isActive={location === "/admin/enterprise-courses"}
            />
            <SidebarItem 
              icon={<GraduationCap size={18} />} 
              text="Employés" 
              path="/admin/enterprise-employees" 
              isActive={location === "/admin/enterprise-employees"}
              badge={5}
              badgeVariant="outline"
            />
            
            <SidebarSection title="Contenu" />
            <SidebarItem 
              icon={<FileText size={18} />} 
              text="Blog" 
              path="/admin/blogs" 
              isActive={location === "/admin/blogs"}
            />
            <SidebarItem 
              icon={<ListFilter size={18} />} 
              text="Catégories Blog" 
              path="/blog/admin/categories" 
              isActive={location === "/blog/admin/categories"}
            />
            <SidebarItem 
              icon={<CheckSquare size={18} />} 
              text="Approbations" 
              path="/admin/approvals" 
              isActive={location === "/admin/approvals"}
              badge={4}
              badgeVariant="destructive"
            />
            
            <SidebarSection title="Paiements" />
            <SidebarItem 
              icon={<CreditCard size={18} />} 
              text="Abonnements" 
              path="/admin/subscriptions" 
              isActive={location === "/admin/subscriptions"}
            />
            <SidebarItem 
              icon={<BarChart3 size={18} />} 
              text="Revenus" 
              path="/admin/revenue" 
              isActive={location === "/admin/revenue"}
            />
            <SidebarItem 
              icon={<LineChart size={18} />} 
              text="Analytiques" 
              path="/admin/analytics" 
              isActive={location === "/admin/analytics"}
            />
            
            <SidebarSection title="Entreprises" />
            <SidebarItem 
              icon={<Building2 size={18} />} 
              text="Gestion des Entreprises" 
              path="/admin/enterprises" 
              isActive={location === "/admin/enterprises"}
            />
            <SidebarItem 
              icon={<Bookmark size={18} />} 
              text="Formations assignées" 
              path="/admin/enterprise-courses" 
              isActive={location === "/admin/enterprise-courses"}
            />
            <SidebarItem 
              icon={<Users size={18} />} 
              text="Employés" 
              path="/admin/enterprise-employees" 
              isActive={location === "/admin/enterprise-employees"}
            />
            
            <SidebarSection title="Système" />
            <SidebarItem 
              icon={<Bell size={18} />} 
              text="Notifications" 
              path="/admin/notifications" 
              isActive={location === "/admin/notifications"}
              badge={unreadCount || 0}
              badgeVariant={unreadCount ? "destructive" : "outline"}
            />
            <SidebarItem 
              icon={<Key size={18} />} 
              text="API & Intégrations" 
              path="/admin/api-settings" 
              isActive={location === "/admin/api-settings"}
            />
            <SidebarItem 
              icon={<Settings size={18} />} 
              text="Paramètres" 
              path="/admin/settings" 
              isActive={location === "/admin/settings"}
            />
          </nav>
        </div>
        
        {/* Footer avec bouton de déconnexion */}
        <div className="p-4 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`w-full flex items-center justify-${collapsed ? "center" : "start"} gap-2 text-red-500 hover:text-red-600 hover:bg-red-50`}
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  {!collapsed && <span>Déconnexion</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>Déconnexion</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      
      {/* Contenu principal */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Layers size={20} />
            </Button>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-gray-800">
                Tableau de bord administrateur
              </h1>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {formatDateInFrench()}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <Home size={18} />
              </Link>
            </Button>
            <NotificationBell />
          </div>
        </header>
        
        {/* Contenu de la page */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardLayout;