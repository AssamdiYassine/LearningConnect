import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { withAdminDashboard } from '@/lib/with-admin-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ChevronLeft, Save, Tag as TagIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { BlogPostWithDetails, BlogCategory } from '@shared/schema';

// Définir le schéma de validation
const postFormSchema = z.object({
  title: z.string().min(5, {
    message: 'Le titre doit contenir au moins 5 caractères',
  }),
  slug: z.string().min(5, {
    message: 'Le slug doit contenir au moins 5 caractères',
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets',
  }),
  excerpt: z.string().min(10, {
    message: 'L\'extrait doit contenir au moins 10 caractères',
  }).max(200, {
    message: 'L\'extrait ne doit pas dépasser 200 caractères',
  }),
  content: z.string().min(50, {
    message: 'Le contenu doit contenir au moins 50 caractères',
  }),
  featuredImage: z.string().optional(),
  categoryId: z.string().min(1, {
    message: 'Veuillez sélectionner une catégorie',
  }),
  status: z.enum(['draft', 'published', 'archived'], {
    message: 'Veuillez sélectionner un statut valide',
  }),
  readTime: z.string().transform(val => parseInt(val) || 5),
});

type PostFormValues = z.infer<typeof postFormSchema>;

const EditBlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // Récupérer les données du post si on est en mode édition
  const { data: post, isLoading } = useQuery<BlogPostWithDetails>({
    queryKey: ['/api/admin/blogs', id],
    enabled: isEditing,
    retry: false,
  });

  // Récupérer les catégories
  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ['/api/admin/blog-categories'],
    retry: false,
  });

  // Configurer le formulaire
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      categoryId: '',
      status: 'draft',
      readTime: '5',
    },
  });

  // Remplir le formulaire avec les données existantes si on est en mode édition
  useEffect(() => {
    if (isEditing && post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage || '',
        categoryId: post.categoryId.toString(),
        status: post.status,
        readTime: (post.readTime || 5).toString(),
      });
      
      if (post.tags) {
        setTags(post.tags);
      }
    }
  }, [post, form, isEditing]);

  // Fonction pour créer un slug à partir du titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-générer le slug lorsque le titre change
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    
    // Ne pas écraser le slug si l'utilisateur l'a déjà modifié manuellement
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === generateSlug(form.getValues('title').slice(0, -1))) {
      form.setValue('slug', generateSlug(title));
    }
  };

  // Ajouter un tag
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Gérer la touche Entrée pour ajouter un tag
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Mutation pour créer/mettre à jour un article
  const mutation = useMutation({
    mutationFn: async (values: PostFormValues) => {
      // Ajouter les tags à l'objet values
      const postData = {
        ...values,
        tags,
        categoryId: parseInt(values.categoryId),
      };
      
      const url = isEditing 
        ? `/api/admin/blogs/${id}` 
        : '/api/admin/blogs';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await apiRequest(method, url, postData);
      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de l\'article');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blogs'] });
      toast({
        title: 'Succès',
        description: isEditing 
          ? 'Article mis à jour avec succès' 
          : 'Article créé avec succès',
      });
      navigate('/admin/blog');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Échec de l'opération : ${error.message}`,
      });
    },
  });

  // Soumission du formulaire
  const onSubmit = (values: PostFormValues) => {
    mutation.mutate(values);
  };

  // Exemple de contenu Markdown pour aider l'utilisateur
  const markdownExample = `# Titre principal
## Sous-titre
### Sous-sous-titre

Un paragraphe de **texte en gras** avec du *texte en italique*.

- Élément de liste 1
- Élément de liste 2
- Élément de liste 3

[Lien vers un site](https://www.exemple.com)

Un autre paragraphe avec du contenu explicatif.`;

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/blog')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Modifier l\'article' : 'Créer un article'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Première colonne - Informations principales */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de l'article</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de l'article</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Titre accrocheur de l'article" 
                            {...field} 
                            onChange={onTitleChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="titre-accrocheur-de-larticle" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          L'URL de l'article sera : <code>/blog/{field.value}</code>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extrait</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Résumé court de l'article qui apparaîtra dans les aperçus" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value.length}/200 caractères
                        </FormDescription>
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
                            placeholder="https://exemple.com/image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL d'une image qui sera affichée en haut de l'article
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contenu de l'article</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu (format Markdown)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={markdownExample} 
                            {...field} 
                            rows={20}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Utilisez la syntaxe Markdown pour formater votre article
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Seconde colonne - Métadonnées */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
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
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map(category => (
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
                    name="readTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temps de lecture (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="60" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Ajouter un tag..."
                        className="pl-8"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                    </div>
                    <Button type="button" onClick={addTag} size="sm">
                      Ajouter
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                        {tag}
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        Aucun tag ajouté
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default withAdminDashboard(EditBlogPostPage);