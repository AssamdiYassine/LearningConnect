import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { withAdminDashboard } from "@/lib/with-admin-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash, Plus } from "lucide-react";

// Types
interface Category {
  id: number;
  name: string;
  slug: string;
}

function AdminCategories() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  // Récupération des catégories
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/categories");
      return res.json();
    },
  });

  // Mutation pour créer une catégorie
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Catégorie créée",
        description: "La catégorie a été créée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour une catégorie
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; slug: string } }) => {
      const res = await apiRequest("PUT", `/api/admin/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Catégorie mise à jour",
        description: "La catégorie a été mise à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une catégorie
  const deleteCategoryMutation = useMutation({
    mutationFn: async ({ id, force = false }: { id: number; force?: boolean }) => {
      const url = force 
        ? `/api/admin/categories/${id}?force=true` 
        : `/api/admin/categories/${id}`;
      
      const res = await apiRequest("DELETE", url);
      
      // Si la réponse est un succès sans contenu
      if (res.status === 204) {
        return null;
      }
      
      // Si on a une réponse avec du contenu
      const data = await res.json();
      
      // Si on a une erreur 400 avec canForceDelete, on la traite différemment
      if (res.status === 400 && data.canForceDelete) {
        throw new Error(data.message + " Voulez-vous forcer la suppression?");
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error: Error) => {
      // Si le message contient "force", proposer de forcer la suppression
      if (error.message.includes("forcer la suppression") || error.message.includes("Voulez-vous forcer")) {
        toast({
          title: "Attention",
          description: error.message,
          variant: "destructive",
          action: (
            <Button 
              onClick={() => {
                if (categoryToDelete) {
                  deleteCategoryMutation.mutate({ id: categoryToDelete.id, force: true });
                }
              }}
            >
              Forcer la suppression
            </Button>
          ),
        });
      } else {
        toast({
          title: "Erreur",
          description: `Erreur lors de la suppression: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  const handleCreateOrUpdateCategory = () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (categoryToEdit) {
      updateCategoryMutation.mutate({
        id: categoryToEdit.id,
        data: formData,
      });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate({ id: categoryToDelete.id });
    }
  };

  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category);
    setFormData({
      name: category.name,
      slug: category.slug,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCategoryToEdit(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
    });
    setCategoryToEdit(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Gestion des Catégories</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Aucune catégorie trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogue de création/modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Modifier la catégorie" : "Créer une catégorie"}
            </DialogTitle>
            <DialogDescription>
              {categoryToEdit
                ? "Modifiez les informations de la catégorie ci-dessous."
                : "Remplissez les informations pour créer une nouvelle catégorie."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Nom de la catégorie"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="slug-de-la-categorie"
              />
              <p className="text-xs text-muted-foreground">
                Le slug est utilisé dans l'URL. Il doit être unique et ne contenir que des
                lettres, des chiffres et des tirets.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Annuler
            </Button>
            <Button onClick={handleCreateOrUpdateCategory}>
              {categoryToEdit ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          {categoryToDelete && (
            <div className="py-4">
              <p>
                Vous êtes sur le point de supprimer la catégorie{" "}
                <strong>{categoryToDelete.name}</strong>.
              </p>
              <p className="text-red-500 text-sm mt-2">
                Attention: La suppression d'une catégorie peut affecter les formations qui
                y sont associées.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
              Annuler
            </Button>
            <Button onClick={handleDeleteCategory} variant="destructive">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminDashboard(AdminCategories);