import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { insertBlogPostSchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Loader2, Save, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTitle } from "@/hooks/use-title";

// Extend the schema for form validation
const postSchema = insertBlogPostSchema.extend({
  slug: z.string().min(1, "Le slug est requis").refine(
    (val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
    {
      message: "Le slug doit être en minuscules, sans caractères spéciaux ou espaces (utilisez des tirets)",
    }
  ),
  content: z.string().min(10, "Le contenu est trop court"),
});

type PostFormData = z.infer<typeof postSchema>;

const EditBlogPostPage = () => {
  const [, params] = useRoute("/blog/admin/edit-post/:id");
  const postId = params?.id ? parseInt(params.id) : undefined;
  const isEditMode = !!postId;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("editor");
  const [previewHtml, setPreviewHtml] = useState("");
  
  useTitle(isEditMode ? "Modifier l'article - Administration" : "Nouvel article - Administration");

  // Fetch post if in edit mode
  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: [`/api/blog/posts/${postId}`],
    enabled: isEditMode,
  });

  // Fetch all categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/blog/categories"],
  });

  // Form definition
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      status: "draft",
      categoryId: 0,
      authorId: user?.id || 0,
    },
  });

  // Set form values when post is loaded
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage || "",
        status: post.status,
        categoryId: post.categoryId,
        authorId: post.authorId,
      });
    } else if (!isEditMode && user) {
      // Set authorId to current user by default
      form.setValue("authorId", user.id);
    }
  }, [post, form, isEditMode, user]);

  // Auto-generate slug from title
  const autoGenerateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
      
      form.setValue("slug", slug);
    }
  };

  // Auto-generate excerpt from content
  const autoGenerateExcerpt = () => {
    const content = form.getValues("content");
    if (content) {
      // Strip HTML tags and get first 150 characters
      const plainText = content.replace(/<[^>]*>/g, "");
      const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? "..." : "");
      
      form.setValue("excerpt", excerpt);
    }
  };

  // Generate preview HTML
  const generatePreview = () => {
    const content = form.getValues("content");
    setPreviewHtml(content);
    setActiveTab("preview");
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      const res = await apiRequest("POST", "/api/blog/posts", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Article créé",
        description: "L'article a été créé avec succès.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setLocation("/blog/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'article.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      const res = await apiRequest("PUT", `/api/blog/posts/${postId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Article mis à jour",
        description: "L'article a été mis à jour avec succès.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/blog/posts/${postId}`] });
      setLocation("/blog/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de l'article.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: PostFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Return to posts list
  const handleCancel = () => {
    setLocation("/blog/admin");
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLoading = isPostLoading || categoriesLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Modifier l'article" : "Nouvel article"}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button
              variant="outline"
              onClick={() => form.handleSubmit(onSubmit)({ ...form.getValues(), status: "draft" })}
              disabled={isSubmitting}
            >
              Enregistrer comme brouillon
            </Button>
            <Button
              onClick={() => form.handleSubmit(onSubmit)({ ...form.getValues(), status: "published" })}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Publier
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contenu de l'article</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Titre de l'article"
                              onBlur={() => {
                                if (!form.getValues("slug")) {
                                  autoGenerateSlug();
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  placeholder="slug-de-larticle"
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={autoGenerateSlug}
                              >
                                Générer
                              </Button>
                            </div>
                            <FormDescription>
                              Identifiant unique utilisé dans les URLs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Brouillon</SelectItem>
                                <SelectItem value="published">Publié</SelectItem>
                                <SelectItem value="archived">Archivé</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extrait</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Bref résumé de l'article"
                                rows={3}
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={autoGenerateExcerpt}
                            >
                              Générer
                            </Button>
                          </div>
                          <FormDescription>
                            Un court résumé affiché dans les aperçus d'articles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <FormLabel>Contenu</FormLabel>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generatePreview}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Aperçu
                          </Button>
                        </div>
                      </div>

                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-2">
                          <TabsTrigger value="editor">
                            <FileEdit className="mr-2 h-4 w-4" />
                            Éditeur
                          </TabsTrigger>
                          <TabsTrigger value="preview">
                            <Eye className="mr-2 h-4 w-4" />
                            Aperçu
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="editor">
                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Contenu de l'article en HTML"
                                    rows={15}
                                    className="font-mono text-sm"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Le contenu de l'article au format HTML
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>

                        <TabsContent value="preview">
                          <div className="border rounded-md p-4 min-h-[300px] prose dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de publication</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem 
                                  key={category.id} 
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image à la une (URL)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="https://exemple.com/image.jpg"
                            />
                          </FormControl>
                          <FormDescription>
                            URL d'une image représentative pour l'article
                          </FormDescription>
                          <FormMessage />
                          {field.value && (
                            <div className="mt-2 rounded-md overflow-hidden border">
                              <img 
                                src={field.value} 
                                alt="Aperçu de l'image à la une" 
                                className="w-full h-auto" 
                              />
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auteur</FormLabel>
                          <FormControl>
                            <Input 
                              value={user?.displayName || ""}
                              disabled
                            />
                          </FormControl>
                          <FormDescription>
                            Vous êtes l'auteur de cet article
                          </FormDescription>
                          <input type="hidden" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditBlogPostPage;