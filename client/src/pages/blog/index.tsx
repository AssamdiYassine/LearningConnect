import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Tag, 
  Calendar, 
  Clock, 
  Eye,
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogPostWithDetails } from '@shared/schema';
import { formatDate } from '@/lib/utils';

const BlogIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Récupérer les articles de blog
  const { data: blogPosts, isLoading, error } = useQuery<BlogPostWithDetails[]>({
    queryKey: ['/api/blog-posts'],
    retry: false,
  });

  // Récupérer les catégories uniques à partir des articles
  const { data: categories } = useQuery({
    queryKey: ['/api/blog-categories'],
    retry: false,
  });

  // Filtrer les articles en fonction des critères
  const filteredPosts = blogPosts
    ? blogPosts
      .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(post => !selectedCategory || post.category.name === selectedCategory)
    : [];

  // Pagination
  const postsPerPage = 6;
  const totalPages = Math.ceil((filteredPosts?.length || 0) / postsPerPage);
  const paginatedPosts = filteredPosts?.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Formatage de date en français
  const formatReadingTime = (minutes: number | null | undefined) => {
    if (!minutes) return '5 min de lecture';
    return `${minutes} min de lecture`;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-primary">Blog NecForm</h1>
      <div className="text-center mb-8">
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez nos derniers articles sur les technologies de l'informatique, le développement web et les meilleures pratiques du secteur IT.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un article..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Button>
          {categories?.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader className="pb-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-24 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-lg text-red-500">Une erreur est survenue lors du chargement des articles.</p>
          <p className="text-sm text-muted-foreground">Veuillez réessayer ultérieurement.</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg">Aucun article trouvé.</p>
          <p className="text-sm text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {paginatedPosts.map(post => (
              <Card key={post.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {post.category.name}
                    </Badge>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>{post.viewCount || 0}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags && post.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="font-normal">
                        <Tag className="h-3 w-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-0">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {post.publishedAt
                        ? formatDate(new Date(post.publishedAt))
                        : 'Non publié'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{formatReadingTime(post.readTime)}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
  
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "font-bold" : ""}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
      
      <Separator className="my-10" />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Vous souhaitez contribuer au blog ?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Partagez votre expertise et vos connaissances avec la communauté NecForm.
          Contactez-nous pour proposer un sujet d'article.
        </p>
        <Button asChild>
          <Link href="/contact">Nous contacter</Link>
        </Button>
      </div>
    </div>
  );
};

export default BlogIndex;