import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, CheckCircle, Users, LogOut } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const stageConfig = {
  discovery: { label: 'Discovery', color: 'bg-blue-500' },
  basic_validation: { label: 'Basic Validation', color: 'bg-yellow-500' },
  tech_validation: { label: 'Tech Validation', color: 'bg-orange-500' },
  leadership_pitch: { label: 'Leadership Pitch', color: 'bg-purple-500' },
  mvp: { label: 'MVP', color: 'bg-green-500' },
  rejected: { label: 'Rejected', color: 'bg-red-500' },
};

const IdeaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canManageStage, role, getRoleDisplayName } = useUserRole();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchIdea = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('ideas').select('*').eq('id', id).single();
      if (data) {
        setIdea(data);
        const { data: userData } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', data.submitted_by).single();
        setCreator(userData);
        const { data: commentsData } = await supabase.from('comments').select('*').eq('idea_id', id).order('created_at', { ascending: false });
        setComments(commentsData || []);
        const { data: attachmentsData } = await supabase.from('attachments').select('*').eq('idea_id', id).order('created_at', { ascending: false });
        setAttachments(attachmentsData || []);
      }
      setLoading(false);
    };
    if (id) fetchIdea();
  }, [id]);

  const getAvailableActions = () => {
    if (!idea || !canManageStage(idea.stage)) return [];
    switch (idea.stage) {
      case 'discovery':
        return [
          { type: 'accept', label: 'Accept for Basic Validation', variant: 'default' },
          { type: 'reject', label: 'Reject', variant: 'destructive' },
        ];
      case 'basic_validation':
        return [
          { type: 'accept', label: 'Accept for Tech Validation', variant: 'default' },
          { type: 'reject', label: 'Reject', variant: 'destructive' },
        ];
      case 'tech_validation':
        return [
          { type: 'accept', label: 'Accept for Leadership Pitch', variant: 'default' },
          { type: 'request_more_info', label: 'Request More Info', variant: 'outline' },
          { type: 'reject', label: 'Reject', variant: 'destructive' },
        ];
      case 'leadership_pitch':
        return [
          { type: 'approve', label: 'Approve for MVP', variant: 'default' },
          { type: 'request_more_info', label: 'Request More Info', variant: 'outline' },
          { type: 'reject', label: 'Reject', variant: 'destructive' },
        ];
      default:
        return [];
    }
  };

  const handleAction = async () => {
    if (!actionType || !comment.trim()) {
      toast({ title: 'Error', description: 'Please provide a comment for your action.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      // Get next stage
      const { data: nextStageData, error: stageError } = await supabase.rpc('get_next_stage', {
        _current_stage: idea.stage,
        _action: actionType,
      });
      if (stageError) throw stageError;
      // Update idea
      await supabase.from('ideas').update({ stage: nextStageData }).eq('id', idea.id);
      // Add status update
      await supabase.from('status_updates').insert({
        idea_id: idea.id,
        previous_stage: idea.stage,
        new_stage: nextStageData,
        action: actionType,
        comment,
        updated_by: supabase.auth.user()?.id,
      });
      // Add comment
      await supabase.from('comments').insert({
        idea_id: idea.id,
        content: comment,
        is_internal: true,
        user_id: supabase.auth.user()?.id,
      });
      toast({ title: 'Action completed', description: `Idea has been ${actionType}d successfully.` });
      setIsActionDialogOpen(false);
      setComment('');
      setActionType('');
      // Refresh idea
      const { data: updatedIdea } = await supabase.from('ideas').select('*').eq('id', idea.id).single();
      setIdea(updatedIdea);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update idea', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!idea) return <div className="p-8 text-center">Idea not found.</div>;

  const config = stageConfig[idea.stage] || { label: idea.stage, color: '' };
  const creatorName = creator ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || creator.email : 'Unknown';
  const availableActions = getAvailableActions();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation Bar for logged-in users */}
      {user && (
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">IdeaLabs Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.user_metadata?.first_name || 'User'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link to={role === 'super_admin' ? '/admin' : '/ideator'}>
                  <Button variant="secondary" size="sm">
                    Dashboard Home
                  </Button>
                </Link>
                <Badge variant="secondary" className="gap-2">
                  <Users className="h-3 w-3" />
                  {role ? getRoleDisplayName(role) : 'No Role'}
                </Badge>
                <NotificationBell />
                <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto my-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-2">{idea.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {creatorName}
              <Calendar className="h-4 w-4 ml-4" />
              {new Date(idea.created_at).toLocaleDateString()}
              <Badge className={`ml-4 ${config.color}`}>{config.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Description:</strong>
              <div>{idea.description}</div>
            </div>
            <div>
              <strong>Problem Statement:</strong>
              <div>{idea.problem_statement}</div>
            </div>
            <div>
              <strong>Target Audience:</strong>
              <div>{idea.target_audience}</div>
            </div>
            <div>
              <strong>Category:</strong> {idea.category}
            </div>
            <div>
              <strong>Tags:</strong> {idea.tags && idea.tags.length > 0 ? idea.tags.join(', ') : 'None'}
            </div>
            {/* Action Buttons */}
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
                        >
                          {action.label}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{action.label}</DialogTitle>
                          <DialogDescription>
                            Please provide a comment for your action.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea
                              id="comment"
                              placeholder="Enter your comment..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAction} disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : action.label}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            )}
            {/* Attachments */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Attachments
              </h4>
              {attachments.length === 0 ? (
                <div className="text-muted-foreground">No attachments yet.</div>
              ) : (
                <ul className="space-y-2">
                  {attachments.map((a) => (
                    <li key={a.id} className="border rounded p-2 bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                          {a.file_name}
                        </a>
                        <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Size: {a.file_size} bytes, Type: {a.file_type}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdeaDetail;
