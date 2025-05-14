import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onSuccess?: () => void;
  placeholder?: string;
  compact?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  onSuccess,
  placeholder = 'Partagez votre avis...',
  compact = false
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string; parentId?: number }) => {
      if (!commentData.content.trim()) {
        throw new Error('Le commentaire ne peut pas être vide');
      }

      const response = await apiRequest(
        'POST',
        `/api/blog/posts/${postId}/comments`,
        commentData
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout du commentaire');
      }

      return await response.json();
    },
    onSuccess: () => {
      setContent('');
      setError(null);
      // Invalider la requête des commentaires pour recharger les données
      queryClient.invalidateQueries({ queryKey: [`/api/blog/posts/${postId}/comments`] });
      toast({
        title: parentId ? 'Réponse ajoutée' : 'Commentaire ajouté',
        description: parentId 
          ? 'Votre réponse a été publiée avec succès.' 
          : 'Votre commentaire a été publié avec succès.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Veuillez entrer un commentaire');
      return;
    }
    
    addCommentMutation.mutate({
      content,
      ...(parentId && { parentId }),
    });
  };

  if (!user) {
    return null;
  }

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit} className={`${compact ? 'mt-2' : 'mt-6'}`}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-3">
        {!compact && (
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(user.displayName || user.username)}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={`resize-none mb-2 ${compact ? 'min-h-[60px]' : 'min-h-[100px]'}`}
            disabled={addCommentMutation.isPending}
          />
          <div className={`flex ${compact ? 'justify-end' : 'justify-between'}`}>
            {!compact && (
              <div className="text-sm text-muted-foreground">
                Commentaire en tant que <span className="font-medium">{user.displayName || user.username}</span>
              </div>
            )}
            <Button 
              type="submit" 
              disabled={addCommentMutation.isPending || !content.trim()}
              size={compact ? "sm" : "default"}
            >
              {addCommentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {parentId ? 'Répondre' : 'Commenter'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;