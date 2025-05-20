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
      
      {/* USP Section */}
      <USPSection />
      
      {/* Popular Courses Section - NEW */}
      <PopularCoursesSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Recent Courses Section - NEW */}
      <RecentCoursesSection />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Top Selling Courses Section - NEW */}
      <TopSellingCoursesSection />
      
      {/* Subscription Plans Section */}
      <SubscriptionPlansSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CtaSection />
      
      {/* Partners Section */}
      <PartnersSection />
    </div>
  );
}