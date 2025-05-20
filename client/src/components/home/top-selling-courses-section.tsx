import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";

// Vérifiez si ce chemin d'importation est correct
import CourseCard from "@/components/course-card";

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
  salesCount: number;
};

export default function TopSellingCoursesSection() {
  const [_, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { data: topSellingCourses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses/top-selling'],
    queryFn: async () => {
      try {
        // Pour le moment, comme l'API n'existe peut-être pas, nous utilisons top-rated comme fallback
        const response = await fetch('/api/courses/top-selling');
        if (!response.ok) {
          const fallbackResponse = await fetch('/api/courses');
          if (!fallbackResponse.ok) {
            return [];
          }
          // Simuler les cours les plus vendus en triant par note
          const courses = await fallbackResponse.json();
          return courses.sort((a: Course, b: Course) => b.enrollmentCount - a.enrollmentCount).slice(0, 8);
        }
        return response.json();
      } catch (error) {
        console.error("Erreur lors de la récupération des cours les plus vendus:", error);
        return [];
      }
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
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-900">Formations les plus demandées</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollLeft} 
              className="rounded-full"
              disabled={scrollPosition <= 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollRight} 
              className="rounded-full" 
              disabled={containerRef.current ? scrollPosition >= containerRef.current.scrollWidth - containerRef.current.clientWidth : false}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              variant="link"
              onClick={() => setLocation("/catalog?sort=popular")}
              className="text-primary-600 hover:text-primary-700"
            >
              Voir tout
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar"
            style={{ scrollBehavior: "smooth" }}
          >
            {topSellingCourses.length > 0 ? (
              topSellingCourses.map((course) => (
                <div key={course.id} className="flex-none w-64 md:w-72">
                  <CourseCard
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