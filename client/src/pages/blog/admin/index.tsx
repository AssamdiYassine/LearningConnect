import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin-layout";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Check, 
  Edit, 
  Eye, 
  FileEdit, 
  FileText, 
  MoreVertical, 
  Plus, 
  Search, 
  Tag, 
  Trash, 
  X 
} from "lucide-react";
import { useTitle } from "@/hooks/use-title";

const BlogAdminPage = () => {
  useTitle("Gestion du Blog - Administration");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: string } | null>(null);

  // Fetch blog posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/blog/posts"],
  });

  // Fetch blog categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/blog/categories"],
  });

  // Filter posts based on search query
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter categories based on search query
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete confirmation
  const confirmDelete = (id: number, type: string) => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  // Handle actual deletion
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const endpoint = itemToDelete.type === 'post' 
        ? `/api/blog/posts/${itemToDelete.id}`
        : `/api/blog/categories/${itemToDelete.id}`;
        
      await apiRequest("DELETE", endpoint);
      
      toast({
        title: "Suppression réussie",
        description: `L'élément a été supprimé avec succès.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ 
        queryKey: [itemToDelete.type === 'post' ? "/api/blog/posts" : "/api/blog/categories"] 
      });
    } catch (error) {
      toast({
        title: "Erreur de suppression",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Publié</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      case "archived":
        return <Badge variant="secondary">Archivé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion du Blog</h1>
            <p className="text-muted-foreground">
              Gérez les articles et catégories du blog
            </p>
          </div>
          
          <div className="flex gap-2">
            {activeTab === "posts" ? (
              <Button onClick={() => setLocation("/blog/admin/edit-post")}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel article
              </Button>
            ) : (
              <Button onClick={() => setLocation("/blog/admin/edit-category")}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle catégorie
              </Button>
            )}
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="posts">
              <FileText className="mr-2 h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tag className="mr-2 h-4 w-4" />
              Catégories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {postsLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vues</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>{post.author.displayName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.category.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(post.status)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>{post.viewCount}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setLocation(`/blog/admin/edit-post/${post.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(post.id, 'post')}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Aucun article ne correspond à votre recherche." 
                    : "Vous n'avez pas encore créé d'articles."}
                </p>
                <Button onClick={() => setLocation("/blog/admin/edit-post")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un article
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories">
            {categoriesLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredCategories && filteredCategories.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.slug}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => setLocation(`/blog/admin/edit-category/${category.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(category.id, 'category')}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune catégorie trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Aucune catégorie ne correspond à votre recherche." 
                    : "Vous n'avez pas encore créé de catégories."}
                </p>
                <Button onClick={() => setLocation("/blog/admin/edit-category")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une catégorie
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete?.type === 'post' 
                ? "Supprimer cet article ?" 
                : "Supprimer cette catégorie ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'post' 
                ? "Cette action est irréversible. L'article sera définitivement supprimé du système."
                : "Cette action est irréversible. La catégorie sera définitivement supprimée du système."}
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
    </AdminLayout>
  );
};

export default BlogAdminPage;