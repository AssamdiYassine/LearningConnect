import { useQuery } from "@tanstack/react-query";
import SimpleCourseCard from "@/components/simple-course-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";

type Course = {
  id: number;
  title: string;
  description: string;
  level: string;
  price: number;
  imageUrl: string;
  category: {
    name: string;
  };
  trainer: {
    displayName: string;
    avatarUrl: string;
  };
  rating: number;
  enrollmentCount: number;
  createdAt: string;
};

export default function RecentCoursesSection() {
  const [_, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { data: recentCourses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses/recent'],
    queryFn: async () => {
      const response = await fetch('/api/courses/recent');
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
  });

  const scrollLeft = () => {
    if (containerRef.current) {
      const newScrollPosition = Math.max(0, scrollPosition - 300);
      containerRef.current.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
      setScrollPosition(newScrollPosition);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const newScrollPosition = Math.min(
        containerRef.current.scrollWidth - containerRef.current.clientWidth,
        scrollPosition + 300
      );
      containerRef.current.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
      setScrollPosition(newScrollPosition);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#5F8BFF] to-[#7A6CFF] inline-block text-transparent bg-clip-text">
              ✨ Nouvelles formations
            </h2>
            <p className="text-gray-600 mt-2">Les dernières formations ajoutées sur notre plateforme</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollLeft} 
              className="rounded-full h-10 w-10 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300"
              disabled={scrollPosition <= 0}
            >
              <ChevronLeft className="h-5 w-5 text-indigo-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollRight} 
              className="rounded-full h-10 w-10 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300" 
              disabled={containerRef.current ? scrollPosition >= containerRef.current.scrollWidth - containerRef.current.clientWidth : false}
            >
              <ChevronRight className="h-5 w-5 text-indigo-600" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/catalog?sort=newest")}
              className="rounded-full bg-white px-5 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300"
            >
              Tout voir
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="flex space-x-6 overflow-x-auto pb-6 hide-scrollbar"
            style={{ scrollBehavior: "smooth" }}
          >
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <div key={course.id} className="flex-none w-64 md:w-72">
                  <SimpleCourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    level={course.level}
                    price={course.price}
                    imageUrl={course.imageUrl || "/images/course-placeholder.jpg"}
                    category={course.category?.name || "Non catégorisé"}
                    instructor={course.trainer?.displayName || "Formateur"}
                    rating={course.rating || 4.5}
                    students={course.enrollmentCount || 0}
                    isNew={true}
                    isFree={course.price === 0}
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 bg-white rounded-lg">
                <p className="text-gray-500">Aucune nouvelle formation disponible pour le moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}