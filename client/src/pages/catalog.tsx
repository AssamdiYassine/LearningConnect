import { useQuery } from "@tanstack/react-query";
import { CourseWithDetails, Category, SessionWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseCard from "@/components/course-card";
import { useEffect, useState } from "react";

export default function Catalog() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-asc");

  // Fetch courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch upcoming sessions
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
    
    return matchesSearch && matchesCategory && matchesLevel;
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Course Catalog</h1>
        <p className="mt-2 text-gray-600">
          Browse our live training courses and register for upcoming sessions
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
                disabled={isCategoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-asc">Date (Soonest First)</SelectItem>
                  <SelectItem value="date-desc">Date (Latest First)</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="level-asc">Level (Beginner First)</SelectItem>
                  <SelectItem value="level-desc">Level (Advanced First)</SelectItem>
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
                <Filter className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            </div>
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
