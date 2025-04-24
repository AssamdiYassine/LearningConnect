import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, BookOpen, CalendarDays, DollarSign, Settings, CreditCard, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  
  // API settings states
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [zoomApiKey, setZoomApiKey] = useState("");
  const [zoomApiSecret, setZoomApiSecret] = useState("");
  const [isApiSaving, setIsApiSaving] = useState(false);

  // Fetch all users
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin"
  });

  // Fetch courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Fetch sessions
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["/api/sessions"],
  });

  // Fetch API settings
  const { data: apiSettings } = useQuery({
    queryKey: ["/api/settings/api"],
    enabled: !!user && user.role === "admin",
  });

  // Effect to update API settings from fetched data
  useEffect(() => {
    if (apiSettings) {
      setStripePublicKey(apiSettings.stripePublicKey || "");
      setStripeSecretKey(apiSettings.stripeSecretKey || "");
      setZoomApiKey(apiSettings.zoomApiKey || "");
      setZoomApiSecret(apiSettings.zoomApiSecret || "");
    }
  }, [apiSettings]);

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to save API settings
  const saveApiSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const res = await apiRequest("POST", "/api/settings/api", settings);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "API settings saved",
        description: "Your API settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api"] });
      setIsApiSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save API settings",
        description: error.message,
        variant: "destructive",
      });
      setIsApiSaving(false);
    },
  });

  // Filter users by role
  const students = users?.filter(user => user.role === "student") || [];
  const trainers = users?.filter(user => user.role === "trainer") || [];
  const admins = users?.filter(user => user.role === "admin") || [];

  // Stats
  const totalUsers = users?.length || 0;
  const totalCourses = courses?.length || 0;
  const totalSessions = sessions?.length || 0;
  const activeSubscriptions = users?.filter(user => user.isSubscribed).length || 0;

  const handleRoleChange = (userId: number, role: string) => {
    updateRoleMutation.mutate({ id: userId, role });
  };
  
  const handleApiSettingsSave = () => {
    setIsApiSaving(true);
    saveApiSettingsMutation.mutate({
      stripePublicKey,
      stripeSecretKey,
      zoomApiKey,
      zoomApiSecret
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading">
          Admin Dashboard
        </h2>
        <p className="mt-1 text-gray-500">
          Manage platform users, courses, and settings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 p-3 rounded-md">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {totalUsers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-md">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Courses
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {totalCourses}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
                <CalendarDays className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Scheduled Sessions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {totalSessions}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-md">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Subscriptions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {activeSubscriptions}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="api-settings">API Settings</TabsTrigger>
        </TabsList>
        
        {/* API Settings Tab Content */}
        <TabsContent value="api-settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Stripe Payment Integration</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="stripePublicKey" className="text-sm font-medium text-gray-700">
                      Stripe Public Key (pk_*)
                    </label>
                    <Input
                      id="stripePublicKey"
                      value={stripePublicKey}
                      onChange={(e) => setStripePublicKey(e.target.value)}
                      placeholder="pk_test_..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      The publishable key is used for client-side Stripe Elements integration.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="stripeSecretKey" className="text-sm font-medium text-gray-700">
                      Stripe Secret Key (sk_*)
                    </label>
                    <Input
                      id="stripeSecretKey"
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      placeholder="sk_test_..."
                      className="w-full"
                      type="password"
                    />
                    <p className="text-xs text-gray-500">
                      The secret key is used for server-side payment processing (never exposed to clients).
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Zoom Integration</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="zoomApiKey" className="text-sm font-medium text-gray-700">
                      Zoom API Key
                    </label>
                    <Input
                      id="zoomApiKey"
                      value={zoomApiKey}
                      onChange={(e) => setZoomApiKey(e.target.value)}
                      placeholder="Zoom API Key"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="zoomApiSecret" className="text-sm font-medium text-gray-700">
                      Zoom API Secret
                    </label>
                    <Input
                      id="zoomApiSecret"
                      value={zoomApiSecret}
                      onChange={(e) => setZoomApiSecret(e.target.value)}
                      placeholder="Zoom API Secret"
                      className="w-full"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 pt-6">
              <Button onClick={handleApiSettingsSave} disabled={isApiSaving}>
                {isApiSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save API Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      
        {/* Users Tab Content */}
        <TabsContent value="users">
          <Tabs defaultValue="all-users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all-users">All Users ({totalUsers})</TabsTrigger>
              <TabsTrigger value="students">Students ({students?.length || 0})</TabsTrigger>
              <TabsTrigger value="trainers">Trainers ({trainers?.length || 0})</TabsTrigger>
            </TabsList>
        
            <TabsContent value="all-users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Select 
                                defaultValue={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                                disabled={updateRoleMutation.isPending}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="trainer">Trainer</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {user.isSubscribed ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {user.subscriptionType}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  None
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.isSubscribed ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {user.subscriptionType}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  None
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Enrollments</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trainers">
              <Card>
                <CardHeader>
                  <CardTitle>Trainers</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Courses</TableHead>
                          <TableHead>Sessions</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainers.map((trainer: any) => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.displayName}</TableCell>
                            <TableCell>{trainer.email}</TableCell>
                            <TableCell>
                              {courses?.filter((course: any) => course.trainerId === trainer.id).length || 0}
                            </TableCell>
                            <TableCell>
                              {courses?.filter((course: any) => course.trainerId === trainer.id)
                                .reduce((count: number, course: any) => {
                                  return count + (sessions?.filter((session: any) => session.courseId === course.id).length || 0);
                                }, 0) || 0}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Courses</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Courses Tab Content */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Courses Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses?.map((course: any) => (
                    <Card key={course.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm text-gray-500">
                          <div>Level: {course.level}</div>
                          <div>Trainer: {users?.find((u: any) => u.id === course.trainerId)?.displayName || "Unknown"}</div>
                          <div>Sessions: {sessions?.filter((s: any) => s.courseId === course.id).length || 0}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {(!courses || courses.length === 0) && (
                    <div className="col-span-3 py-10 text-center">
                      <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                      <p className="mt-1 text-gray-500 max-w-md mx-auto">
                        When trainers create courses, they'll appear here for management.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sessions Tab Content */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Zoom Link</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions?.map((session: any) => {
                      const course = courses?.find((c: any) => c.id === session.courseId);
                      const trainer = users?.find((u: any) => u.id === course?.trainerId);
                      const sessionDate = new Date(session.date);
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {course?.title || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {sessionDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </TableCell>
                          <TableCell>
                            {trainer?.displayName || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {session.enrollmentCount || 0}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Video className="h-4 w-4 mr-1" /> View
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {(!sessions || sessions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <CalendarDays className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900">No sessions scheduled</h3>
                          <p className="mt-1 text-gray-500">
                            When trainers schedule sessions, they'll appear here for management.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

