import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle } from 'lucide-react';

interface ProfileStepProps {
  onNext: () => void;
}

const ProfileStep = ({ onNext }: ProfileStepProps) => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Your Profile Information
          </CardTitle>
          <CardDescription>
            This is how you'll appear in the platform to trainers and other students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" defaultValue={user?.displayName} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue={user?.username} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user?.email} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <div className="bg-muted p-2 rounded-md flex items-center gap-2">
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your profile information is used throughout the platform. 
          All profile data can be edited later from your account settings page.
        </p>
        
        <div className="flex justify-end">
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;