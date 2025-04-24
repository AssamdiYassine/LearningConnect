import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Create form schema based on the course schema
const courseFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  categoryId: z.string().min(1, "Please select a category"),
  duration: z.string().min(1, "Duration is required").transform(val => parseInt(val, 10)),
  maxStudents: z.string().min(1, "Max students is required").transform(val => parseInt(val, 10)),
});

interface CreateCourseFormProps {
  onSuccess?: () => void;
}

export default function CreateCourseForm({ onSuccess }: CreateCourseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);

  // Session form schema
  const sessionFormSchema = z.object({
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    zoomLink: z.string().url("Please enter a valid Zoom link"),
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create course form
  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "beginner",
      categoryId: "",
      duration: "60",
      maxStudents: "20",
    },
  });

  // Create session form
  const sessionForm = useForm<z.infer<typeof sessionFormSchema>>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      date: "",
      time: "",
      zoomLink: "",
    },
  });

  // Course creation mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: z.infer<typeof courseFormSchema>) => {
      const res = await apiRequest("POST", "/api/courses", courseData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Course created",
        description: "Your course has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCourseId(data.id);
      setShowSessionForm(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Session creation mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const res = await apiRequest("POST", "/api/sessions", sessionData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Session scheduled",
        description: "Your course session has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/trainer", user?.id] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle course form submission
  function onSubmitCourse(data: z.infer<typeof courseFormSchema>) {
    createCourseMutation.mutate({
      ...data,
      categoryId: parseInt(data.categoryId, 10),
    });
  }

  // Handle session form submission
  function onSubmitSession(data: z.infer<typeof sessionFormSchema>) {
    if (!courseId) return;

    // Combine date and time
    const dateTime = new Date(`${data.date}T${data.time}`);
    
    createSessionMutation.mutate({
      courseId,
      date: dateTime.toISOString(),
      zoomLink: data.zoomLink,
    });
  }

  if (showSessionForm) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Schedule a Session</h3>
          <p className="text-sm text-gray-500 mt-1">
            Set a date and time for your course session and provide the Zoom link.
          </p>
        </div>
        
        <Form {...sessionForm}>
          <form onSubmit={sessionForm.handleSubmit(onSubmitSession)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={sessionForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={sessionForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={sessionForm.control}
              name="zoomLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zoom Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://zoom.us/j/123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="submit" 
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Create a New Course</h3>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details to create a new course. You'll be able to schedule sessions after creating the course.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitCourse)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. JavaScript Modern (ES6+)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide a detailed description of what students will learn"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="30" step="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maxStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Number of Students</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={createCourseMutation.isPending}
            >
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
