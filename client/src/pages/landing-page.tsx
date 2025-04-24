import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-800">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Formation professionnelle en informatique
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              TechFormPro vous propose des formations live de haute qualité avec les meilleurs formateurs du secteur IT
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href={user.role === 'admin' ? '/admin' : (user.role === 'trainer' ? '/trainer' : '/student')}>
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                    Accéder à mon espace
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/catalog">
                    <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                      Découvrir nos formations
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-800">
                      Se connecter
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir TechFormPro ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Formation 100% live</h3>
              <p className="text-gray-600">
                Toutes nos formations sont dispensées en direct par des professionnels, permettant une interaction immédiate et des réponses à vos questions.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Formateurs experts</h3>
              <p className="text-gray-600">
                Nos formateurs sont des professionnels reconnus dans leur domaine avec une expérience concrète en entreprise.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Certifications reconnues</h3>
              <p className="text-gray-600">
                Obtenez des certifications valorisées sur le marché du travail et boostez votre carrière dans le domaine IT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Nos formations populaires</h2>
            <Link href="/catalog">
              <Button variant="outline" className="mt-4 md:mt-0">
                Voir toutes nos formations
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-48 bg-blue-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2 py-1">Développement Web</span>
                  <span className="text-xs text-gray-500 ml-2">• Intermédiaire</span>
                </div>
                <h3 className="text-xl font-bold mb-2">React JS Avancé</h3>
                <p className="text-gray-600 mb-4">
                  Maîtrisez les concepts avancés de React et construisez des applications web modernes avec les meilleures pratiques.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-800">16h de formation</span>
                  <Link href="/catalog">
                    <Button variant="ghost" size="sm">En savoir plus</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Course Card 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-48 bg-indigo-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">DevOps</span>
                  <span className="text-xs text-gray-500 ml-2">• Avancé</span>
                </div>
                <h3 className="text-xl font-bold mb-2">CI/CD avec GitLab et Kubernetes</h3>
                <p className="text-gray-600 mb-4">
                  Implémentez des pipelines CI/CD robustes et déployez vos applications dans des clusters Kubernetes.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-indigo-800">20h de formation</span>
                  <Link href="/catalog">
                    <Button variant="ghost" size="sm">En savoir plus</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Course Card 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-48 bg-green-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-2 py-1">Cybersécurité</span>
                  <span className="text-xs text-gray-500 ml-2">• Débutant</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Sécurité Web Fondamentale</h3>
                <p className="text-gray-600 mb-4">
                  Apprenez à sécuriser vos applications web contre les vulnérabilités les plus courantes et les attaques modernes.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-800">12h de formation</span>
                  <Link href="/catalog">
                    <Button variant="ghost" size="sm">En savoir plus</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ce que nos étudiants disent</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-800 font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-bold">Jean Dupont</h4>
                  <p className="text-gray-500 text-sm">Développeur Web</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "La formation React avancé m'a permis de monter en compétence rapidement. J'ai particulièrement apprécié les sessions live qui m'ont permis d'interagir directement avec le formateur."
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-800 font-bold">SR</span>
                </div>
                <div>
                  <h4 className="font-bold">Sophie Rousseau</h4>
                  <p className="text-gray-500 text-sm">DevOps Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "La formation CI/CD était exactement ce dont j'avais besoin pour faire évoluer notre infrastructure. Les exercices pratiques et les retours d'expérience du formateur ont été très enrichissants."
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-800 font-bold">PM</span>
                </div>
                <div>
                  <h4 className="font-bold">Paul Martin</h4>
                  <p className="text-gray-500 text-sm">Consultant Cybersécurité</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Je recommande TechFormPro à tous mes collègues. La qualité des formations et l'expertise des formateurs sont exceptionnelles, surtout dans un domaine aussi spécifique que la cybersécurité."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à développer vos compétences ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez notre plateforme et accédez à des formations de qualité dispensées par des experts du domaine IT
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              Commencez maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}