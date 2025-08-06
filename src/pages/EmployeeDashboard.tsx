import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IdeaFunnelView } from '@/components/IdeaFunnelView';
import { IdeaSubmissionForm } from '@/components/IdeaSubmissionForm';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Lightbulb, 
  TrendingUp, 
  LogOut,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Loader2
} from 'lucide-react';

const IdeatorDashboard = () => {
  const { user, signOut } = useAuth();

  // Fetch user's ideas from Supabase
  const { data: ideas = [], isLoading, error, refetch: refetchIdeas } = useQuery({
    queryKey: ['user-ideas', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch recent activity (comments and status updates)
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get recent comments on user's ideas
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          idea_id,
          ideas!inner(title, submitted_by)
        `)
        .eq('ideas.submitted_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent status updates for user's ideas
      const { data: statusUpdates } = await supabase
        .from('status_updates')
        .select(`
          id,
          action,
          comment,
          new_stage,
          created_at,
          idea_id,
          ideas!inner(title, submitted_by)
        `)
        .eq('ideas.submitted_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort by date
      const allActivity = [
        ...(comments || []).map(c => ({
          type: 'comment',
          message: `New comment on "${c.ideas.title}"`,
          time: c.created_at,
          id: c.id
        })),
        ...(statusUpdates || []).map(s => ({
          type: 'status',
          message: `"${s.ideas.title}" moved to ${s.new_stage.replace('_', ' ')}`,
          time: s.created_at,
          id: s.id
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      return allActivity;
    },
    enabled: !!user?.id,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return MessageSquare;
      case 'status': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Calculate stats
  const totalIdeas = ideas.length;
  const completedIdeas = ideas.filter(idea => idea.stage === 'mvp').length;
  const inProgressIdeas = ideas.filter(idea => ['basic_validation', 'tech_validation', 'leadership_pitch'].includes(idea.stage)).length;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ideator Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3 w-3" />
                Ideator
              </Badge>
              <IdeaSubmissionForm onIdeaSubmitted={refetchIdeas} />
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Ideas
                  </p>
                  <p className="text-2xl font-bold">{totalIdeas}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">{inProgressIdeas}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Completed (MVP)
                  </p>
                  <p className="text-2xl font-bold">{completedIdeas}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {totalIdeas > 0 ? Math.round((completedIdeas / totalIdeas) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Idea Funnel - Takes 3 columns */}
          <div className="lg:col-span-3">
            <IdeaFunnelView ideas={ideas} />
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  recentActivity.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                        <IconComponent className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(activity.time)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <IdeaSubmissionForm onIdeaSubmitted={refetchIdeas} />
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Browse All Ideas
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  My Comments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeatorDashboard;