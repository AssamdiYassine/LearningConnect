import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  planType: string;
}

export default function SubscriptionPlansSection() {
  const [location, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Récupérer les plans d'abonnement depuis l'API
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/subscription-plans/public'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Filtrer les plans selon la période sélectionnée
  const monthlyPlans = plans.filter(plan => plan.planType === 'monthly');
  const annualPlans = plans.filter(plan => plan.planType === 'annual');

  const displayedPlans = billingPeriod === 'monthly' ? monthlyPlans : annualPlans;

  const handleSelectPlan = (planId: number) => {
    setLocation(`/subscription?plan=${planId}`);
  };

  return (
    <section className="relative bg-gradient-to-b from-white to-[#F7F9FC] py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#F7F9FC] to-white"></div>
      <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#5F8BFF]/5 blur-3xl"></div>
      <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-[#7A6CFF]/5 blur-3xl"></div>
      
      <div className="container relative mx-auto px-4 max-w-[1920px]">
        <div className="text-center max-w-xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Nos plans d'abonnement
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 mb-8"
          >
            Choisissez la formule qui correspond à vos besoins et accédez à toutes nos formations en direct
          </motion.p>
          
          {/* Toggle button for monthly/annual */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex p-1 bg-gray-100 rounded-full mb-4"
          >
            <button 
              onClick={() => setBillingPeriod('monthly')} 
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                billingPeriod === 'monthly' 
                  ? 'bg-white text-[#1D2B6C] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button 
              onClick={() => setBillingPeriod('annual')} 
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                billingPeriod === 'annual' 
                  ? 'bg-white text-[#1D2B6C] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuel
            </button>
          </motion.div>
          
          {billingPeriod === 'annual' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-[#5F8BFF] font-medium bg-blue-50 rounded-full py-1 px-4 inline-flex items-center mb-8"
            >
              Économisez jusqu'à 40% avec un abonnement annuel
            </motion.div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D2B6C]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl overflow-hidden shadow-xl bg-white border ${
                  plan.planType === 'annual' ? 'border-[#5F8BFF]' : 'border-gray-100'
                }`}
              >
                {/* Popular badge */}
                {plan.planType === 'annual' && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#5F8BFF] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Le plus populaire
                    </div>
                  </div>
                )}
                
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm min-h-[40px]">{plan.description}</p>
                  
                  <div className="mt-4 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-500 ml-2">
                      {plan.planType === 'monthly' ? '/mois' : '/an'}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full ${
                      plan.planType === 'annual' 
                        ? 'bg-[#5F8BFF] hover:bg-[#4A76E8] text-white' 
                        : 'bg-white border border-[#5F8BFF] text-[#5F8BFF] hover:bg-[#5F8BFF]/5'
                    } mt-4 py-6 group`}
                  >
                    <span className="flex items-center">
                      Choisir ce plan
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </div>
                
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Inclus :</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5F8BFF]/10 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-[#5F8BFF]" />
                        </div>
                        <span className="ml-3 text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}