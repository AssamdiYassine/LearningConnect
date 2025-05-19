import { useParams, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CourseWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

export default function PurchasePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Rediriger si l'utilisateur n'est pas connecté
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Rediriger si l'utilisateur est déjà abonné ou est un employé d'entreprise
  if (user.isSubscribed || user.enterpriseId || user.role === 'enterprise_employee') {
    return <Redirect to="/catalog" />;
  }

  // Récupérer les détails du cours
  const { data: course, isLoading: isLoadingCourse } = useQuery<CourseWithDetails>({
    queryKey: [`/api/courses/${courseId}`],
  });

  // Mutation pour l'achat du cours
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/purchase-course", { courseId: parseInt(courseId!) });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Achat réussi",
        description: "Vous avez maintenant accès à cette formation",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de l'achat",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoadingCourse) {
    return (
      <div className="container py-16 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-16">
        <h1 className="text-3xl font-bold text-center">Formation non trouvée</h1>
        <div className="mt-8 text-center">
          <Link href="/catalog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto">
        <Link href={`/course/${courseId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux détails du cours
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary">
          Acheter une formation
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{course.title}</CardTitle>
            <CardDescription>
              Formateur: {course.trainer?.displayName || "Non spécifié"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p>{course.category?.name || "Non spécifiée"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Niveau</p>
                  <p className="capitalize">
                    {!course.level
                      ? "Non spécifié"
                      : course.level === "beginner"
                      ? "Débutant"
                      : course.level === "intermediate"
                      ? "Intermédiaire"
                      : "Avancé"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p>{course.description}</p>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Prix</span>
                  <span className="text-2xl font-bold text-primary">{course.price} €</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => purchaseMutation.mutate()}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement en cours...
                </>
              ) : (
                "Acheter maintenant"
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              <p>Ou préférez-vous accéder à toutes nos formations ?</p>
              <Link href="/subscription">
                <Button variant="link">Voir nos abonnements</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Ce que vous obtenez :</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Accès complet à toutes les sessions de cette formation</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Participation aux sessions en direct via Zoom</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Certificat de participation</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Accès aux enregistrements des sessions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}