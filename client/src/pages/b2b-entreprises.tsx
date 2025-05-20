import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import {
  Building,
  Check,
  Trophy,
  Users,
  BarChart,
  Laptop,
  Clock,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import HeroSection from '@/components/hero-section';

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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  companyName: z.string().min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères'),
  contactName: z.string().min(2, 'Le nom du contact doit contenir au moins 2 caractères'),
  contactPosition: z.string().min(2, 'La position du contact doit être indiquée'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  employeeCount: z.string().min(1, 'Veuillez indiquer le nombre d\'employés'),
  interests: z.string().min(5, 'Veuillez indiquer les domaines de formation qui vous intéressent'),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function B2BEntreprises() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactPosition: '',
      email: '',
      phone: '',
      employeeCount: '',
      interests: '',
      message: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/enterprise-inquiries', data);
      setSubmitted(true);
      toast({
        title: "Demande envoyée avec succès",
        description: "Notre équipe commerciale vous contactera rapidement",
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
      icon: <Users className="h-10 w-10 text-indigo-600" />, 
      title: "Formation sur mesure", 
      description: "Programmes personnalisés selon les besoins spécifiques de votre entreprise et de vos équipes" 
    },
    { 
      icon: <BarChart className="h-10 w-10 text-indigo-600" />, 
      title: "Analyse des performances", 
      description: "Tableaux de bord détaillés pour suivre la progression et l'engagement de vos collaborateurs" 
    },
    { 
      icon: <Laptop className="h-10 w-10 text-indigo-600" />, 
      title: "Plateforme dédiée", 
      description: "Espace entreprise personnalisé avec gestion centralisée des accès et des parcours" 
    },
    { 
      icon: <Clock className="h-10 w-10 text-indigo-600" />, 
      title: "Flexibilité totale", 
      description: "Sessions live programmées selon vos disponibilités et accès aux replays pendant 1 an" 
    },
  ];

  const pricingPlans = [
    {
      name: "Business",
      price: "499€",
      period: "/mois",
      description: "Idéal pour les petites équipes",
      features: [
        "Jusqu'à 10 utilisateurs",
        "Accès à toutes les formations",
        "Sessions live illimitées",
        "Support prioritaire",
        "Tableau de bord de gestion",
        "Certificats personnalisés"
      ],
      cta: "Commencer maintenant",
      highlight: false
    },
    {
      name: "Enterprise",
      price: "999€",
      period: "/mois",
      description: "Pour les moyennes entreprises",
      features: [
        "Jusqu'à 30 utilisateurs",
        "Accès à toutes les formations",
        "Sessions live illimitées",
        "Support dédié 24/7",
        "Tableau de bord avancé",
        "Formation sur mesure (2/an)",
        "API d'intégration",
        "SSO et authentification LDAP"
      ],
      cta: "Contactez-nous",
      highlight: true
    },
    {
      name: "Corporate",
      price: "Sur mesure",
      period: "",
      description: "Pour les grandes organisations",
      features: [
        "Utilisateurs illimités",
        "Plateforme personnalisée",
        "Formations sur mesure illimitées",
        "Gestionnaire de compte dédié",
        "Intégration complète à votre LMS",
        "Analyse avancée et rapports sur mesure",
        "Déploiement on-premise possible"
      ],
      cta: "Demander un devis",
      highlight: false
    }
  ];

  const faqs = [
    {
      question: "Comment fonctionne l'abonnement entreprise ?",
      answer: "L'abonnement entreprise vous permet d'offrir un accès à notre plateforme à vos collaborateurs. Vous pouvez choisir parmi différentes formules selon le nombre d'utilisateurs et vos besoins spécifiques. La gestion des accès se fait via un tableau de bord administrateur dédié."
    },
    {
      question: "Est-il possible de créer des parcours de formation personnalisés ?",
      answer: "Absolument. Nos formules Enterprise et Corporate incluent la possibilité de créer des parcours de formation sur mesure adaptés aux besoins spécifiques de votre entreprise. Nos experts pédagogiques travaillent directement avec vous pour concevoir le programme le plus pertinent."
    },
    {
      question: "Comment suivre la progression de nos employés ?",
      answer: "Toutes nos formules entreprises incluent un tableau de bord de suivi qui vous permet de visualiser l'engagement et la progression de vos collaborateurs. Des rapports détaillés peuvent être générés pour analyser les résultats et l'efficacité des formations."
    },
    {
      question: "Proposez-vous des formations certifiantes ?",
      answer: "Oui, de nombreuses formations sur notre plateforme sont certifiantes. Pour les entreprises, nous pouvons également mettre en place des parcours spécifiques aboutissant à des certifications reconnues dans le secteur IT. Nous proposons aussi des certificats co-brandés avec votre entreprise."
    },
    {
      question: "Peut-on intégrer votre plateforme à notre système de gestion RH ou LMS existant ?",
      answer: "Les formules Enterprise et Corporate incluent des options d'intégration via API pour connecter notre plateforme à vos systèmes existants (SIRH, LMS, SSO...). Notre équipe technique vous accompagne dans cette mise en place pour une expérience utilisateur optimale."
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="relative min-h-[700px] py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#1D2B6C] via-[#5F8BFF] to-[#7A6CFF] text-white">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Maillage géométrique subtil */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjMiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjkuNSIvPjxwYXRoIGQ9Ik0yOS41IDE1Ljk5OEgzMC41VjQ0aC0xeiIvPjxwYXRoIGQ9Ik0xNiAyOS41VjMwLjVINDR2LTF6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.04]"></div>
          
          {/* Bulles et formes abstraites */}
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
        </div>
        
        {/* Contenu principal */}
        <div className="container mx-auto relative z-10 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              Formez vos équipes IT avec des<br className="hidden md:block" /> experts de l'industrie
            </h1>
            
            <p className="mt-4 text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              Des formations live, interactives et sur mesure pour développer les compétences tech de vos collaborateurs et accélérer votre transformation numérique.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-6xl mx-auto">
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 text-indigo-200 text-sm font-medium mb-6">
                <Trophy className="h-4 w-4 mr-2 text-yellow-300" />
                <span className="truncate">Solutions Entreprises Premium</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-yellow-300 hover:text-primary-dark font-semibold px-8 rounded-full shadow-lg shadow-indigo-900/20 transition-all duration-300"
                  onClick={() => {
                    const formElement = document.getElementById('contact-form');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Demander un devis
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 px-8 rounded-full backdrop-blur-sm transition-all duration-300"
                >
                  Découvrir nos offres
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-yellow-500/20 p-2 rounded-full">
                    <Trophy className="h-6 w-6 text-yellow-300" />
                  </div>
                  <h3 className="text-xl font-semibold">Pourquoi nous choisir ?</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 group">
                    <div className="rounded-full bg-green-500/20 p-1.5 mt-0.5">
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">100% en direct</p>
                      <p className="text-sm text-white/70">Formations live avec des experts reconnus</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/20 p-1.5 mt-0.5">
                      <Check className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Programmes sur mesure</p>
                      <p className="text-sm text-white/70">Adaptés aux besoins spécifiques de votre entreprise</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-500/20 p-1.5 mt-0.5">
                      <Check className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Analytics avancés</p>
                      <p className="text-sm text-white/70">Dashboard pour suivre la progression de vos équipes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-orange-500/20 p-1.5 mt-0.5">
                      <Check className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">97% satisfaction</p>
                      <p className="text-sm text-white/70">Avis clients vérifiés et retours positifs</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6 bg-white/20" />
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="h-5 w-5 text-yellow-300" />
                    <p className="font-semibold">Ils nous font confiance :</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="bg-white/5 px-3 py-1.5 rounded-md border border-white/10 text-white/90">Microsoft</div>
                    <div className="bg-white/5 px-3 py-1.5 rounded-md border border-white/10 text-white/90">Orange</div>
                    <div className="bg-white/5 px-3 py-1.5 rounded-md border border-white/10 text-white/90">BNP Paribas</div>
                    <div className="bg-white/5 px-3 py-1.5 rounded-md border border-white/10 text-white/90">Thales</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transition douce */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Avantages Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5">
              Avantages Entreprises
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Une solution complète pour la montée en compétences de vos équipes
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez comment Necform accompagne les entreprises dans leur transformation digitale 
              grâce à des formations tech de qualité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-8">
                  <div className="rounded-full bg-indigo-50 w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-center">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5">
              Tarification
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Des offres adaptées à chaque entreprise
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choisissez le forfait qui correspond le mieux à vos besoins et à la taille de votre équipe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`${
                  plan.highlight 
                    ? 'border-indigo-500 shadow-lg shadow-indigo-100 relative overflow-hidden' 
                    : 'border-gray-200'
                } hover:shadow-xl transition-all duration-300`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 w-full bg-indigo-500 text-white py-1.5 text-center text-sm font-medium">
                    Recommandé
                  </div>
                )}
                <CardHeader className={plan.highlight ? 'pt-12' : 'pt-8'}>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="ml-1 text-xl font-semibold text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mr-3 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.highlight 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => {
                      const formElement = document.getElementById('contact-form');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5">
                  Contactez-nous
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Parlons de vos besoins en formation
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Remplissez le formulaire ci-contre et un conseiller entreprise vous contactera pour discuter de vos besoins spécifiques et vous proposer une solution adaptée.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-indigo-100 p-3">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Formations sur mesure</h3>
                      <p className="text-gray-600 mt-1">Programmes adaptés aux besoins spécifiques de votre entreprise</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-indigo-100 p-3">
                      <Check className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Experts du secteur</h3>
                      <p className="text-gray-600 mt-1">Des formateurs expérimentés issus des plus grandes entreprises tech</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-indigo-100 p-3">
                      <BarChart className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Suivi détaillé</h3>
                      <p className="text-gray-600 mt-1">Tableaux de bord avancés pour suivre la progression de vos équipes</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                {submitted ? (
                  <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Demande envoyée avec succès !</h3>
                    <p className="text-gray-600 mb-6">
                      Merci pour votre intérêt ! Un conseiller entreprise vous contactera très prochainement pour discuter de vos besoins et vous proposer une solution adaptée.
                    </p>
                    <Button 
                      onClick={() => setSubmitted(false)} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Nouvelle demande
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l'entreprise</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre entreprise" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="contactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom du contact</FormLabel>
                                <FormControl>
                                  <Input placeholder="Votre nom" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contactPosition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fonction</FormLabel>
                                <FormControl>
                                  <Input placeholder="Votre poste" {...field} />
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
                                <FormLabel>Email professionnel</FormLabel>
                                <FormControl>
                                  <Input placeholder="votre.email@entreprise.com" {...field} />
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
                          name="employeeCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre d'employés à former</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner le nombre d'employés" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-10">1-10 employés</SelectItem>
                                  <SelectItem value="11-50">11-50 employés</SelectItem>
                                  <SelectItem value="51-200">51-200 employés</SelectItem>
                                  <SelectItem value="201-500">201-500 employés</SelectItem>
                                  <SelectItem value="501+">Plus de 500 employés</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="interests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Domaines de formation qui vous intéressent</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ex: Développement Web, Data Science, Cybersécurité..."
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
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message (optionnel)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Précisions sur vos besoins spécifiques"
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
                          {isSubmitting ? "Envoi en cours..." : "Demander un devis"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5">
              Questions fréquentes
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Tout ce que vous devez savoir</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Retrouvez les réponses aux questions les plus fréquemment posées par nos clients entreprises
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
            <p className="text-gray-600 mb-6">Vous avez d'autres questions ou besoin d'une solution personnalisée ?</p>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-full"
              onClick={() => {
                const formElement = document.getElementById('contact-form');
                if (formElement) {
                  formElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Contactez notre équipe commerciale
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}