import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { withAdminDashboard } from '@/lib/with-admin-dashboard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BlogPostWithDetails, BlogCategory } from '@shared/schema';

const AdminBlogPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  // Récupérer les articles
  const { data: posts, isLoading: postsLoading } = useQuery<BlogPostWithDetails[]>({
    queryKey: ['/api/admin/blogs'],
    retry: false,
    onSuccess: (data) => {
      console.log("Articles de blog récupérés:", data);
    }
  });

  // Récupérer les catégories
  const { data: categories, isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ['/api/admin/blog-categories'],
    retry: false,
  });

  // Mutation pour supprimer un article
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/blogs/${postId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'article');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blogs'] });
      toast({
        title: 'Succès',
        description: 'L\'article a été supprimé avec succès.',
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

  // Mutation pour mettre à jour le statut d'un article
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/blogs/${id}`, { status });
      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour du statut de l'article`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blogs'] });
      toast({
        title: 'Succès',
        description: 'Le statut de l\'article a été mis à jour.',
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

  // Filtrer les articles en fonction du terme de recherche
  const filteredPosts = posts ? posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.author && post.author.displayName && post.author.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (post.category && post.category.name && post.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // Compter les articles par statut
  const draftCount = posts?.filter(post => post.status === 'draft').length || 0;
  const publishedCount = posts?.filter(post => post.status === 'published').length || 0;
  const archivedCount = posts?.filter(post => post.status === 'archived').length || 0;

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Fonction pour traduire le statut en français
  const translateStatus = (status: string) => {
    switch(status) {
      case 'published':
        return 'Publié';
      case 'draft':
        return 'Brouillon';
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  };

  // Fonction pour ouvrir la boîte de dialogue de confirmation de suppression
  const confirmDelete = (id: number) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Fonction pour effectuer la suppression après confirmation
  const handleDelete = () => {
    if (postToDelete !== null) {
      deleteMutation.mutate(postToDelete);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Blog</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les articles, catégories et commentaires de votre blog.
          </p>
        </div>
        <Button asChild className="mt-3 sm:mt-0">
          <Link to="/admin/blogs/edit-post">
            <Plus className="mr-2 h-4 w-4" /> Nouvel article
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total articles
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Articles sur le blog
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Articles publiés
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">
              Visibles sur le blog
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Brouillons
            </CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">
              En attente de publication
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Catégories
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Thématiques du blog
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Articles</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="comments">Commentaires</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Articles du Blog</CardTitle>
                  <CardDescription>Gérez les publications de votre blog.</CardDescription>
                </div>
                <div className="relative w-full md:w-auto md:min-w-[260px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un article..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {postsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-2 p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Aucun article ne correspond à votre recherche.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Vues</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {post.title}
                          </TableCell>
                          <TableCell>
                            {post.author ? (post.author.displayName || post.author.username) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {post.category ? post.category.name : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {post.publishedAt 
                              ? formatDate(new Date(post.publishedAt)) 
                              : (post.createdAt ? formatDate(new Date(post.createdAt)) : 'Date invalide')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(post.status) as any}>
                              {translateStatus(post.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{post.viewCount || 0}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/blog/admin/edit-post/${post.id}`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {post.status !== 'published' && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatusMutation.mutate({ id: post.id, status: 'published' })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Publier
                                  </DropdownMenuItem>
                                )}
                                {post.status !== 'draft' && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatusMutation.mutate({ id: post.id, status: 'draft' })}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Mettre en brouillon
                                  </DropdownMenuItem>
                                )}
                                {post.status !== 'archived' && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatusMutation.mutate({ id: post.id, status: 'archived' })}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Archiver
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => confirmDelete(post.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Catégories du Blog</CardTitle>
                  <CardDescription>Gérez les thématiques de votre blog.</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter une catégorie
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  ))}
                </div>
              ) : !categories?.length ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Aucune catégorie trouvée.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description || 'Aucune description'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" /> Modifier
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commentaires</CardTitle>
              <CardDescription>Modérez les commentaires des utilisateurs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground">Fonctionnalité de modération des commentaires à venir.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article et toutes les données associées seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default withAdminDashboard(AdminBlogPage);