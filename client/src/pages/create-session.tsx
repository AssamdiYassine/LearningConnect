import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Course, insertSessionSchema } from "@shared/schema";

// Create extended schema with additional validation
const createSessionSchema = insertSessionSchema.extend({
  date: z.date({
    required_error: "Please select a date and time",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  zoomLink: z.string()
    .url("Please enter a valid URL")
    .startsWith("https://", "URL must start with https://")
    .refine(
      (val) => val.includes("zoom"), 
      { message: "Must be a Zoom link" }
    ),
});

// Create the form type from the schema
type CreateSessionFormValues = z.infer<typeof createSessionSchema>;

export default function CreateSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Extract courseId from URL if present
  const params = new URLSearchParams(location.split('?')[1] || '');
  const courseIdParam = params.get('courseId');

  // Get trainer's courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/trainer", user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return fetch(`/api/courses/trainer/${user.id}`).then(res => res.json());
    },
    enabled: !!user?.id && user?.role === "trainer",
  });

  // Create form with validation
  const form = useForm<CreateSessionFormValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      courseId: courseIdParam ? parseInt(courseIdParam) : undefined,
      date: undefined,
      time: "",
      zoomLink: "",
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: CreateSessionFormValues) => {
      // Combine date and time
      const sessionDate = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      sessionDate.setHours(hours, minutes);
      
      // Prepare the data for API
      const sessionData = {
        courseId: data.courseId,
        date: sessionDate.toISOString(),
        zoomLink: data.zoomLink,
      };
      
      const res = await apiRequest("POST", "/api/sessions", sessionData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Session created",
        description: "Your session has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation("/trainer");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submit handler
  const onSubmit = (data: CreateSessionFormValues) => {
    createSessionMutation.mutate(data);
  };

  // Access control - only trainers can access this page
  if (!user || user.role !== "trainer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You must be a trainer to schedule sessions.</p>
        <Button onClick={() => setLocation("/")}>Return to Homepage</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Schedule a New Session</h1>
        <p className="mt-2 text-gray-600">
          Create a new live training session for one of your courses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Provide the details for your live training session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isCoursesLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the course for this session
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when the session will take place
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        The time when the session will start (24-hour format)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="zoomLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zoom Meeting Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://zoom.us/j/example" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide the Zoom meeting link for the session
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Session"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}