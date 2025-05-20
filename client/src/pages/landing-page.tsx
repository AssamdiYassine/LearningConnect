import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

// Import home components
import HeroSection from "@/components/home/hero-section";
import USPSection from "@/components/home/usp-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import CategoriesSection from "@/components/home/categories-section";
import SubscriptionPlansSection from "@/components/home/subscription-plans-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CtaSection from "@/components/home/cta-section";
import PartnersSection from "@/components/home/partners-section";
import PopularCoursesSection from "@/components/home/popular-courses-section";
import RecentCoursesSection from "@/components/home/recent-courses-section";
import TopSellingCoursesSection from "@/components/home/top-selling-courses-section";

export default function LandingPage() {
  const { user } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Hero Section */}
      <div className="w-full">
        <HeroSection />
      </div>
      
      {/* Sections avec transitions fluides sans marges blanches */}
      <div className="w-full">
        <PopularCoursesSection />
      </div>

      <div className="w-full">
        <RecentCoursesSection />
      </div>

      <div className="w-full">
        <TopSellingCoursesSection />
      </div>
      
      {/* Séparateur léger */}
      <div className="py-2 bg-gradient-to-r from-indigo-50 to-blue-50"></div>
      
      <div className="w-full">
        <USPSection />
      </div>
      
      <div className="w-full">
        <HowItWorksSection />
      </div>
      
      {/* Séparateur léger */}
      <div className="py-2 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
      
      <div className="w-full">
        <CategoriesSection />
      </div>
      
      <div className="w-full">
        <SubscriptionPlansSection />
      </div>
      
      {/* Séparateur léger */}
      <div className="py-2 bg-gradient-to-r from-indigo-50 to-blue-50"></div>
      
      <div className="w-full">
        <TestimonialsSection />
      </div>
      
      <div className="w-full">
        <CtaSection />
      </div>
      
      {/* Séparateur léger */}
      <div className="py-2 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
      
      <div className="w-full">
        <PartnersSection />
      </div>
    </div>
  );
}