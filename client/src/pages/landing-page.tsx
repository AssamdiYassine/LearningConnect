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
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Séparateur décoratif */}
      <div className="py-8 bg-gradient-to-r from-indigo-50 to-blue-50"></div>
      
      {/* Popular Courses Section */}
      <PopularCoursesSection />

      {/* Recent Courses Section */}
      <RecentCoursesSection />

      {/* Séparateur décoratif */}
      <div className="py-6 bg-gradient-to-r from-blue-50 to-indigo-50"></div>

      {/* Top Selling Courses Section */}
      <div className="mt-4">
        <TopSellingCoursesSection />
      </div>
      
      {/* Séparateur décoratif */}
      <div className="py-8 bg-gradient-to-r from-indigo-50 to-blue-50"></div>
      
      {/* USP Section avec espacement */}
      <div className="mt-8">
        <USPSection />
      </div>
      
      {/* Séparateur décoratif */}
      <div className="py-6"></div>
      
      {/* How It Works Section avec espacement */}
      <div className="mt-4">
        <HowItWorksSection />
      </div>
      
      {/* Séparateur décoratif */}
      <div className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
      
      {/* Categories Section avec espacement */}
      <div className="mt-4">
        <CategoriesSection />
      </div>
      
      {/* Séparateur décoratif */}
      <div className="py-6"></div>
      
      {/* Subscription Plans Section avec espacement */}
      <div className="mt-4">
        <SubscriptionPlansSection />
      </div>
      
      {/* Séparateur décoratif */}
      <div className="py-8 bg-gradient-to-r from-indigo-50 to-blue-50"></div>
      
      {/* Testimonials Section avec espacement */}
      <div className="mt-4">
        <TestimonialsSection />
      </div>
      
      {/* Séparateur décoratif */}
      <div className="py-6"></div>
      
      {/* CTA Section avec espacement */}
      <div className="mt-4">
        <CtaSection />
      </div>
      
      {/* Séparateur décoratif */}
      <div className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
      
      {/* Partners Section avec espacement */}
      <div className="mt-4">
        <PartnersSection />
      </div>
    </div>
  );
}