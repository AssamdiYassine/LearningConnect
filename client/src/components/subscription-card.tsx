import { User } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionCardProps {
  user: User | null;
}

export default function SubscriptionCard({ user }: SubscriptionCardProps) {
  if (!user) return null;

  // Format the subscription end date if it exists
  const formatEndDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if subscription is active
  const isSubscribed = user.isSubscribed;
  
  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = () => {
    if (!user.subscriptionEndDate) return false;
    const endDate = new Date(user.subscriptionEndDate);
    const now = new Date();
    const differenceInDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return differenceInDays <= 7 && differenceInDays > 0;
  };

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-gray-200">
        <CardTitle>My Subscription</CardTitle>
      </CardHeader>
      
      {isSubscribed ? (
        <>
          <CardContent className="p-0">
            <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold capitalize">
                  {user.subscriptionType}
                </span>
                <Badge className="bg-white text-primary-600 hover:bg-white">
                  Active
                </Badge>
              </div>
              
              <div className="mt-2 text-primary-50">
                {isExpiringSoon() ? (
                  <span className="font-medium text-yellow-200">
                    Expiring soon: {formatEndDate(user.subscriptionEndDate)}
                  </span>
                ) : (
                  <span>
                    End date: {formatEndDate(user.subscriptionEndDate)}
                  </span>
                )}
              </div>
              
              <div className="mt-4 space-y-1">
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  <span>Unlimited access to all courses</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  <span>Exclusive content</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 flex justify-center">
            <Link href="/subscription">
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent className="p-6">
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No active subscription</h3>
              <p className="mt-1 text-sm text-gray-500">
                Subscribe to get access to all our live training sessions.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 flex justify-center">
            <Link href="/subscription">
              <Button className="w-full">
                Subscribe Now
              </Button>
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
