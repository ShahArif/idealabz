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
import { Lightbulb, Plus, Upload, X, FileText } from "lucide-react";

type IdeaSubmissionData = z.infer<typeof ideaSubmissionSchema>;

interface IdeaSubmissionFormProps {
  onIdeaSubmitted?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const IdeaSubmissionForm = ({ onIdeaSubmitted, onClose, onSuccess }: IdeaSubmissionFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file count
    if (uploadedFiles.length + files.length > 3) {
      toast({
        title: "Too many files",
        description: "Maximum 3 documents allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return false;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Only PDF, JPEG, PNG, and GIF files are allowed.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, ideaId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${ideaId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('idea-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('idea-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

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

      // Insert the idea first
      const { data: ideaData, error: ideaError } = await supabase.from("ideas").insert({
        title: data.title,
        description: data.description,
        problem_statement: data.problem_statement,
        target_audience: data.target_audience,
        prd_url: data.prd_url || null,
        tags: data.tags || [],
        category: data.category,
        submitted_by: user.id,
        stage: 'discovery',
      }).select().single();

      if (ideaError) {
        console.error("Error submitting idea:", ideaError);
        toast({
          title: "Error",
          description: "Failed to submit idea. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Upload documents if any
      if (uploadedFiles.length > 0) {
        const attachmentPromises = uploadedFiles.map(async (file) => {
          const fileUrl = await uploadFile(file, ideaData.id);
          if (fileUrl) {
            return {
              idea_id: ideaData.id,
              file_name: file.name,
              file_url: fileUrl,
              file_size: file.size,
              file_type: file.type,
              uploaded_by: user.id,
            };
          }
          return null;
        });

        const attachments = (await Promise.all(attachmentPromises)).filter(Boolean);
        
        if (attachments.length > 0) {
          const { error: attachmentError } = await supabase
            .from('attachments')
            .insert(attachments);

          if (attachmentError) {
            console.error("Error saving attachments:", attachmentError);
            // Don't fail the entire submission if attachments fail
          }
        }
      }

      toast({
        title: "Success!",
        description: "Your idea has been submitted successfully.",
      });

      form.reset();
      setUploadedFiles([]);
      setIsOpen(false);
      onIdeaSubmitted?.();
      onClose?.();
      onSuccess?.();
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

            {/* Document Upload Section */}
            <div className="space-y-4">
              <div>
                <FormLabel>Supporting Documents (Optional)</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload up to 3 documents like PRD, product pitch, or other supporting materials.
                  <br />
                  <strong>Supported formats:</strong> PDF, JPEG, PNG, GIF (Max 10MB each)
                </p>
                
                <div className="space-y-3">
                  {/* File Upload Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploadedFiles.length >= 3}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.querySelector('input[type="file"]')?.click()}
                      disabled={uploadedFiles.length >= 3}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>

                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Files ({uploadedFiles.length}/3):</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  form.reset();
                  setUploadedFiles([]);
                }}
              >
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