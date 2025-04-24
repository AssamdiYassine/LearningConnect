import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  CreditCard, 
  HelpCircle, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  User, 
  Bell,
  CheckCheck
} from 'lucide-react';

interface TourStepProps {
  onNext: () => void;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  badge?: string;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  path, 
  roles,
  badge
}: FeatureCardProps) => {
  const { user } = useAuth();
  const isAvailable = !roles.length || (user && roles.includes(user.role));
  
  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${!isAvailable ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-lg font-medium">
            {icon}
            <span>{title}</span>
          </div>
          {badge && <Badge variant="outline">{badge}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {isAvailable ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" /> Available
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> {user?.role === 'student' ? 'Trainer/Admin only' : 'Student only'}
              </span>
            )}
          </div>
          <Button size="sm" variant="ghost" className="text-xs" disabled={!isAvailable}>
            Explore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TourStep = ({ onNext }: TourStepProps) => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  
  const features: FeatureCardProps[] = [
    {
      title: 'Dashboard',
      description: 'Your personalized overview with upcoming sessions, courses, and performance metrics.',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/',
      roles: ['student', 'trainer', 'admin'],
    },
    {
      title: 'Course Catalog',
      description: 'Browse and filter through our extensive list of IT training courses.',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/catalog',
      roles: ['student', 'trainer', 'admin'],
    },
    {
      title: 'Session Calendar',
      description: 'View and book upcoming live training sessions with our expert trainers.',
      icon: <Calendar className="h-5 w-5" />,
      path: '/schedule',
      roles: ['student', 'trainer', 'admin'],
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information, preferences, and notification settings.',
      icon: <User className="h-5 w-5" />,
      path: '/profile',
      roles: ['student', 'trainer', 'admin'],
    },
    {
      title: 'Subscription Management',
      description: 'Manage your subscription plan, billing information, and payment history.',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/subscription',
      roles: ['student'],
      badge: role === 'student' ? 'Important' : undefined,
    },
    {
      title: 'Trainer Dashboard',
      description: 'Manage your courses, sessions, and student enrollments in one place.',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/trainer-dashboard',
      roles: ['trainer'],
      badge: role === 'trainer' ? 'Important' : undefined,
    },
    {
      title: 'Admin Controls',
      description: 'Comprehensive platform management tools for administrators.',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin-dashboard',
      roles: ['admin'],
      badge: role === 'admin' ? 'Important' : undefined,
    },
    {
      title: 'Notifications',
      description: 'Stay updated with session reminders, course changes, and platform announcements.',
      icon: <Bell className="h-5 w-5" />,
      path: '/notifications',
      roles: ['student', 'trainer', 'admin'],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Platform Navigation
          </CardTitle>
          <CardDescription>
            Discover the key features of the TechFormation platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.filter(f => !f.roles.length || f.roles.includes(role)).map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CheckCheck className="h-5 w-5" />
            You're All Set!
          </CardTitle>
          <CardDescription>
            Congratulations on completing the onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You now have all the knowledge you need to start using the TechFormation platform.
            Remember that you can always access help and support through the platform if you have any questions.
          </p>
          
          <div className="flex justify-end">
            <Button onClick={onNext}>
              Complete Onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourStep;