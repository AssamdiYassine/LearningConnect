import React from "react";
import Navbar from "./navbar";
import { useLocation } from "wouter";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  
  // Vérifier si nous sommes sur une page d'administration
  const isAdminPage = location.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      {/* Pas de footer pour les pages admin comme demandé */}
    </div>
  );
}