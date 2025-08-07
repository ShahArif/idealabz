import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, useRoles } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IdeaWorkflowCard } from './IdeaWorkflowCard';
import { IdeaSubmissionForm } from './IdeaSubmissionForm';
import { Navigation } from './Navigation';
import { 
  Users, 
  Lightbulb, 
  TrendingUp, 
  LogOut,
  Plus,
  Filter,
  Search,
  BarChart3,
  Settings
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import NotificationBell from './NotificationBell';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Funnel } from 'funnel-react';

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

export const RoleBasedDashboard = () => {
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading, getRoleDisplayName } = useUserRole();
  const { roles: availableRoles } = useRoles();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'basic_validation', label: 'Basic Validation' },
    { value: 'tech_validation', label: 'Tech Validation' },
    { value: 'leadership_pitch', label: 'Leadership Pitch' },
    { value: 'mvp', label: 'MVP' },
    { value: 'rejected', label: 'Rejected' },
  ];
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'process', label: 'Process' },
    { value: 'product', label: 'Product' },
    { value: 'service', label: 'Service' },
    { value: 'other', label: 'Other' },
  ];

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

  useEffect(() => {
    fetchIdeas();
  }, []);

  const getIdeasByStage = (stage: string) => {
    if (stage === 'all') return ideas;
    return ideas.filter(idea => idea.stage === stage);
  };

  const getMyIdeas = () => {
    return ideas.filter(idea => idea.submitted_by === user?.id);
  };

  const getManageableIdeas = () => {
    if (!role) return [];
    // Use availableRoles for dynamic checks
    if (role === 'super_admin' && availableRoles.includes('super_admin')) return ideas;
    if (role === 'product_expert' && availableRoles.includes('product_expert')) return ideas.filter(idea => ['discovery', 'basic_validation'].includes(idea.stage));
    if (role === 'tech_expert' && availableRoles.includes('tech_expert')) return ideas.filter(idea => idea.stage === 'tech_validation');
    if (role === 'leader' && availableRoles.includes('leader')) return ideas.filter(idea => ['leadership_pitch', 'mvp'].includes(idea.stage));
    return [];
  };

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

  // Helper to filter ideas by search query, stage, and category
  const filterIdeas = (ideasToFilter: Idea[]) => {
    let filtered = ideasToFilter;
    if (filterStage !== 'all') {
      filtered = filtered.filter(idea => idea.stage === filterStage);
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(idea => idea.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) ||
        idea.problem_statement.toLowerCase().includes(q) ||
        idea.target_audience.toLowerCase().includes(q) ||
        (idea.category && idea.category.toLowerCase().includes(q)) ||
        (Array.isArray(idea.tags) && idea.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    return filtered;
  };

  if (roleLoading || loading) {
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
  const manageableIdeas = getManageableIdeas();
  const myIdeas = getMyIdeas();

  const funnelData = [
    { label: 'Discovery', quantity: stats.discovery },
    { label: 'Basic Validation', quantity: stats.basic_validation },
    { label: 'Tech Validation', quantity: stats.tech_validation },
    { label: 'Leadership Pitch', quantity: stats.leadership_pitch },
    { label: 'MVP', quantity: stats.mvp },
    { label: 'Rejected', quantity: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
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
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3 w-3" />
                {roleLoading ? 'Loading...' : (role ? getRoleDisplayName(role) : 'No Role')}
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

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {role === 'employee' && <TabsTrigger value="my-ideas">My Ideas ({myIdeas.length})</TabsTrigger>}
            {manageableIdeas.length > 0 && (
              <TabsTrigger value="manage">Manage ({manageableIdeas.length})</TabsTrigger>
            )}
            <TabsTrigger value="all-ideas">All Ideas ({ideas.length})</TabsTrigger>
            {role === 'super_admin' && (
              <TabsTrigger value="user-management" className="gap-2">
                <Settings className="h-4 w-4" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {role === 'employee' && (
                    <Button 
                      className="w-full justify-start gap-2"
                      onClick={() => setShowSubmissionForm(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Submit New Idea
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Search className="h-4 w-4" />
                    Search Ideas
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by Stage
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {role === 'employee' && (
            <TabsContent value="my-ideas" className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold">My Submitted Ideas</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="max-w-xs w-[140px]">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="max-w-xs w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    placeholder="Search ideas..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={() => setShowSubmissionForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Submit New Idea
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterIdeas(myIdeas).map((idea) => (
                  <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={fetchIdeas} />
                ))}
              </div>

              {filterIdeas(myIdeas).length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No ideas submitted yet</h4>
                    <p className="text-muted-foreground text-center mb-4">
                      Start your innovation journey by submitting your first idea
                    </p>
                    <Button onClick={() => setShowSubmissionForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Submit Your First Idea
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {manageableIdeas.length > 0 && (
            <TabsContent value="manage" className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold">Ideas Requiring Your Action</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="max-w-xs w-[140px]">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="max-w-xs w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    placeholder="Search ideas..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <Badge variant="outline">{manageableIdeas.length} pending</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterIdeas(manageableIdeas).map((idea) => (
                  <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={fetchIdeas} />
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="all-ideas" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-semibold">All Ideas</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="max-w-xs w-[140px]">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="max-w-xs w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterIdeas(ideas).map((idea) => (
                <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={fetchIdeas} />
              ))}
            </div>

            {filterIdeas(ideas).length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No ideas yet</h4>
                  <p className="text-muted-foreground text-center">
                    Ideas will appear here once they are submitted
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {role === 'super_admin' && (
            <TabsContent value="user-management">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Idea Submission Dialog */}
      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <IdeaSubmissionForm isOpen={showSubmissionForm} setIsOpen={setShowSubmissionForm} onClose={() => setShowSubmissionForm(false)} onSuccess={fetchIdeas} />
      </Dialog>
    </div>
  );
};