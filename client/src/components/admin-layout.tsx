import React from "react";
import Navbar from "./navbar";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarDays, 
  Settings,
  BarChart2,
  FileCheck, 
  DollarSign
} from "lucide-react";

type AdminLayoutProps = {
  children: React.ReactNode;
};

// Liste des liens de navigation admin
const adminNavLinks = [
  { href: "/admin-dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/courses", label: "Formations", icon: BookOpen },
  { href: "/admin/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/admin/pending-courses", label: "Demandes en attente", icon: FileCheck },
  { href: "/admin/analytics", label: "Statistiques", icon: BarChart2 },
  { href: "/admin/revenue", label: "Revenus", icon: DollarSign },
  { href: "/admin/settings", label: "Configuration", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  
  // Vérifier si nous sommes sur une page d'administration
  const isAdminPage = location.startsWith("/admin");

  if (!isAdminPage) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC] dark:bg-[#161b2d]">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar de navigation admin */}
        <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary dark:text-white">Administration</h2>
          </div>
          <nav className="flex-1 px-4 pb-6 space-y-1">
            {adminNavLinks.map((link) => {
              const isActive = location === link.href; 
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white dark:bg-primary/80" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="container p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}