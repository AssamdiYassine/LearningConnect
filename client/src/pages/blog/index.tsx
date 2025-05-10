import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPostWithDetails } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Calendar, Clock, Eye, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTitle } from "@/hooks/use-title";

const BlogPage = () => {
  useTitle("Blog - Necform");
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/blog/categories"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<BlogPostWithDetails[]>({
    queryKey: ["/api/blog/posts"],
  });

  // Filter posts based on search query and category
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = searchQuery 
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = categoryFilter 
      ? post.category.id.toString() === categoryFilter
      : true;
    
    return matchesSearch && matchesCategory;
  });

  const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
          Blog Necform
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez nos derniers articles, tutoriels et actualités sur les technologies informatiques et la formation professionnelle.
        </p>
      </div>

      {/* Filters and search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des articles..."
            className="w-full pr-10"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>
        
        <div className="w-full md:w-64">
          <Select
            value={categoryFilter || ""}
            onValueChange={(value) => setCategoryFilter(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {user?.role === "admin" && (
          <Button onClick={() => setLocation("/blog/admin")}>
            Gérer le blog
          </Button>
        )}
      </div>

      {postsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="overflow-hidden h-[440px]">
              <div className="h-44 bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredPosts && filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <a className="block h-full">
                <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                  {post.featuredImage && (
                    <div className="h-44 overflow-hidden">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <Badge className="w-fit mb-2">{post.category.name}</Badge>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <User size={14} />
                      <span>{post.author.displayName}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {format(new Date(post.createdAt), "dd MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{readingTime(post.content)} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{post.viewCount}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Aucun article trouvé</h3>
          <p className="text-muted-foreground">
            Aucun article ne correspond à votre recherche. Essayez de modifier vos filtres.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;