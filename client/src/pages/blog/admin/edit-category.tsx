import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { insertBlogCategorySchema } from "@shared/schema";
import { z } from "zod";
import AdminLayout from "@/components/admin-layout";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/hooks/use-title";

// Extend the schema to make sure slug is valid
const categorySchema = insertBlogCategorySchema.extend({
  slug: z.string().min(1, "Le slug est requis").refine(
    (val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
    {
      message: "Le slug doit être en minuscules, sans caractères spéciaux ou espaces (utilisez des tirets)",
    }
  ),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const EditBlogCategoryPage = () => {
  const [, params] = useRoute("/blog/admin/edit-category/:id");
  const categoryId = params?.id ? parseInt(params.id) : undefined;
  const isEditMode = !!categoryId;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useTitle(isEditMode ? "Modifier la catégorie - Administration" : "Nouvelle catégorie - Administration");

  // Fetch category if in edit mode
  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: [`/api/blog/categories/${categoryId}`],
    enabled: isEditMode,
  });

  // Form definition
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Set form values when category is loaded
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
      });
    }
  }, [category, form]);

  // Auto-generate slug from name
  const autoGenerateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
      
      form.setValue("slug", slug);
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest("POST", "/api/blog/categories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Catégorie créée",
        description: "La catégorie a été créée avec succès.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog/categories"] });
      setLocation("/blog/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la catégorie.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest("PUT", `/api/blog/categories/${categoryId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Catégorie mise à jour",
        description: "La catégorie a été mise à jour avec succès.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog/categories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/blog/categories/${categoryId}`] });
      setLocation("/blog/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la catégorie.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: CategoryFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Return to categories list
  const handleCancel = () => {
    setLocation("/blog/admin");
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLoading = isCategoryLoading;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de la catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la catégorie</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Développement Web"
                            onBlur={() => {
                              if (!form.getValues("slug")) {
                                autoGenerateSlug();
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Le nom qui sera affiché aux utilisateurs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Ex: developpement-web"
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={autoGenerateSlug}
                          >
                            Générer
                          </Button>
                        </div>
                        <FormDescription>
                          L'identifiant unique utilisé dans les URLs (minuscules, sans espaces ni caractères spéciaux)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? "Mise à jour..." : "Création..."}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {isEditMode ? "Mettre à jour" : "Créer"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditBlogCategoryPage;