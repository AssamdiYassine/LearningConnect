import { useQuery } from "@tanstack/react-query";
import SimpleCourseCard from "@/components/simple-course-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

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
  const [currentPage, setCurrentPage] = useState(0);

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

  // Configuration pour l'affichage des cours
  const coursesPerPage = 4;
  const totalPages = Math.ceil(recentCourses.length / coursesPerPage);
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Obtenir les cours pour la page actuelle
  const currentCourses = recentCourses.slice(
    currentPage * coursesPerPage,
    (currentPage + 1) * coursesPerPage
  );

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-blue-200/10 blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-72 h-72 rounded-full bg-indigo-200/10 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-screen-xl mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-indigo-600/10 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Nouvelles formations
                </h2>
              </div>
              <p className="text-gray-600 text-lg">Les dernières formations ajoutées sur notre plateforme</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPrevPage} 
                className="rounded-full h-10 w-10 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700"
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="text-sm font-medium text-gray-600">
                {currentPage + 1} / {Math.max(1, totalPages)}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextPage} 
                className="rounded-full h-10 w-10 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700" 
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <Button
                variant="default"
                onClick={() => setLocation("/catalog?sort=newest")}
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 ml-2"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentCourses.length > 0 ? (
                currentCourses.map((course) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="transform transition-all duration-300 hover:translate-y-[-8px]"
                  >
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
                  </motion.div>
                ))
              ) : (
                <div className="col-span-4 text-center py-10 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
                  <p className="text-gray-500">Aucune formation récente disponible pour le moment.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}