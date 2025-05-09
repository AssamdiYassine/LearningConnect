import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

type Step = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

type OnboardingContextType = {
  isOpen: boolean;
  currentStep: string;
  steps: Step[];
  openOnboarding: () => void;
  closeOnboarding: () => void;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  completeAllSteps: () => void;
  isStepCompleted: (stepId: string) => boolean;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Demo steps that would normally come from the API
const demoSteps: Step[] = [
  {
    id: "welcome",
    title: "Bienvenue sur TechFormPro",
    description: "Découvrez notre plateforme de formations IT en direct.",
    completed: false
  },
  {
    id: "profile",
    title: "Complétez votre profil",
    description: "Aidez-nous à personnaliser votre expérience d'apprentissage.",
    completed: false
  },
  {
    id: "preferences",
    title: "Vos préférences",
    description: "Quels domaines de l'IT vous intéressent le plus ?",
    completed: false
  },
  {
    id: "first-course",
    title: "Votre première formation",
    description: "Choisissez une formation pour commencer votre apprentissage.",
    completed: false
  }
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [steps, setSteps] = useState<Step[]>(demoSteps);

  // Fetch onboarding data when user changes
  useEffect(() => {
    if (user) {
      fetchOnboardingData();
    }
  }, [user]);

  const fetchOnboardingData = async () => {
    try {
      const response = await apiRequest("GET", "/api/onboarding");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSteps(prevSteps => 
            prevSteps.map(step => ({
              ...step,
              completed: data.completedSteps?.includes(step.id) || false
            }))
          );
          setCurrentStep(data.currentStep || steps[0].id);
          
          // Automatically open onboarding if not completed and user is logged in
          if (data.currentStep && !data.isCompleted) {
            setIsOpen(true);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch onboarding data", error);
    }
  };

  const openOnboarding = () => {
    const firstIncompleteStep = steps.find(step => !step.completed);
    if (firstIncompleteStep) {
      setCurrentStep(firstIncompleteStep.id);
      setIsOpen(true);
    }
  };

  const closeOnboarding = () => {
    setIsOpen(false);
  };

  const completeStep = async (stepId: string) => {
    if (!user) return;

    try {
      const response = await apiRequest("POST", `/api/onboarding/complete-step`, { step: stepId });
      if (response.ok) {
        // Update local state
        setSteps(prevSteps => 
          prevSteps.map(step => ({
            ...step,
            completed: step.id === stepId ? true : step.completed
          }))
        );

        // Move to next step or close if last step
        const currentIndex = steps.findIndex(step => step.id === stepId);
        if (currentIndex < steps.length - 1) {
          setCurrentStep(steps[currentIndex + 1].id);
        } else {
          // If last step, close the modal
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to complete onboarding step", error);
    }
  };

  const skipStep = (stepId: string) => {
    // Just move to the next step without marking as completed
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    } else {
      setIsOpen(false);
    }
  };

  const completeAllSteps = async () => {
    if (!user) return;

    try {
      const response = await apiRequest("POST", `/api/onboarding/complete`);
      if (response.ok) {
        // Mark all steps as completed
        setSteps(prevSteps => 
          prevSteps.map(step => ({
            ...step,
            completed: true
          }))
        );
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to complete all onboarding steps", error);
    }
  };

  const isStepCompleted = (stepId: string) => {
    return steps.find(step => step.id === stepId)?.completed || false;
  };

  return (
    <OnboardingContext.Provider 
      value={{
        isOpen,
        currentStep,
        steps,
        openOnboarding,
        closeOnboarding,
        completeStep,
        skipStep,
        completeAllSteps,
        isStepCompleted
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};