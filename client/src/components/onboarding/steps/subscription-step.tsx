import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, MoveRight } from 'lucide-react';

interface SubscriptionStepProps {
  onNext: () => void;
}

const SubscriptionStep = ({ onNext }: SubscriptionStepProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <RadioGroup 
          defaultValue="monthly" 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onValueChange={setSelectedPlan}
        >
          <div className="relative">
            <RadioGroupItem
              value="monthly"
              id="monthly"
              className="sr-only"
            />
            <Label
              htmlFor="monthly"
              className="cursor-pointer"
            >
              <Card className={`h-full ${selectedPlan === 'monthly' ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>Monthly Subscription</CardTitle>
                  <CardDescription>Perfect for short-term learning needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold">€49<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Access to all basic courses</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Up to 5 live training sessions per month</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Access to course materials</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Monthly billing
                  </Badge>
                </CardFooter>
              </Card>
            </Label>
            {selectedPlan === 'monthly' && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>

          <div className="relative">
            <RadioGroupItem
              value="annual"
              id="annual"
              className="sr-only"
            />
            <Label
              htmlFor="annual"
              className="cursor-pointer"
            >
              <Card className={`h-full ${selectedPlan === 'annual' ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>Annual Subscription</CardTitle>
                  <CardDescription>Best value for committed learners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold">€499<span className="text-sm font-normal text-muted-foreground">/year</span></div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Save €89</Badge>
                  <ul className="space-y-2 text-sm mt-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Access to all courses (including premium)</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Unlimited live training sessions</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Certificate of completion</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Priority booking for popular sessions</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Annual billing (save 15%)
                  </Badge>
                </CardFooter>
              </Card>
            </Label>
            {selectedPlan === 'annual' && (
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
        </RadioGroup>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Your subscription will begin after providing payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You'll be directed to our secure payment page to enter your payment details.
              For demonstration purposes, you can continue without providing actual payment information.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onNext}>
          Skip for now
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          <span>Continue</span>
          <MoveRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionStep;