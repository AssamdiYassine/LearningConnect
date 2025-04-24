import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Filter,
  LayoutGrid,
  Loader2,
  LucideIcon,
  Search,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CourseWithDetails, Category } from '@shared/schema';

interface CoursesStepProps {
  onNext: () => void;
}

const CourseCard = ({ course }: { course: CourseWithDetails }) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge className="mb-2">{course.level}</Badge>
          <Badge variant="outline">{course.duration} hours</Badge>
        </div>
        <CardTitle className="text-lg font-medium line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <User className="h-4 w-4" />
          <span>{course.trainer.displayName}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{course.category.name}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Button variant="secondary" className="w-full" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
};

const CoursesStep = ({ onNext }: CoursesStepProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  
  const { data: courses = [], isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ['/api/courses/details'],
  });
  
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const filteredCourses = courses.filter(course => {
    const matchesCategory = categoryFilter === 'all' || course.categoryId.toString() === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    return matchesCategory && matchesLevel;
  });

  const isLoading = isCoursesLoading || isCategoriesLoading;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Explore Our Courses
          </CardTitle>
          <CardDescription>
            Find the perfect course for your training needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 pb-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search courses..." 
                className="pl-8" 
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or check back later for new courses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.slice(0, 4).map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
};

export default CoursesStep;