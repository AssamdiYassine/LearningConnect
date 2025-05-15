import { motion } from "framer-motion";
import { 
  FaWindows, 
  FaAmazon, 
  FaGoogle, 
  FaRedhat, 
  FaDatabase, 
  FaCloud, 
  FaNetworkWired, 
  FaServer 
} from "react-icons/fa";

// Partner data with icons from react-icons
const partners = [
  { 
    name: "Microsoft", 
    icon: <FaWindows className="w-10 h-10 text-[#0078D4]" />,
    color: "from-[#0078D4]/10 to-[#0078D4]/5"
  },
  { 
    name: "AWS", 
    icon: <FaAmazon className="w-10 h-10 text-[#FF9900]" />,
    color: "from-[#FF9900]/10 to-[#FF9900]/5"
  },
  { 
    name: "Google Cloud", 
    icon: <FaGoogle className="w-10 h-10 text-[#4285F4]" />,
    color: "from-[#4285F4]/10 to-[#4285F4]/5"
  },
  { 
    name: "Red Hat", 
    icon: <FaRedhat className="w-10 h-10 text-[#EE0000]" />,
    color: "from-[#EE0000]/10 to-[#EE0000]/5"
  },
  { 
    name: "Oracle", 
    icon: <FaDatabase className="w-10 h-10 text-[#F80000]" />,
    color: "from-[#F80000]/10 to-[#F80000]/5"
  },
  { 
    name: "Salesforce", 
    icon: <FaCloud className="w-10 h-10 text-[#00A1E0]" />,
    color: "from-[#00A1E0]/10 to-[#00A1E0]/5"
  },
  { 
    name: "Cisco", 
    icon: <FaNetworkWired className="w-10 h-10 text-[#1BA0D7]" />,
    color: "from-[#1BA0D7]/10 to-[#1BA0D7]/5"
  },
  { 
    name: "IBM", 
    icon: <FaServer className="w-10 h-10 text-[#054ADA]" />,
    color: "from-[#054ADA]/10 to-[#054ADA]/5"
  },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function PartnersSection() {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-white to-[#F7F9FC]">
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <span className="px-4 py-1 rounded-full bg-[#5F8BFF]/10 text-[#5F8BFF] text-sm font-medium">
            Écosystème
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D2B6C] mt-4 mb-4">Nos partenaires</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ils font confiance à nos formations pour développer les talents de demain
          </p>
        </div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {partners.map((partner, idx) => (
            <motion.div
              key={idx}
              variants={fadeIn}
              className="relative group"
            >
              <div 
                className={`h-36 bg-white rounded-[20px] border border-gray-100 shadow-xl flex flex-col items-center justify-center px-4 
                           hover:scale-105 transition-all duration-300 bg-gradient-to-br ${partner.color} overflow-hidden relative`}
              >
                <div className="absolute w-40 h-40 rounded-full bg-white/50 -top-20 -right-20 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>
                <div className="mb-4">
                  {partner.icon}
                </div>
                <span className="text-gray-800 font-semibold">{partner.name}</span>
              </div>
            </motion.div>
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