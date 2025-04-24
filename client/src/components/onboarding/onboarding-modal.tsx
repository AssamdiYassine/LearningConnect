import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  ChevronRight,
  X,
  UserCircle,
  CreditCard,
  BookOpen,
  Calendar,
  LayoutDashboard,
} from 'lucide-react';

// Step components
import ProfileStep from './steps/profile-step';
import SubscriptionStep from './steps/subscription-step';
import CoursesStep from './steps/courses-step';
import SessionsStep from './steps/sessions-step';
import TourStep from './steps/tour-step';

const stepComponents: Record<string, React.FC<{ onNext: () => void }>> = {
  profile_completion: ProfileStep,
  subscription_selection: SubscriptionStep,
  course_exploration: CoursesStep,
  session_booking: SessionsStep,
  platform_tour: TourStep,
};

const stepIcons: Record<string, React.ReactNode> = {
  profile_completion: <UserCircle className="h-5 w-5" />,
  subscription_selection: <CreditCard className="h-5 w-5" />,
  course_exploration: <BookOpen className="h-5 w-5" />,
  session_booking: <Calendar className="h-5 w-5" />,
  platform_tour: <LayoutDashboard className="h-5 w-5" />,
};

const stepTitles: Record<string, string> = {
  profile_completion: "Complete Your Profile",
  subscription_selection: "Choose a Subscription Plan",
  course_exploration: "Explore Available Courses",
  session_booking: "Book Your First Session",
  platform_tour: "Platform Tour",
};

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { 
    onboarding, 
    isLoading, 
    startOnboarding, 
    updateStep, 
    completeStep, 
    completeOnboarding,
    isStepCompleted,
    getNextStep,
  } = useOnboarding();

  // Decide if we should show the onboarding modal
  useEffect(() => {
    if (user && onboarding && !onboarding.isCompleted) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user, onboarding]);

  // Handle the case when there's no onboarding record yet
  useEffect(() => {
    if (user && !isLoading && !onboarding) {
      startOnboarding();
    }
  }, [user, isLoading, onboarding, startOnboarding]);

  if (isLoading || !onboarding || !user) {
    return null;
  }

  const currentStep = onboarding.currentStep;
  const StepComponent = stepComponents[currentStep];

  const handleNextStep = () => {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      // Mark current step as completed and move to next
      completeStep(currentStep);
      updateStep(nextStep);
    } else {
      // Complete the entire onboarding process
      completeOnboarding();
      setOpen(false);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Getting Started with TechFormation
          </DialogTitle>
          <DialogDescription>
            Complete these steps to get the most out of your training experience.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicators */}
        <div className="flex space-x-2 justify-center pt-4">
          {Object.keys(stepComponents).map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                currentStep === step
                  ? 'text-primary font-bold'
                  : isStepCompleted(step)
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              }`}
            >
              <div className="flex items-center">
                {stepIcons[step]}
                {isStepCompleted(step) && (
                  <CheckCircle className="h-3 w-3 absolute text-green-500 ml-3 mt-3" />
                )}
              </div>
              <ChevronRight
                className={`h-4 w-4 mx-1 ${
                  Object.keys(stepComponents).indexOf(step) ===
                  Object.keys(stepComponents).length - 1
                    ? 'hidden'
                    : ''
                }`}
              />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <h3 className="text-xl font-semibold mb-4">
            {stepTitles[currentStep]}
          </h3>
          
          {/* Render the current step component */}
          {StepComponent && <StepComponent onNext={handleNextStep} />}
        </div>

        <DialogFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleSkip}>
            Skip Onboarding
          </Button>
          <Button onClick={handleNextStep}>
            {getNextStep(currentStep) ? 'Next Step' : 'Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingModal;