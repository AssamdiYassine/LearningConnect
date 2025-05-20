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
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Popular Courses Section */}
      <div className="mt-0">
        <PopularCoursesSection />
      </div>

      {/* Recent Courses Section */}
      <div className="mt-0">
        <RecentCoursesSection />
      </div>

      {/* Top Selling Courses Section */}
      <div className="mt-0">
        <TopSellingCoursesSection />
      </div>
      
      {/* USP Section */}
      <div className="mt-0">
        <USPSection />
      </div>
      
      {/* How It Works Section */}
      <div className="mt-0">
        <HowItWorksSection />
      </div>
      
      {/* Categories Section */}
      <div className="mt-0">
        <CategoriesSection />
      </div>
      
      {/* Subscription Plans Section */}
      <div className="mt-0">
        <SubscriptionPlansSection />
      </div>
      
      {/* Testimonials Section */}
      <div className="mt-0">
        <TestimonialsSection />
      </div>
      
      {/* CTA Section */}
      <div className="mt-0">
        <CtaSection />
      </div>
      
      {/* Partners Section */}
      <div className="mt-0">
        <PartnersSection />
      </div>
    </div>
  );
}