import { useQuery } from "@tanstack/react-query";
import SimpleCourseCard from "@/components/simple-course-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";

type PopularCourse = {
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
};

export default function PopularCoursesSection() {
  const [_, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { data: popularCourses = [], isLoading } = useQuery<PopularCourse[]>({
    queryKey: ['/api/courses/popular'],
    queryFn: async () => {
      const response = await fetch('/api/courses/popular');
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
    <section className="py-12 bg-gradient-to-r from-slate-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1D2B6C] to-[#7A6CFF] inline-block text-transparent bg-clip-text">
              🔥 Formations les plus populaires
            </h2>
            <p className="text-gray-600 mt-2">Découvrez les formations préférées par nos apprenants</p>
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
              onClick={() => setLocation("/catalog")}
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
            {popularCourses.length > 0 ? (
              popularCourses.map((course) => (
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
                    isNew={false}
                    isFree={course.price === 0}
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Aucune formation populaire disponible pour le moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}