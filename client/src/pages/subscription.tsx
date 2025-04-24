import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");

  // Format the subscription end date if it exists
  const formatEndDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Redirect to checkout page for subscription
  const [, setLocation] = useLocation();

  const handleSubscribe = () => {
    setLocation(`/checkout?type=${selectedPlan}`);
  };

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/subscription");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCancel = () => {
    cancelSubscriptionMutation.mutate();
  };

  // Check if user has an active subscription
  const isSubscribed = user?.isSubscribed;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">My Subscription</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription plan and payments
        </p>
      </div>

      {/* Current Subscription Status */}
      {isSubscribed && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 capitalize">{user?.subscriptionType} Plan</h3>
                  <p className="text-gray-500">Valid until: {formatEndDate(user?.subscriptionEndDate)}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Plan Benefits</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Unlimited access to all courses</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Exclusive content</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Billing Information</h4>
                  <p className="text-gray-700">
                    Your {user?.subscriptionType} subscription will automatically renew on {formatEndDate(user?.subscriptionEndDate)}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-200 pt-6">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleCancel}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Subscription Plans */}
      {!isSubscribed && (
        <Tabs defaultValue={selectedPlan} onValueChange={(value) => setSelectedPlan(value as "monthly" | "annual")}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Subscription</CardTitle>
                <CardDescription>Pay monthly, cancel anytime</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">$29</span>
                    <span className="text-gray-500 ml-1">/ month</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Unlimited access to all courses</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Exclusive content</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Cancel anytime</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="annual">
            <Card>
              <CardHeader>
                <CardTitle>Annual Subscription</CardTitle>
                <CardDescription>Pay annually and save 20%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">$279</span>
                    <span className="text-gray-500 ml-1">/ year</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">Save $69</Badge>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>All monthly plan benefits</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>20% discount compared to monthly plan</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Priority access to new courses</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>30-day money-back guarantee</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-6">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. If you cancel, you'll still have access until the end of your billing period.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">What's included in my subscription?</h3>
              <p className="text-gray-600">
                Your subscription gives you access to all our live training sessions, ability to interact with trainers, and access to exclusive resources.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I access the live sessions?</h3>
              <p className="text-gray-600">
                After enrolling in a course, you'll be able to access the Zoom link for the session. We'll also send you an email reminder before the session starts.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for annual subscriptions. Monthly subscriptions can be cancelled at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
