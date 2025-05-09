import { motion } from "framer-motion";

// Partner logos with monogram fallbacks
const partners = [
  { name: "TechCorp", logo: "TC" },
  { name: "InnovateSoft", logo: "IS" },
  { name: "DataCloud", logo: "DC" },
  { name: "SecureNet", logo: "SN" },
  { name: "DevSphere", logo: "DS" },
  { name: "NextGen Systems", logo: "NS" },
  { name: "LogicWave", logo: "LW" },
  { name: "CloudFlex", logo: "CF" },
];

export default function PartnersSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos partenaires</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ils font confiance à nos formations pour développer leurs talents
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {partners.map((partner, idx) => (
            <div 
              key={idx} 
              className="bg-gray-50 border border-gray-100 rounded-lg py-6 px-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow duration-300 h-32"
            >
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl mb-3">
                {partner.logo}
              </div>
              <span className="text-gray-800 font-medium">{partner.name}</span>
            </div>
          ))}
        </motion.div>
        
        {/* Trust signals */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Pourquoi les entreprises nous choisissent</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Formations certifiantes</h4>
              <p className="text-gray-600">Des parcours complets reconnus par les professionnels du secteur</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Compétences applicables</h4>
              <p className="text-gray-600">Des connaissances immédiatement utilisables en entreprise</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Réseau international</h4>
              <p className="text-gray-600">Une communauté globale d'apprenants et d'experts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}