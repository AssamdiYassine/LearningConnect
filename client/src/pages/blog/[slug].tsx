import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Eye,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BlogPostWithDetails, BlogCommentWithUser } from '@shared/schema';
import { formatDate } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import CommentForm from '@/components/blog/comment-form';
import CommentItem from '@/components/blog/comment-item';

// Un simple parser Markdown pour le rendu du contenu
const MarkdownRenderer = ({ content }: { content: string }) => {
  const renderMarkdown = (md: string) => {
    // Convertir les # Titres
    let html = md.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold my-6">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold my-5">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold my-4">$1</h3>');
    
    // Convertir les paragraphes (lignes vides)
    html = html.replace(/\n\n([^#\n][^\n]+)/g, '\n\n<p class="my-4">$1</p>');
    
    // Convertir les listes
    html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>');
    html = html.replace(/(<li[^>]*>.*<\/li>\n)+/g, '<ul class="my-4">$&</ul>');
    
    // Convertir le texte en gras
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convertir le texte en italique
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convertir les liens
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
    
    return html;
  };

  return (
    <div 
      className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

// Nous utilisons maintenant le CommentItem importé depuis le dossier components/blog

// Composant principal de la page d'article
const BlogPostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Récupérer l'article de blog avec le slug
  const { data: post, isLoading, error } = useQuery<BlogPostWithDetails>({
    queryKey: [`/api/blog/posts/slug/${slug}`],
    retry: false,
  });

  // Récupérer les commentaires de cet article
  const { data: comments, isLoading: commentsLoading } = useQuery<BlogCommentWithUser[]>({
    queryKey: [`/api/blog/posts/${post?.id}/comments`],
    enabled: !!post?.id,
    retry: false,
  });

  // Incrémenter le compteur de vues
  useEffect(() => {
    if (post?.id) {
      apiRequest('POST', `/api/blog/posts/${post.id}/view`)
        .catch(err => console.error("Erreur lors de l'enregistrement de la vue:", err));
    }
  }, [post?.id]);

  // Formater la date en français
  const formatReadingTime = (minutes: number | null | undefined) => {
    if (!minutes) return '5 min de lecture';
    return `${minutes} min de lecture`;
  };

  if (isLoading) {
    return (
      <div className="container-narrow py-12 md:py-16">
        <div>
          <Skeleton className="h-8 w-1/4 mb-6" />
          <Skeleton className="h-20 w-full mb-8" />
          <div className="flex justify-between mb-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/3" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-narrow py-12 md:py-16">
        <div>
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Impossible de charger l'article. Il est possible qu'il ait été supprimé ou que le lien soit incorrect.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button asChild>
              <Link href="/blog">Retour au blog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow py-12 md:py-16">
      <div>
        {/* Bouton de retour */}
        <Button 
          variant="ghost" 
          size="sm"
          className="mb-4"
          asChild
        >
          <Link href="/blog" className="flex items-center">
            <ChevronLeft className="mr-1 h-4 w-4" /> Retour au blog
          </Link>
        </Button>

        {/* En-tête de l'article */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {post.category.name}
            </Badge>
            <span className="text-sm text-muted-foreground">·</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{formatDate(new Date(post.publishedAt || post.createdAt))}</span>
            </div>
            <span className="text-sm text-muted-foreground">·</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{formatReadingTime(post.readTime)}</span>
            </div>
            <span className="text-sm text-muted-foreground">·</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="h-3.5 w-3.5 mr-1" />
              <span>{(post.viewCount || 0) + 1} vues</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            {post.title}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-4">
            {post.excerpt}
          </p>

          {/* Auteur */}
          <div className="flex items-center mt-6">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback>{post.author.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.author.displayName}</div>
              <div className="text-sm text-muted-foreground">Auteur</div>
            </div>
          </div>
        </div>

        {/* Image principale si disponible */}
        {post.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="font-normal">
                <Tag className="h-3 w-3 mr-1" /> {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Contenu de l'article */}
        <div className="mb-10">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Partage et interactions */}
        <Card className="mb-10">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {post.commentCount || 0} commentaire{(post.commentCount || 0) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Partager cet article :</span>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section des commentaires */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Commentaires</h2>
          
          {commentsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !comments || comments.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Aucun commentaire pour le moment. Soyez le premier à partager votre avis !
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments
                .filter(comment => !comment.parentId) // Filtrer les commentaires de premier niveau
                .map(comment => (
                  <CommentItem key={comment.id} comment={comment} postId={post.id} />
                ))}
            </div>
          )}
          
          {/* Ajouter un commentaire */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Laisser un commentaire</h3>
            
            {/* Utiliser le hook useAuth pour vérifier si l'utilisateur est connecté */}
            {(() => {
              const { user } = useAuth();
              
              if (!user) {
                return (
                  <>
                    <p className="text-muted-foreground mb-4">
                      Connectez-vous pour laisser un commentaire.
                    </p>
                    <Button asChild>
                      <Link href="/auth">Se connecter</Link>
                    </Button>
                  </>
                );
              }
              
              return <CommentForm postId={post.id} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;