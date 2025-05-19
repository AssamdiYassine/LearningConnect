import { useQuery } from "@tanstack/react-query";
import { CourseWithDetails, Category, SessionWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Filter, Sparkle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import CourseCard from "@/components/course-card";
import { useEffect, useState } from "react";

export default function Catalog() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-asc");
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  // Fetch courses using the public API route
  const { data: courses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses/public"],
  });

  // Fetch categories using the public API route
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch upcoming sessions using the public API route
  const { data: sessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/upcoming"],
  });

  // Filter and sort courses
  const filteredCourses = courses?.filter(course => {
    if (!course || !course.title || !course.description || !course.category) return false;
    
    // Text search
    const matchesSearch = searchTerm.trim() === "" || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === "all" || 
      course.category.id.toString() === categoryFilter;
    
    // Level filter
    const matchesLevel = levelFilter === "all" || 
      course.level === levelFilter;
    
    // Free courses filter
    const matchesFreeFilter = !showOnlyFree || course.price === 0;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesFreeFilter;
  }) || [];

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (sortOrder) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "level-asc":
        const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return (levelOrder[a.level as keyof typeof levelOrder] || 0) - (levelOrder[b.level as keyof typeof levelOrder] || 0);
      case "level-desc":
        const levelOrderDesc = { beginner: 1, intermediate: 2, advanced: 3 };
        return (levelOrderDesc[b.level as keyof typeof levelOrderDesc] || 0) - (levelOrderDesc[a.level as keyof typeof levelOrderDesc] || 0);
      case "date-asc":
        const aSession = sessions?.find(s => s?.course?.id === a.id);
        const bSession = sessions?.find(s => s?.course?.id === b.id);
        if (!aSession && !bSession) return 0;
        if (!aSession) return 1;
        if (!bSession) return -1;
        return new Date(aSession.date).getTime() - new Date(bSession.date).getTime();
      case "date-desc":
        const aSessionDesc = sessions?.find(s => s?.course?.id === a.id);
        const bSessionDesc = sessions?.find(s => s?.course?.id === b.id);
        if (!aSessionDesc && !bSessionDesc) return 0;
        if (!aSessionDesc) return 1;
        if (!bSessionDesc) return -1;
        return new Date(bSessionDesc.date).getTime() - new Date(aSessionDesc.date).getTime();
      default:
        return 0;
    }
  });

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setSortOrder("date-asc");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || categoryFilter !== "all" || levelFilter !== "all" || sortOrder !== "date-asc";

  return (
    <div className="container-wide py-12 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">Catalogue des formations</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Parcourez nos formations en direct et inscrivez-vous aux prochaines sessions
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher des formations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
                disabled={isCategoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-asc">Date (croissant)</SelectItem>
                  <SelectItem value="date-desc">Date (décroissant)</SelectItem>
                  <SelectItem value="title-asc">Titre (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Titre (Z-A)</SelectItem>
                  <SelectItem value="level-asc">Niveau (débutant d'abord)</SelectItem>
                  <SelectItem value="level-desc">Niveau (avancé d'abord)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={!hasActiveFilters} 
                onClick={resetFilters}
              >
                <Filter className="h-4 w-4 mr-2" /> Effacer les filtres
              </Button>
            </div>
          </div>
          
          {/* Filtre cours gratuits - optimisé pour mobile */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg bg-green-50 border border-green-200">
            <Button 
              variant={showOnlyFree ? "default" : "outline"} 
              className={`flex items-center gap-2 ${showOnlyFree ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-100 text-green-700 border-green-300"} w-full sm:w-auto`}
              onClick={() => setShowOnlyFree(!showOnlyFree)}
            >
              <Sparkle className={`h-4 w-4 ${showOnlyFree ? "text-white" : "text-green-600"}`} />
              <span className={showOnlyFree ? "text-white" : "text-green-700"}>
                {showOnlyFree ? "Formations gratuites uniquement" : "Afficher les formations gratuites"}
              </span>
            </Button>
            {showOnlyFree && (
              <span className="mt-2 sm:mt-0 sm:ml-3 text-sm text-green-700">
                {filteredCourses.length} formation{filteredCourses.length > 1 ? 's' : ''} gratuite{filteredCourses.length > 1 ? 's' : ''} disponible{filteredCourses.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Courses Grid */}
      <div>
        {isCoursesLoading || isSessionsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : sortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
            {hasActiveFilters && (
              <Button className="mt-4" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
