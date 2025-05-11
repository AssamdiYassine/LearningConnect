import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { withAdminDashboard } from '@/lib/with-admin-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BlogCategory } from '@shared/schema';

// Définir le schéma de validation
const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Le nom de la catégorie doit contenir au moins 2 caractères',
  }),
  description: z.string().optional(),
  slug: z.string().min(2, {
    message: 'Le slug doit contenir au moins 2 caractères',
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets',
  }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const EditBlogCategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;

  // Récupérer les données de la catégorie si on est en mode édition
  const { data: category, isLoading } = useQuery<BlogCategory>({
    queryKey: ['/api/admin/blog-categories', id],
    enabled: isEditing,
    retry: false,
  });

  // Configurer le formulaire
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
    },
  });

  // Remplir le formulaire avec les données existantes si on est en mode édition
  useEffect(() => {
    if (isEditing && category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        slug: category.slug,
      });
    }
  }, [category, form, isEditing]);

  // Fonction pour créer un slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-générer le slug lorsque le nom change
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    
    // Ne pas écraser le slug si l'utilisateur l'a déjà modifié manuellement
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === generateSlug(form.getValues('name').slice(0, -1))) {
      form.setValue('slug', generateSlug(name));
    }
  };

  // Mutation pour créer/mettre à jour une catégorie
  const mutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const url = isEditing 
        ? `/api/admin/blog-categories/${id}` 
        : '/api/admin/blog-categories';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await apiRequest(method, url, values);
      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de la catégorie');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog-categories'] });
      toast({
        title: 'Succès',
        description: isEditing 
          ? 'Catégorie mise à jour avec succès' 
          : 'Catégorie créée avec succès',
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
  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate(values);
  };

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
          {isEditing ? 'Modifier la catégorie' : 'Créer une catégorie'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
        </CardHeader>
        <CardContent>
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
                        placeholder="Ex: Développement Web" 
                        {...field} 
                        onChange={onNameChange}
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
                        placeholder="ex: developpement-web" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnelle)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de la catégorie" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full sm:w-auto"
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAdminDashboard(EditBlogCategoryPage);