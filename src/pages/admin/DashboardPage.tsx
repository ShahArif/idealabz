import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Funnel } from 'funnel-react';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  Plus
} from 'lucide-react';

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

export const DashboardPage = () => {
  const { user } = useAuth();
  const { role, getRoleDisplayName } = useUserRole();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [recentIdeasCount, setRecentIdeasCount] = useState(5);
  const [recentIdeasOwners, setRecentIdeasOwners] = useState<Record<string, string>>({});

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ideas:', error);
      } else {
        setIdeas(data || []);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest actions (status_updates and comments)
  useEffect(() => {
    const fetchActions = async () => {
      // Fetch latest status_updates
      const { data: statusUpdates } = await supabase
        .from('status_updates')
        .select('id, action, comment, created_at, idea_id, previous_stage, new_stage, updated_by')
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Fetch latest comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at, idea_id, user_id')
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Fetch user and idea info for each
      const actions: any[] = [];
      if (statusUpdates) {
        for (const su of statusUpdates) {
          const userRes = await supabase.from('profiles').select('first_name, last_name').eq('id', su.updated_by).single();
          const ideaRes = await supabase.from('ideas').select('title').eq('id', su.idea_id).single();
          actions.push({
            type: su.action,
            comment: su.comment,
            created_at: su.created_at,
            idea_title: ideaRes.data?.title || 'Unknown',
            user_name: userRes.data?.first_name + ' ' + userRes.data?.last_name || 'Unknown',
            isStatus: true,
            previous_stage: su.previous_stage,
            new_stage: su.new_stage,
          });
        }
      }
      if (comments) {
        for (const c of comments) {
          const userRes = await supabase.from('profiles').select('first_name, last_name').eq('id', c.user_id).single();
          const ideaRes = await supabase.from('ideas').select('title').eq('id', c.idea_id).single();
          actions.push({
            type: 'comment',
            comment: c.content,
            created_at: c.created_at,
            idea_title: ideaRes.data?.title || 'Unknown',
            user_name: userRes.data?.first_name + ' ' + userRes.data?.last_name || 'Unknown',
            isStatus: false,
          });
        }
      }
      // Sort all actions by created_at descending
      actions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActions(actions.slice(0, 5));
    };
    fetchActions();
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, []);

  // Fetch owners for recent ideas
  useEffect(() => {
    const fetchOwners = async () => {
      const ideasToFetch = [...ideas].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, recentIdeasCount);
      const ownerIds = Array.from(new Set(ideasToFetch.map(i => i.submitted_by)));
      const owners: Record<string, string> = {};
      for (const id of ownerIds) {
        const { data } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', id).single();
        owners[id] = data ? (`${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email) : 'Unknown';
      }
      setRecentIdeasOwners(owners);
    };
    if (ideas.length > 0) fetchOwners();
  }, [ideas, recentIdeasCount]);

  const pagedRecentIdeas = [...ideas].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, recentIdeasCount);
  const canLoadMoreIdeas = recentIdeasCount < ideas.length;

  const getStageStats = () => {
    const stats = {
      discovery: ideas.filter(i => i.stage === 'discovery').length,
      basic_validation: ideas.filter(i => i.stage === 'basic_validation').length,
      tech_validation: ideas.filter(i => i.stage === 'tech_validation').length,
      leadership_pitch: ideas.filter(i => i.stage === 'leadership_pitch').length,
      mvp: ideas.filter(i => i.stage === 'mvp').length,
      rejected: ideas.filter(i => i.stage === 'rejected').length,
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = getStageStats();
  const funnelData = [
    { label: 'Discovery', quantity: stats.discovery },
    { label: 'Basic Validation', quantity: stats.basic_validation },
    { label: 'Tech Validation', quantity: stats.tech_validation },
    { label: 'Leadership Pitch', quantity: stats.leadership_pitch },
    { label: 'MVP', quantity: stats.mvp },
    { label: 'Rejected', quantity: stats.rejected },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.first_name || 'User'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-2">
            <User className="h-3 w-3" />
            {role ? getRoleDisplayName(role) : 'No Role'}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.discovery}</div>
            <div className="text-xs text-muted-foreground">Discovery</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.basic_validation}</div>
            <div className="text-xs text-muted-foreground">Basic Validation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.tech_validation}</div>
            <div className="text-xs text-muted-foreground">Tech Validation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.leadership_pitch}</div>
            <div className="text-xs text-muted-foreground">Leadership Pitch</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.mvp}</div>
            <div className="text-xs text-muted-foreground">MVP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pipeline Overview
            </CardTitle>
            <CardDescription>
              Ideas moving through the validation stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full flex flex-col items-center">
              <Funnel
                data={funnelData}
                width={600}
                height={320}
                valueKey="quantity"
                labelKey="label"
                colors={{
                  graph: ["#3b82f6", "#f59e42", "#fbbf24", "#a78bfa", "#10b981", "#ef4444"],
                  percent: '#333',
                  label: '#222',
                  value: '#222',
                }}
                displayPercent={true}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-6">
          {/* Recent Ideas Panel */}
          <Card style={{ height: 350 }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recent Ideas
              </CardTitle>
              <CardDescription>Latest ideas submitted</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent pr-2">
              <ul className="divide-y divide-muted-foreground/10 bg-muted/40 rounded-lg shadow-inner">
                {pagedRecentIdeas.map(idea => (
                  <li key={idea.id} className="flex items-center gap-2 text-sm py-2 px-1 hover:bg-muted/60 transition-colors">
                    <Link to={`/ideas/${idea.id}`} className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium truncate max-w-[120px] text-primary hover:underline">{idea.title}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {recentIdeasOwners[idea.submitted_by] || '...'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
              {canLoadMoreIdeas && (
                <div className="flex justify-center mt-2">
                  <Button size="sm" variant="outline" onClick={() => setRecentIdeasCount(c => c + 5)}>
                    Load More
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Latest Actions Panel */}
          <Card style={{ height: 350 }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Latest Actions
              </CardTitle>
              <CardDescription>Recent activity on ideas</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent pr-2">
              <ul className="divide-y divide-muted-foreground/10 bg-muted/40 rounded-lg shadow-inner">
                {recentActions.map((action, idx) => (
                  <li key={idx} className="flex flex-col py-2 px-1 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate max-w-[100px] text-primary px-2">{action.user_name}</span>
                      <span className="text-muted-foreground">Updated</span>
                      <span className="font-medium truncate max-w-[230px] text-primary">{action.idea_title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
