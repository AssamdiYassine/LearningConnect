import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X, Trash2, Filter, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';

interface BlogComment {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  content: string;
  isApproved: boolean | null;
  createdAt: string;
  updatedAt: string;
  username: string;
  displayName: string;
  role: string;
  postTitle: string;
  postSlug: string;
  replyCount: number;
}

const AdminBlogCommentsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<BlogComment | null>(null);

  // Requête pour récupérer tous les commentaires
  const { data: comments, isLoading } = useQuery<BlogComment[]>({
    queryKey: ['/api/blog/admin/comments'],
    retry: false,
  });

  // Mutation pour approuver/rejeter un commentaire
  const updateStatusMutation = useMutation({
    mutationFn: async ({ commentId, isApproved }: { commentId: number; isApproved: boolean }) => {
      const response = await apiRequest('PATCH', `/api/blog/admin/comments/${commentId}`, { isApproved });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du statut');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/admin/comments'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du commentaire a été mis à jour avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Échec de la mise à jour : ${error.message}`,
      });
    },
  });

  // Mutation pour supprimer un commentaire
  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest('DELETE', `/api/blog/admin/comments/${commentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/admin/comments'] });
      setDeleteDialogOpen(false);
      toast({
        title: 'Commentaire supprimé',
        description: 'Le commentaire a été supprimé avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Échec de la suppression : ${error.message}`,
      });
    },
  });

  // Approuver un commentaire
  const handleApprove = (commentId: number) => {
    updateStatusMutation.mutate({ commentId, isApproved: true });
  };

  // Rejeter un commentaire
  const handleReject = (commentId: number) => {
    updateStatusMutation.mutate({ commentId, isApproved: false });
  };

  // Ouvrir la boîte de dialogue de suppression
  const handleDeleteClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    if (commentToDelete) {
      deleteMutation.mutate(commentToDelete);
    }
  };

  // Ouvrir la boîte de dialogue pour voir le commentaire complet
  const handleViewComment = (comment: BlogComment) => {
    setSelectedComment(comment);
    setViewDialogOpen(true);
  };

  // Filtrer les commentaires en fonction des critères
  const filteredComments = comments ? comments.filter(comment => {
    // Filtre de recherche
    const searchMatch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.displayName && comment.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comment.username && comment.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comment.postTitle && comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre de statut
    let statusMatch = true;
    if (statusFilter === 'approved') {
      statusMatch = comment.isApproved === true;
    } else if (statusFilter === 'rejected') {
      statusMatch = comment.isApproved === false;
    } else if (statusFilter === 'pending') {
      statusMatch = comment.isApproved === null;
    }
    
    return searchMatch && statusMatch;
  }) : [];

  // Obtenir les initiales pour l'avatar
  const getStatusBadge = (status: boolean | null) => {
    if (status === true) {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Approuvé</Badge>;
    } else if (status === false) {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeté</Badge>;
    } else {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Commentaires</h1>
          <p className="text-muted-foreground">
            Gérez et modérez les commentaires du blog
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tous les commentaires</CardTitle>
          <CardDescription>
            {filteredComments.length} commentaire{filteredComments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Commentaire</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                        <p className="text-muted-foreground mt-2">Aucun commentaire trouvé</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="font-medium">
                            {comment.displayName || comment.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {comment.role}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {comment.content}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => handleViewComment(comment)}
                            >
                              Voir plus
                            </Button>
                            {comment.replyCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {comment.replyCount} réponse{comment.replyCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <a 
                              href={`/blog/${comment.postSlug}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center"
                            >
                              {comment.postTitle.length > 20 
                                ? `${comment.postTitle.substring(0, 20)}...` 
                                : comment.postTitle}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(new Date(comment.createdAt))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(comment.isApproved)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleApprove(comment.id)}
                              disabled={comment.isApproved === true}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleReject(comment.id)}
                              disabled={comment.isApproved === false}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteClick(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible et supprimera également toutes les réponses associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour voir le commentaire complet */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du commentaire</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{selectedComment.displayName || selectedComment.username}</h3>
                    <p className="text-sm text-muted-foreground">{selectedComment.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(selectedComment.createdAt))}
                    </p>
                    {getStatusBadge(selectedComment.isApproved)}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Article</h4>
                  <a 
                    href={`/blog/${selectedComment.postSlug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    {selectedComment.postTitle}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Contenu du commentaire</h4>
                  <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedComment.content}
                  </div>
                </div>
                
                {selectedComment.parentId && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Réponse à un autre commentaire</h4>
                    <Badge>ID du commentaire parent: {selectedComment.parentId}</Badge>
                  </div>
                )}
                
                {selectedComment.replyCount > 0 && (
                  <div>
                    <h4 className="text-sm font-medium">Réponses</h4>
                    <p className="text-sm text-muted-foreground">
                      Ce commentaire a {selectedComment.replyCount} réponse{selectedComment.replyCount > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Fermer
                </Button>
                <Button
                  variant={selectedComment.isApproved === true ? "outline" : "default"}
                  className={selectedComment.isApproved === true ? "border-green-500" : "bg-green-600"}
                  onClick={() => {
                    handleApprove(selectedComment.id);
                    setViewDialogOpen(false);
                  }}
                  disabled={selectedComment.isApproved === true}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approuver
                </Button>
                <Button
                  variant={selectedComment.isApproved === false ? "outline" : "default"}
                  className={selectedComment.isApproved === false ? "border-red-500" : "bg-red-600"}
                  onClick={() => {
                    handleReject(selectedComment.id);
                    setViewDialogOpen(false);
                  }}
                  disabled={selectedComment.isApproved === false}
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogCommentsPage;