import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

// Import home components
import HeroSection from "@/components/home/hero-section";
import USPSection from "@/components/home/usp-section";
import CategoriesSection from "@/components/home/categories-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CtaSection from "@/components/home/cta-section";
import PartnersSection from "@/components/home/partners-section";

export default function LandingPage() {
  const { user } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* USP Section */}
      <USPSection />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CtaSection />
      
      {/* Partners Section */}
      <PartnersSection />
    </div>
  );
}