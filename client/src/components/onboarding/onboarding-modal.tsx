import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/onboarding-provider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

// Stub component - will be implemented fully in the future
export default function OnboardingModal() {
  const { isOpen, closeOnboarding, currentStep, completeStep, skipStep, steps } = useOnboarding();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (steps && steps.length > 0) {
      const currentIndex = steps.findIndex(step => step.id === currentStep);
      const percentage = ((currentIndex + 1) / steps.length) * 100;
      setProgress(percentage);
    }
  }, [currentStep, steps]);

  const currentStepData = steps?.find(step => step.id === currentStep);
  
  if (!isOpen || !currentStepData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeOnboarding}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentStepData.title}</DialogTitle>
          <DialogDescription>
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Progress bar */}
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Étape {steps.findIndex(step => step.id === currentStep) + 1} sur {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          
          {/* Content placeholder */}
          <div className="min-h-[120px] flex items-center justify-center rounded-md border border-dashed p-8 text-center animate-pulse">
            <p className="text-sm text-muted-foreground">
              Contenu de l'étape d'onboarding à implémenter
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipStep(currentStep)}
          >
            Ignorer
          </Button>
          
          <div className="flex space-x-2">
            {steps.findIndex(step => step.id === currentStep) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = steps.findIndex(step => step.id === currentStep);
                  if (currentIndex > 0) {
                    completeStep(steps[currentIndex - 1].id);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={() => completeStep(currentStep)}
              className={cn(
                "bg-accent hover:bg-accent/90 text-white"
              )}
            >
              {steps.findIndex(step => step.id === currentStep) === steps.length - 1 ? (
                <>
                  Terminer
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}