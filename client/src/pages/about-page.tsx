import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-900 to-indigo-800">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              À propos de TechFormPro
            </h1>
            <p className="text-xl text-blue-100">
              Une plateforme innovante dédiée à la formation professionnelle en informatique
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Notre mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              Chez TechFormPro, notre mission est de démocratiser l'accès à la formation informatique de haute qualité, en mettant en relation les meilleurs formateurs du secteur avec des professionnels en quête de développement de compétences.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Nous croyons fermement que la formation continue est essentielle dans un domaine aussi dynamique que l'informatique. C'est pourquoi nous avons créé une plateforme qui privilégie les sessions de formation live, interactives et adaptées aux besoins du marché actuel.
            </p>
            <p className="text-lg text-gray-700">
              Notre objectif est simple : vous aider à rester à la pointe de la technologie et faire progresser votre carrière grâce à des formations pertinentes et de qualité.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Notre histoire</h2>
            <div className="space-y-6">
              <p className="text-lg text-gray-700">
                TechFormPro est né en 2023 d'un constat simple : malgré l'abondance de ressources d'apprentissage en ligne, il manquait une plateforme dédiée spécifiquement à la formation professionnelle live en informatique. Les fondateurs, tous issus du secteur IT, ont uni leurs forces pour créer un espace où l'expertise et la pédagogie se rencontrent.
              </p>
              <p className="text-lg text-gray-700">
                Dès le début, notre approche s'est distinguée par son engagement envers la qualité plutôt que la quantité. Nous avons soigneusement sélectionné des formateurs experts dans leur domaine, capables non seulement de maîtriser leur sujet, mais aussi de le transmettre avec passion et clarté.
              </p>
              <p className="text-lg text-gray-700">
                Aujourd'hui, TechFormPro continue de grandir, fidèle à sa vision d'origine : offrir des formations IT de qualité supérieure, accessibles à tous les professionnels souhaitant évoluer dans leur carrière.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Notre équipe</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Thomas Dubois</h3>
              <p className="text-blue-700 mb-2">CEO & Co-fondateur</p>
              <p className="text-center text-gray-600">
                Expert en développement web avec plus de 15 ans d'expérience dans la formation professionnelle.
              </p>
            </div>
            
            {/* Team Member 2 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Sarah Laurent</h3>
              <p className="text-blue-700 mb-2">CTO & Co-fondatrice</p>
              <p className="text-center text-gray-600">
                Architecte logiciel spécialisée en systèmes distribués et en méthodologies DevOps.
              </p>
            </div>
            
            {/* Team Member 3 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Marc Leroy</h3>
              <p className="text-blue-700 mb-2">Directeur Pédagogique</p>
              <p className="text-center text-gray-600">
                Ancien responsable de formations IT dans de grandes écoles, il veille à la qualité de nos programmes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Nos valeurs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">
                Nous nous engageons à offrir des formations de la plus haute qualité, dispensées par des formateurs exceptionnels et constamment mises à jour.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interaction</h3>
              <p className="text-gray-600">
                Nous privilégions les échanges directs entre formateurs et apprenants pour une expérience d'apprentissage optimale et personnalisée.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                Nous restons à l'avant-garde des technologies et des méthodes pédagogiques pour vous offrir une formation pertinente et actuelle.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Communauté</h3>
              <p className="text-gray-600">
                Nous favorisons la création d'une communauté d'apprentissage où les étudiants et les formateurs peuvent partager, collaborer et grandir ensemble.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez notre communauté d'apprenants</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Découvrez nos formations et commencez votre parcours d'apprentissage avec TechFormPro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                Voir notre catalogue
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-800">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}