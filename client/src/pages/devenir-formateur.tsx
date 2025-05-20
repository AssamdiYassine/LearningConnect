import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Check, ChevronDown, ChevronUp, Mail, Laptop, Users, Calendar, Sparkles, BookOpen } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HeroSection from '@/components/hero-section';

const formSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  expertise: z.string().min(5, 'Veuillez décrire votre domaine d\'expertise'),
  experience: z.string().min(5, 'Veuillez décrire votre expérience'),
  linkedinProfile: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  courseIdeas: z.string().min(10, 'Veuillez décrire vos idées de formations'),
  additionalInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DevenirFormateur() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      expertise: '',
      experience: '',
      linkedinProfile: '',
      courseIdeas: '',
      additionalInfo: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/trainer-applications', data);
      setSubmitted(true);
      toast({
        title: "Candidature envoyée avec succès",
        description: "Nous vous contacterons bientôt !",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur lors de l'envoi",
        description: "Veuillez réessayer plus tard",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const benefits = [
    { 
      icon: <Users className="h-8 w-8 text-indigo-600" />, 
      title: "Partagez votre expertise", 
      description: "Transmettez vos connaissances à des milliers d'apprenants motivés" 
    },
    { 
      icon: <Calendar className="h-8 w-8 text-indigo-600" />, 
      title: "Flexibilité totale", 
      description: "Créez votre emploi du temps selon vos disponibilités" 
    },
    { 
      icon: <Laptop className="h-8 w-8 text-indigo-600" />, 
      title: "Enseignement 100% en ligne", 
      description: "Animez vos formations depuis n'importe où" 
    },
    { 
      icon: <Sparkles className="h-8 w-8 text-indigo-600" />, 
      title: "Rémunération attractive", 
      description: "Bénéficiez d'une commission compétitive sur chaque formation" 
    },
  ];

  const faqs = [
    {
      question: "Comment sont rémunérés les formateurs ?",
      answer: "Les formateurs reçoivent un pourcentage sur chaque formation vendue. La rémunération dépend du nombre d'étudiants inscrits et du prix de la formation. Nous offrons des commissions parmi les plus compétitives du marché."
    },
    {
      question: "Quel équipement est nécessaire pour enseigner ?",
      answer: "Vous aurez besoin d'un ordinateur avec une connexion internet stable, une webcam de bonne qualité, un microphone et un endroit calme pour les sessions en direct. Nous fournissons la plateforme et tous les outils nécessaires pour la création de contenu pédagogique."
    },
    {
      question: "Puis-je proposer mes propres formations ?",
      answer: "Absolument ! Nous encourageons les formateurs à proposer des formations sur leurs domaines d'expertise. Notre équipe pédagogique vous accompagnera dans la structuration et l'optimisation de votre contenu."
    },
    {
      question: "Combien de temps faut-il pour créer une formation ?",
      answer: "La durée varie selon la complexité du sujet et l'étendue du contenu. En général, il faut entre 2 et 4 semaines pour préparer une formation complète, incluant la création du contenu, la validation pédagogique et la mise en ligne."
    },
    {
      question: "Quels sont les thèmes de formation les plus demandés ?",
      answer: "Les formations en développement web, data science, cybersécurité, IA et cloud computing sont particulièrement populaires. Cependant, nous accueillons également des experts dans d'autres domaines IT comme la gestion de projet, le design UX/UI, et le marketing digital."
    }
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Section Hero personnalisée avec fond coloré et animations modernes */}
      <div className="relative w-full min-h-[700px] overflow-hidden bg-gradient-to-br from-[#1D2B6C] via-[#5F8BFF] to-[#7A6CFF] text-white">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Motif de fond */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjMiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjkuNSIvPjxwYXRoIGQ9Ik0yOS41IDE1Ljk5OEgzMC41VjQ0aC0xeiIvPjxwYXRoIGQ9Ik0xNiAyOS41VjMwLjVINDR2LTF6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.04]"></div>
          
          {/* Vagues animées */}
          <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden z-10 opacity-20">
            <svg viewBox="0 0 1200 120" className="absolute animate-wave-1 opacity-50" fill="none">
              <path d="M0,80 C200,100 400,10 600,80 C800,150 1000,50 1200,100 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.1)"></path>
            </svg>
            <svg viewBox="0 0 1200 120" className="absolute animate-wave-2 opacity-30" fill="none">
              <path d="M0,60 C150,120 350,0 500,100 C650,200 800,80 1200,80 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.1)"></path>
            </svg>
            <svg viewBox="0 0 1200 120" className="absolute animate-wave-3 opacity-20" fill="none">
              <path d="M0,40 C250,0 350,150 500,50 C650,-50 900,80 1200,20 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.05)"></path>
            </svg>
          </div>
          
          {/* Bulles et formes abstraites */}
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
        </div>
        
        {/* Contenu principal */}
        <div className="container relative z-10 pt-24 pb-16 px-4 mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 text-indigo-200 text-sm font-medium mb-10">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
              <span>Pour les professionnels tech expérimentés</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Partagez votre expertise tech et{" "}
              <span className="text-yellow-300 inline-block relative">
                boostez votre carrière
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-300/50 rounded-full"></span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
              Devenez formateur chez Necform et transmettez vos connaissances à une communauté passionnée d'apprenants. Enseignez à votre rythme, 100% en ligne.
            </p>
            
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-yellow-300 hover:text-primary-dark font-semibold px-10 py-6 rounded-full shadow-lg shadow-indigo-900/30 transition-all duration-300"
              onClick={() => {
                const formElement = document.getElementById('application-form');
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Postuler maintenant
            </Button>
            
            {/* Cartes des avantages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-16 w-full max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-300">
                <div className="bg-indigo-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                  <BookOpen className="h-7 w-7 text-yellow-300" />
                </div>
                <h3 className="text-lg font-semibold">Liberté pédagogique</h3>
                <p className="text-sm text-white/70 mt-2">Créez vos propres formations selon votre style d'enseignement</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-300">
                <div className="bg-blue-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-7 w-7 text-yellow-300" />
                </div>
                <h3 className="text-lg font-semibold">Communauté engagée</h3>
                <p className="text-sm text-white/70 mt-2">Rejoignez un réseau d'experts et d'apprenants passionnés</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-300">
                <div className="bg-purple-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                  <Laptop className="h-7 w-7 text-yellow-300" />
                </div>
                <h3 className="text-lg font-semibold">100% en ligne</h3>
                <p className="text-sm text-white/70 mt-2">Enseignez de n'importe où, dans un format live interactif</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-300">
                <div className="bg-green-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                  <Mail className="h-7 w-7 text-yellow-300" />
                </div>
                <h3 className="text-lg font-semibold">Support dédié</h3>
                <p className="text-sm text-white/70 mt-2">Accompagnement complet dans la création de votre contenu</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transition douce */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Avantages Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 text-sm">
              Pourquoi nous rejoindre
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Découvrez les avantages d'être formateur</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Rejoignez notre réseau de professionnels et partagez votre expertise dans un environnement flexible et valorisant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-indigo-50 w-16 h-16 flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire de candidature */}
      <section id="application-form" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 text-sm">
                Candidature
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Rejoignez notre équipe de formateurs</h2>
              <p className="text-lg text-gray-600">
                Remplissez le formulaire ci-dessous pour nous faire part de votre intérêt
              </p>
            </div>

            {submitted ? (
              <div className="bg-white p-10 rounded-2xl shadow-md text-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Candidature envoyée avec succès !</h3>
                <p className="text-gray-600 mb-6">
                  Merci pour votre intérêt ! Notre équipe examinera votre candidature et vous contactera rapidement.
                </p>
                <Button onClick={() => window.scrollTo(0, 0)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Retour en haut
                </Button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-md">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre prénom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre numéro de téléphone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domaine d'expertise</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ex: Développement Web, Data Science, DevOps, etc." 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expérience professionnelle</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez brièvement votre parcours professionnel et vos compétences" 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="linkedinProfile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profil LinkedIn (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.linkedin.com/in/votre-profil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="courseIdeas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idées de formations</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Quelles formations aimeriez-vous proposer ? Précisez les sujets, niveaux, etc." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informations complémentaires (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Autres informations que vous souhaitez partager" 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 text-sm">
              Questions fréquentes
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tout ce que vous devez savoir</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Retrouvez les réponses aux questions les plus fréquemment posées par nos formateurs
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-medium text-gray-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2 text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">Vous avez d'autres questions ?</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Contactez-nous
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}