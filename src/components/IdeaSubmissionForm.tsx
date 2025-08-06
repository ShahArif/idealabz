import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ideaSubmissionSchema } from "@/lib/validations";
import { Lightbulb, Plus } from "lucide-react";

type IdeaSubmissionData = z.infer<typeof ideaSubmissionSchema>;

interface IdeaSubmissionFormProps {
  onIdeaSubmitted?: () => void;
}

export const IdeaSubmissionForm = ({ onIdeaSubmitted }: IdeaSubmissionFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<IdeaSubmissionData>({
    resolver: zodResolver(ideaSubmissionSchema),
    defaultValues: {
      title: "",
      description: "",
      problem_statement: "",
      target_audience: "",
      prd_url: "",
      tags: [],
      category: undefined,
    },
  });

  const onSubmit = async (data: IdeaSubmissionData) => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit an idea.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("ideas").insert({
        title: data.title,
        description: data.description,
        problem_statement: data.problem_statement,
        target_audience: data.target_audience,
        prd_url: data.prd_url || null,
        tags: data.tags || [],
        category: data.category,
        submitted_by: user.id,
        stage: 'discovery',
      });

      if (error) {
        console.error("Error submitting idea:", error);
        toast({
          title: "Error",
          description: "Failed to submit idea. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Your idea has been submitted successfully.",
      });

      form.reset();
      setIsOpen(false);
      onIdeaSubmitted?.();
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast({
        title: "Error",
        description: "Failed to submit idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Submit an Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Submit a New Idea
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the idea name?</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a catchy name for your idea" {...field} />
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
                  <FormLabel>Describe your idea in brief</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a brief overview of your idea..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problem_statement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What problem does it solve?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the problem your idea addresses..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who will use it?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe who would benefit from this idea..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prd_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PRD URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Idea"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};