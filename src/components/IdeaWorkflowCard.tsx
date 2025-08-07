import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Lightbulb, 
  Search, 
  Settings, 
  Presentation, 
  Rocket,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Idea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience: string;
  stage: 'discovery' | 'basic_validation' | 'tech_validation' | 'leadership_pitch' | 'mvp' | 'rejected';
  created_at: string;
  category: string;
  tags: string[];
  submitted_by: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email?: string;
  user_role?: string;
}

interface StatusUpdate {
  id: string;
  action: string;
  comment: string | null;
  created_at: string;
  previous_stage: string;
  new_stage: string;
  updated_by: string;
  updated_by_email?: string;
  updated_by_role?: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  uploaded_by_email?: string;
  uploaded_by_role?: string;
}

interface IdeaWorkflowCardProps {
  idea: Idea;
  onUpdate?: () => void;
}

const stageConfig = {
  discovery: {
    label: 'Discovery',
    icon: Lightbulb,
    color: 'bg-blue-500',
    description: 'Initial idea exploration and research'
  },
  basic_validation: {
    label: 'Basic Validation',
    icon: Search,
    color: 'bg-yellow-500',
    description: 'Market research and basic feasibility'
  },
  tech_validation: {
    label: 'Tech Validation',
    icon: Settings,
    color: 'bg-orange-500',
    description: 'Technical feasibility and architecture review'
  },
  leadership_pitch: {
    label: 'Leadership Pitch',
    icon: Presentation,
    color: 'bg-purple-500',
    description: 'Presenting to leadership for approval'
  },
  mvp: {
    label: 'MVP',
    icon: Rocket,
    color: 'bg-green-500',
    description: 'Minimum viable product development'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-500',
    description: 'Idea has been rejected'
  }
};

export const IdeaWorkflowCard = ({ idea, onUpdate }: IdeaWorkflowCardProps) => {
  const { canManageStage } = useUserRole();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const config = stageConfig[idea.stage];
  const IconComponent = config.icon;

  // Fetch idea details (comments and status updates)
  const fetchIdeaDetails = async () => {
    setLoadingDetails(true);
    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      } else {
        // Fetch user details for comments
        const commentsWithUsers = await Promise.all(
          (commentsData || []).map(async (comment) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email, role')
              .eq('id', comment.user_id)
              .single();
            
            return {
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              user_id: comment.user_id,
              user_email: (userData as any)?.email || 'Unknown',
              user_role: (userData as any)?.role || 'Unknown'
            };
          })
        );
        setComments(commentsWithUsers);
      }

      // Fetch status updates
      const { data: statusData, error: statusError } = await supabase
        .from('status_updates')
        .select('id, action, comment, created_at, previous_stage, new_stage, updated_by')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false });

      if (statusError) {
        console.error('Error fetching status updates:', statusError);
      } else {
        // Fetch user details for status updates
        const statusWithUsers = await Promise.all(
          (statusData || []).map(async (status) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email, role')
              .eq('id', status.updated_by)
              .single();
            
            return {
              id: status.id,
              action: status.action,
              comment: status.comment,
              created_at: status.created_at,
              previous_stage: status.previous_stage,
              new_stage: status.new_stage,
              updated_by: status.updated_by,
              updated_by_email: (userData as any)?.email || 'Unknown',
              updated_by_role: (userData as any)?.role || 'Unknown'
            };
          })
        );
        setStatusUpdates(statusWithUsers);
      }

      // Fetch attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('attachments')
        .select('id, file_name, file_url, file_size, file_type, uploaded_by, created_at')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false });

      if (attachmentsError) {
        console.error('Error fetching attachments:', attachmentsError);
      } else {
        const attachmentsWithUsers = await Promise.all(
          (attachmentsData || []).map(async (attachment) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email, role')
              .eq('id', attachment.uploaded_by)
              .single();
            
            return {
              id: attachment.id,
              file_name: attachment.file_name,
              file_url: attachment.file_url,
              file_size: attachment.file_size,
              file_type: attachment.file_type,
              uploaded_by: attachment.uploaded_by,
              created_at: attachment.created_at,
              uploaded_by_email: (userData as any)?.email || 'Unknown',
              uploaded_by_role: (userData as any)?.role || 'Unknown'
            };
          })
        );
        setAttachments(attachmentsWithUsers);
      }

    } catch (error) {
      console.error('Error fetching idea details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCardClick = () => {
    setIsDetailDialogOpen(true);
    fetchIdeaDetails();
  };

  const getAvailableActions = () => {
    if (!canManageStage(idea.stage)) return [];

    switch (idea.stage) {
      case 'discovery':
        return [
          { type: 'accept', label: 'Accept for Basic Validation', variant: 'default' as const },
          { type: 'request_more_info', label: 'Need Info', variant: 'outline' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      case 'basic_validation':
        return [
          { type: 'accept', label: 'Accept for Tech Validation', variant: 'default' as const },
          { type: 'request_more_info', label: 'Need Info', variant: 'outline' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      case 'tech_validation':
        return [
          { type: 'accept', label: 'Accept for Leadership Pitch', variant: 'default' as const },
          { type: 'request_more_info', label: 'Need Info', variant: 'outline' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      case 'leadership_pitch':
        return [
          { type: 'approve', label: 'Approve for MVP', variant: 'default' as const },
          { type: 'request_more_info', label: 'Need Info', variant: 'outline' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      default:
        return [];
    }
  };

  const handleAction = async () => {
    if (actionType === 'add_comment') {
      if (!comment.trim()) {
        toast({
          title: "Error",
          description: "Please enter a comment.",
          variant: "destructive"
        });
        return;
      }
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // Insert comment
        await supabase.from('comments').insert({
          idea_id: idea.id,
          content: comment,
          is_internal: true,
          user_id: user?.id
        });

        // Fetch idea details and relevant users
        const { data: ideaDetails } = await supabase
          .from('ideas')
          .select('id, title, submitted_by, stage')
          .eq('id', idea.id)
          .single();
        const { data: productExperts } = await supabase.from('profiles').select('id').eq('role', 'product_expert');
        const { data: techExperts } = await supabase.from('profiles').select('id').eq('role', 'tech_expert');

        // Helper: create notification
        const createNotification = async (userId, type, message) => {
          await supabase.from('notifications').insert({
            user_id: userId,
            idea_id: idea.id,
            type,
            message,
            link: `/ideas/${idea.id}`,
            read: false,
            metadata: { action: 'add_comment', comment }
          });
        };

        // Notify idea owner
        if (ideaDetails?.submitted_by) {
          await createNotification(
            ideaDetails.submitted_by,
            'comment_added',
            `A manager commented on your idea "${idea.title}".`
          );
        }
        // Notify all product experts
        if (productExperts) {
          for (const pe of productExperts) {
            await createNotification(
              pe.id,
              'comment_added',
              `A manager commented on the idea "${idea.title}".`
            );
          }
        }
        // Notify all tech experts
        if (techExperts) {
          for (const te of techExperts) {
            await createNotification(
              te.id,
              'comment_added',
              `A manager commented on the idea "${idea.title}".`
            );
          }
        }

        toast({
          title: "Comment added",
          description: "Your comment has been added and relevant users notified."
        });
        setIsActionDialogOpen(false);
        setComment('');
        setActionType('');
        onUpdate?.();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add comment.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!actionType || !comment.trim()) {
      toast({
        title: "Error",
        description: "Please provide a comment for your action.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔍 Starting action:', actionType, 'for idea:', idea.id, 'current stage:', idea.stage);
      
      // Get current user for debugging
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.id, user?.email);
      
      // Get next stage using the database function
      const { data: nextStageData, error: stageError } = await supabase
        .rpc('get_next_stage', {
          _current_stage: idea.stage,
          _action: actionType
        });

      if (stageError) {
        console.error('❌ Stage error:', stageError);
        throw stageError;
      }

      console.log('📈 Next stage will be:', nextStageData);

      // Update the idea stage
      console.log('🔄 Attempting to update idea stage...');
      const { error: updateError } = await supabase
        .from('ideas')
        .update({ stage: nextStageData })
        .eq('id', idea.id);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Idea stage updated successfully');

      // Add status update record
      const { error: statusError } = await supabase
        .from('status_updates')
        .insert({
          idea_id: idea.id,
          previous_stage: idea.stage,
          new_stage: nextStageData,
          action: actionType,
          comment: comment,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (statusError) {
        throw statusError;
      }

      // Add comment
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          idea_id: idea.id,
          content: comment,
          is_internal: true,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (commentError) {
        throw commentError;
      }

      toast({
        title: "Action completed",
        description: `Idea has been ${actionType}d successfully.`
      });

      setIsActionDialogOpen(false);
      setComment('');
      setActionType('');
      onUpdate?.();

      // Add notification logic after updating idea stage and status
      // 1. Notify ideator when product expert takes action (accept/reject/comment)
      // 2. Notify tech expert when idea moves to Tech Validation
      // 3. Notify ideator and product expert when tech expert takes action
      // 4. When tech expert approves, notify leader and ideator

      // Fetch idea details (for submitted_by)
      const { data: ideaDetails } = await supabase
        .from('ideas')
        .select('id, title, submitted_by, stage')
        .eq('id', idea.id)
        .single();

      // Fetch product expert(s)
      const { data: productExperts } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'product_expert');
      // Fetch tech expert(s)
      const { data: techExperts } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'tech_expert');
      // Fetch leader(s)
      const { data: leaders } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'leader');

      // Helper: create notification
      const createNotification = async (userId, type, message) => {
        await supabase.from('notifications').insert({
          user_id: userId,
          idea_id: idea.id,
          type,
          message,
          link: `/ideas/${idea.id}`,
          read: false,
          metadata: { action: actionType, comment },
        });
      };

      // 1. Product expert action (discovery/basic_validation)
      if (["discovery", "basic_validation"].includes(idea.stage)) {
        // Notify ideator
        if (ideaDetails?.submitted_by) {
          await createNotification(
            ideaDetails.submitted_by,
            'product_expert_action',
            `A product expert has ${actionType}ed your idea "${idea.title}".`
          );
        }
      }

      // 2. If moving to tech_validation, notify tech expert(s)
      if (nextStageData === 'tech_validation' && techExperts) {
        for (const te of techExperts) {
          await createNotification(
            te.id,
            'tech_validation_stage',
            `Idea "${idea.title}" has moved to Tech Validation stage.`
          );
        }
      }

      // 3. If tech expert takes action (on tech_validation), notify ideator and product expert(s)
      if (idea.stage === 'tech_validation') {
        // Notify ideator
        if (ideaDetails?.submitted_by) {
          await createNotification(
            ideaDetails.submitted_by,
            'tech_expert_action',
            `A tech expert has ${actionType}ed your idea "${idea.title}".`
          );
        }
        // Notify product expert(s)
        if (productExperts) {
          for (const pe of productExperts) {
            await createNotification(
              pe.id,
              'tech_expert_action',
              `A tech expert has ${actionType}ed the idea "${idea.title}" you approved.`
            );
          }
        }
      }

      // 4. If tech expert approves (moves to leadership_pitch), notify leader(s) and ideator
      if (idea.stage === 'tech_validation' && nextStageData === 'leadership_pitch') {
        // Notify leader(s)
        if (leaders) {
          for (const leader of leaders) {
            await createNotification(
              leader.id,
              'leadership_stage',
              `Idea "${idea.title}" is ready for Leadership Pitch.`
            );
          }
        }
        // Notify ideator
        if (ideaDetails?.submitted_by) {
          await createNotification(
            ideaDetails.submitted_by,
            'leadership_stage',
            `Your idea "${idea.title}" is ready for Leadership Pitch!`
          );
        }
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update idea",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableActions = getAvailableActions();

  return (
    <>
      <Card
        className="
          hover:shadow-md transition-shadow cursor-pointer
          w-full max-w-7xl mx-auto  // <-- changed from max-w-5xl to max-w-7xl
          rounded-lg
        "
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
            <Badge variant="secondary" className={`${config.color} text-white ml-2`}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconComponent className="h-4 w-4" />
            <span>{config.description}</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              <strong>Description:</strong> {idea.description}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              <strong>Problem:</strong> {idea.problem_statement}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              <strong>Target Audience:</strong> {idea.target_audience}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(idea.created_at)}
            </div>
            <Badge variant="outline" className="text-xs">
              {idea.category}
            </Badge>
          </div>

          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {idea.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {idea.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{idea.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="w-full">
            <div
              className="
                flex flex-col sm:flex-row flex-wrap gap-4
                w-full
              "
            >
              {availableActions.map((action) => (
                <Button
                  key={action.type}
                  variant={action.variant}
                  size="lg"
                  className={
                    `text-sm font-medium` +
                    (action.label === 'Need Info'
                      ? ' w-full sm:w-auto' // <-- Make "Need Info" button full width on mobile, auto on desktop
                      : '')
                  }
                  onClick={e => {
                    e.stopPropagation(); // Prevents card click
                    setActionType(action.type);
                    setIsActionDialogOpen(true);
                  }}
                >
                  {action.label}
                </Button>
              ))}
              {!(idea.stage === 'discovery' || idea.stage === 'basic_validation') && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-sm font-medium" // <-- removed flex-1 min-w-0 max-w-sm
                  onClick={e => {
                    e.stopPropagation(); // Prevents card click
                    setActionType('add_comment');
                    setIsActionDialogOpen(true);
                  }}
                >
                  Add Comment
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept'
                ? 'Accept Idea'
                : actionType === 'reject'
                ? 'Reject Idea'
                : actionType === 'request_more_info' || actionType === 'need_info'
                ? 'Ask for More Information'
                : 'Action'}
            </DialogTitle>
          </DialogHeader>
          {/* Show textarea for all actions except add_comment (which has its own dialog) */}
          {actionType && actionType !== 'add_comment' && (
            <>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  {actionType === 'accept'
                    ? 'Why are you accepting this idea? (optional)'
                    : actionType === 'reject'
                    ? 'Why are you rejecting this idea? (required)'
                    : 'What information do you need?'}
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={
                    actionType === 'accept'
                      ? 'Add an optional comment for acceptance...'
                      : actionType === 'reject'
                      ? 'Please provide a reason for rejection...'
                      : 'Describe what information you need...'
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsActionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={isSubmitting || (actionType === 'reject' && !comment.trim())}
                >
                  {actionType === 'accept'
                    ? 'Accept'
                    : actionType === 'reject'
                    ? 'Reject'
                    : 'Send Request'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Detailed View Modal */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{idea.title}</DialogTitle>
            <DialogDescription>
              Full details, comments, and status updates for this idea
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Idea Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`${config.color} text-white`}>
                  {config.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created on {formatDate(idea.created_at)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">{idea.description}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Problem Statement</h4>
                  <p className="text-sm text-muted-foreground">{idea.problem_statement}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Target Audience</h4>
                  <p className="text-sm text-muted-foreground">{idea.target_audience}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Category</h4>
                  <p className="text-sm text-muted-foreground">{idea.category}</p>
                </div>
              </div>

              {idea.tags && idea.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Updates */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Status Updates
              </h4>
              {loadingDetails ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading status updates...</p>
                </div>
              ) : statusUpdates.length > 0 ? (
                <div className="space-y-3">
                  {statusUpdates.map((update) => (
                    <div key={update.id} className="border rounded-lg p-3 bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {update.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {update.previous_stage} → {update.new_stage}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(update.created_at)}
                        </span>
                      </div>
                      {update.comment && (
                        <p className="text-sm text-muted-foreground">{update.comment}</p>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        by {update.updated_by_email} ({update.updated_by_role})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No status updates yet.</p>
              )}
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments
              </h4>
              {loadingDetails ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.user_email}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.user_role}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Attachments
              </h4>
              {loadingDetails ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading attachments...</p>
                </div>
              ) : attachments.length > 0 ? (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="border rounded-lg p-3 bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                          {attachment.file_name}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(attachment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Size: {attachment.file_size} bytes, Type: {attachment.file_type}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Uploaded by {(attachment as any).uploaded_by_email || 'Unknown'} ({(attachment as any).uploaded_by_role || 'Unknown'})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attachments yet.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};