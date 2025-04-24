import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/onboarding-provider';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface OnboardingTriggerProps {
  variant?: 'button' | 'card' | 'inline';
  className?: string;
}

const OnboardingTrigger = ({ 
  variant = 'button',
  className = ''
}: OnboardingTriggerProps) => {
  const { onboarding, startOnboarding, isLoading } = useOnboarding();
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    // Check if we should show the trigger (user has no onboarding or it was completed more than 30 days ago)
    if (onboarding) {
      if (onboarding.isCompleted) {
        const completionDate = new Date(onboarding.completedAt || new Date());
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        setIsNew(completionDate < thirtyDaysAgo);
      } else {
        setIsNew(true);
      }
    }
  }, [onboarding]);

  if (isLoading || !isNew) {
    return null;
  }

  const handleStartOnboarding = () => {
    startOnboarding();
  };

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Need Help Getting Started?</CardTitle>
          <CardDescription>
            Take a quick tour of the platform features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Our interactive onboarding guide will walk you through all the
            essential features of the training platform.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartOnboarding} className="w-full">
            <HelpCircle className="mr-2 h-4 w-4" />
            Start Platform Tour
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <p className="text-sm font-medium">New to the platform?</p>
        <Button 
          variant="link" 
          size="sm" 
          className="p-0 h-auto" 
          onClick={handleStartOnboarding}
        >
          Take the tour
        </Button>
      </div>
    );
  }

  // Default button variant
  return (
    <Button 
      onClick={handleStartOnboarding} 
      variant="secondary"
      size="sm"
      className={className}
    >
      <HelpCircle className="mr-2 h-4 w-4" />
      Platform Tour
    </Button>
  );
};

export default OnboardingTrigger;