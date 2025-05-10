import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Eye, MessageCircle, Share2, ThumbsUp, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTitle } from "@/hooks/use-title";

const BlogPostPage = () => {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/blog/posts/slug/${slug}`],
    enabled: !!slug,
  });

  useTitle(post ? `${post.title} - Blog Necform` : "Chargement... - Blog Necform");

  const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/blog/comments", {
        content: comment,
        postId: post?.id,
        parentId: null
      });
      
      toast({
        title: "Commentaire envoyé",
        description: "Votre commentaire a été envoyé et sera visible après approbation",
      });
      
      setComment("");
      // Refresh comments
      queryClient.invalidateQueries({ queryKey: [`/api/blog/posts/${post?.id}/comments`] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du commentaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      }).catch(err => {
        console.log("Error sharing", err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien de l'article a été copié dans le presse-papier",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Article non trouvé</h2>
        <p className="mb-6">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link href="/blog">
          <Button>Retour aux articles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/">
            <a className="hover:text-primary">Accueil</a>
          </Link>
          <span>/</span>
          <Link href="/blog">
            <a className="hover:text-primary">Blog</a>
          </Link>
          <span>/</span>
          <Link href={`/blog/categorie/${post.category.slug}`}>
            <a className="hover:text-primary">{post.category.name}</a>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{post.title}</span>
        </div>

        {/* Article header */}
        <div className="mb-8">
          <Badge className="mb-4">{post.category.name}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{post.author.displayName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{format(new Date(post.createdAt), "dd MMMM yyyy", { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{readingTime(post.content)} min de lecture</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{post.viewCount} vues</span>
            </div>
          </div>

          {post.featuredImage && (
            <div className="rounded-lg overflow-hidden mb-8">
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>

        {/* Article content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Article footer */}
        <div className="flex justify-between items-center mb-12 pt-6 border-t">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={sharePost}>
              <Share2 size={16} className="mr-2" />
              Partager
            </Button>
          </div>
          
          <Link href="/blog">
            <Button variant="ghost">
              Retour aux articles
            </Button>
          </Link>
        </div>

        {/* Comments */}
        <div className="pt-8 border-t">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle size={20} />
            Commentaires ({post.commentCount})
          </h3>

          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <Textarea
                placeholder="Partagez votre avis..."
                className="mb-4 min-h-32"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                  {isSubmitting ? "Envoi en cours..." : "Publier un commentaire"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Les commentaires sont modérés et seront visibles après approbation.
              </p>
            </form>
          ) : (
            <div className="bg-muted p-4 rounded-lg mb-8 text-center">
              <p className="mb-4">Connectez-vous pour laisser un commentaire</p>
              <Link href="/auth">
                <Button>Se connecter / S'inscrire</Button>
              </Link>
            </div>
          )}

          <CommentList postId={post.id} />
        </div>
      </div>
    </div>
  );
};

const CommentList = ({ postId }: { postId: number }) => {
  const { data: comments, isLoading } = useQuery({
    queryKey: [`/api/blog/posts/${postId}/comments`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
        <p>Soyez le premier à commenter cet article</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

const Comment = ({ comment }: { comment: any }) => {
  return (
    <div className="group">
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback>{comment.user.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{comment.user.displayName}</h4>
              <p className="text-xs text-muted-foreground">
                {format(new Date(comment.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <p>{comment.content}</p>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-4 space-y-4 border-l-2 pl-4">
          {comment.replies.map((reply: any) => (
            <div key={reply.id} className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{reply.user.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{reply.user.displayName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reply.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p>{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPostPage;