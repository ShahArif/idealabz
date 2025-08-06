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
  const [actionType, setActionType] = useState<string>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const getAvailableActions = () => {
    if (!canManageStage(idea.stage)) return [];

    switch (idea.stage) {
      case 'discovery':
        return [
          { type: 'accept', label: 'Accept for Basic Validation', variant: 'default' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      case 'basic_validation':
        return [
          { type: 'accept', label: 'Accept for Tech Validation', variant: 'default' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      case 'tech_validation':
        return [
          { type: 'accept', label: 'Accept for Leadership Pitch', variant: 'default' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      case 'leadership_pitch':
        return [
          { type: 'approve', label: 'Approve for MVP', variant: 'default' as const },
          { type: 'request_more_info', label: 'Request More Info', variant: 'outline' as const },
          { type: 'reject', label: 'Reject', variant: 'destructive' as const }
        ];
      default:
        return [];
    }
  };

  const handleAction = async () => {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
          <Badge variant="secondary" className={`${config.color} text-white ml-2`}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {availableActions.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => (
                <Dialog key={action.type} open={isActionDialogOpen && actionType === action.type} onOpenChange={(open) => {
                  setIsActionDialogOpen(open);
                  if (!open) {
                    setActionType('');
                    setComment('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant={action.variant}
                      onClick={() => {
                        setActionType(action.type);
                        setIsActionDialogOpen(true);
                      }}
                      className="gap-1"
                    >
                      {action.type === 'accept' || action.type === 'approve' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : action.type === 'reject' ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <ArrowRight className="h-3 w-3" />
                      )}
                      {action.label}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{action.label}</DialogTitle>
                      <DialogDescription>
                        Please provide a comment explaining your decision for "{idea.title}".
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="comment">Comment *</Label>
                        <Textarea
                          id="comment"
                          placeholder="Explain your decision..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsActionDialogOpen(false);
                          setComment('');
                          setActionType('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAction}
                        disabled={isSubmitting || !comment.trim()}
                        variant={action.variant}
                      >
                        {isSubmitting ? 'Processing...' : action.label}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};