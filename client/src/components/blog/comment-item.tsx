import React, { useState } from 'react';
import { BlogCommentWithUser } from '@shared/schema';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { MessageSquare, CornerDownRight, Shield, CheckCircle } from 'lucide-react';
import CommentForm from './comment-form';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface CommentItemProps {
  comment: BlogCommentWithUser;
  postId: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useAuth();
  
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const toggleReplyForm = () => {
    setShowReplyForm(prev => !prev);
  };

  // Détecter si le commentaire est d'un administrateur
  const isAdminComment = comment.user?.role === 'admin';
  
  // Vérifier si le commentaire est en attente d'approbation
  const isPendingApproval = comment.isApproved === false;

  return (
    <div className={cn(
      "mb-6 pl-4 border-l-2", 
      isAdminComment ? "border-primary" : "border-muted",
      isPendingApproval && "opacity-70"
    )}>
      <div className="flex items-start gap-3">
        <Avatar className={cn("h-8 w-8", isAdminComment && "border-2 border-primary")}>
          <AvatarFallback>{getInitials(comment.user?.displayName || comment.user?.username)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">
                {comment.user?.displayName || comment.user?.username}
                {isAdminComment && (
                  <Badge variant="default" className="ml-2 text-[10px] py-0">
                    <Shield className="h-3 w-3 mr-1" /> Admin
                  </Badge>
                )}
              </h4>
              {isPendingApproval && user?.role === 'admin' && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">
                  En attente d'approbation
                </Badge>
              )}
              {comment.isApproved && (
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(new Date(comment.createdAt))}
            </span>
          </div>
          
          <div className="prose prose-sm max-w-none break-words">
            <p className="text-sm">{comment.content}</p>
          </div>
          
          {/* Bouton de réponse si l'utilisateur est connecté */}
          {user && (
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs flex items-center text-muted-foreground hover:text-foreground"
                onClick={toggleReplyForm}
              >
                {showReplyForm ? (
                  <>Annuler</>
                ) : (
                  <>
                    <CornerDownRight className="h-3 w-3 mr-1" />
                    Répondre
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Formulaire de réponse */}
          {showReplyForm && (
            <div className="mt-1 ml-6">
              <CommentForm 
                postId={postId} 
                parentId={comment.id} 
                compact={true}
                placeholder="Écrire une réponse..."
                onSuccess={() => setShowReplyForm(false)}
              />
            </div>
          )}
          
          {/* Afficher les réponses si elles existent */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} postId={postId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;