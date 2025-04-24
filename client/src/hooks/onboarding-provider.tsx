import React, { createContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserOnboarding } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OnboardingContextType {
  onboarding: UserOnboarding | null;
  isLoading: boolean;
  error: Error | null;
  startOnboarding: () => void;
  updateStep: (step: string) => void;
  completeStep: (step: string) => void;
  completeOnboarding: () => void;
  isStepCompleted: (step: string) => boolean;
  getNextStep: (currentStep: string) => string | null;
  isStarting: boolean;
  isUpdatingStep: boolean;
  isCompletingStep: boolean;
  isCompletingOnboarding: boolean;
}

export const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Get the current user's onboarding status
  const {
    data: onboarding,
    isLoading,
    error,
  } = useQuery<UserOnboarding | null>({
    queryKey: ['/api/onboarding'],
    retry: false,
  });

  // Start the onboarding process
  const startOnboardingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/onboarding/start');
      return await res.json();
    },
    onSuccess: (data: UserOnboarding) => {
      queryClient.setQueryData(['/api/onboarding'], data);
      toast({
        title: 'Onboarding started',
        description: 'Welcome to your personalized onboarding experience!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to start onboarding',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update the current onboarding step
  const updateStepMutation = useMutation({
    mutationFn: async (step: string) => {
      const res = await apiRequest('POST', '/api/onboarding/step', { step });
      return await res.json();
    },
    onSuccess: (data: UserOnboarding) => {
      queryClient.setQueryData(['/api/onboarding'], data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update onboarding step',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark a step as completed
  const completeStepMutation = useMutation({
    mutationFn: async (step: string) => {
      const res = await apiRequest('POST', '/api/onboarding/complete-step', { step });
      return await res.json();
    },
    onSuccess: (data: UserOnboarding) => {
      queryClient.setQueryData(['/api/onboarding'], data);
      toast({
        title: 'Step completed',
        description: 'Great progress! Keep going with your onboarding.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to complete step',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Complete the entire onboarding process
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/onboarding/complete');
      return await res.json();
    },
    onSuccess: (data: UserOnboarding) => {
      queryClient.setQueryData(['/api/onboarding'], data);
      toast({
        title: 'Onboarding completed',
        description: 'Congratulations on completing your onboarding!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to complete onboarding',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Check if a specific step is completed
  const isStepCompleted = (step: string): boolean => {
    if (!onboarding) return false;
    return onboarding.completedSteps.includes(step);
  };

  // Get the next step in the onboarding flow
  const getNextStep = (currentStep: string): string | null => {
    // Define the onboarding flow sequence
    const steps = [
      'profile_completion',
      'subscription_selection',
      'course_exploration',
      'session_booking',
      'platform_tour'
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null;
    }
    
    return steps[currentIndex + 1];
  };

  const contextValue: OnboardingContextType = {
    onboarding: onboarding || null,
    isLoading,
    error: error || null,
    startOnboarding: () => startOnboardingMutation.mutate(),
    updateStep: (step: string) => updateStepMutation.mutate(step),
    completeStep: (step: string) => completeStepMutation.mutate(step),
    completeOnboarding: () => completeOnboardingMutation.mutate(),
    isStepCompleted,
    getNextStep,
    isStarting: startOnboardingMutation.isPending,
    isUpdatingStep: updateStepMutation.isPending,
    isCompletingStep: completeStepMutation.isPending,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const context = React.useContext(OnboardingContext);
  if (context === null) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}