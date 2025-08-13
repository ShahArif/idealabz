import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, useRoles } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IdeaWorkflowCard } from './IdeaWorkflowCard';
import { IdeaSubmissionForm } from './IdeaSubmissionForm';
import { RoleBasedSidebar } from './RoleBasedSidebar';
import { AIModePage } from '@/pages/admin/AIModePage';
import {
  Users,
  Lightbulb,
  TrendingUp,
  Plus,
  BarChart3,
  User,
  Calendar,
  Brain,
  Sparkles,
  Zap,
  Target,
  Eye,
  FileText,
  Edit,
  Save,
  MessageCircle,
  Settings
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import NotificationBell from './NotificationBell';
import { Dialog } from '@/components/ui/dialog';
import { Funnel } from 'funnel-react';
import { Link } from 'react-router-dom';

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

// Overview Page Component
const OverviewPage = ({ ideas, stats, manageableIdeas, myIdeas, role, onUpdate }: any) => {
  const [recentIdeasCount, setRecentIdeasCount] = useState(5);
  const [recentIdeasOwners, setRecentIdeasOwners] = useState<Record<string, string>>({});
  const [recentActions, setRecentActions] = useState<any[]>([]);

  const pagedRecentIdeas = [...ideas].sort((a: Idea, b: Idea) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, recentIdeasCount);
  const canLoadMoreIdeas = recentIdeasCount < ideas.length;

  const funnelData = [
    { label: 'Discovery', quantity: stats.discovery },
    { label: 'Basic Validation', quantity: stats.basic_validation },
    { label: 'Tech Validation', quantity: stats.tech_validation },
    { label: 'Leadership Pitch', quantity: stats.leadership_pitch },
    { label: 'MVP', quantity: stats.mvp },
    { label: 'Rejected', quantity: stats.rejected },
  ];

  // Fetch owners for recent ideas
  useEffect(() => {
    const fetchOwners = async () => {
      const ideasToFetch = [...ideas].sort((a: Idea, b: Idea) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, recentIdeasCount);
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

  // Fetch latest actions
  useEffect(() => {
    const fetchActions = async () => {
      const { data: statusUpdates } = await supabase
        .from('status_updates')
        .select('id, action, comment, created_at, idea_id, previous_stage, new_stage, updated_by')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at, idea_id, user_id')
        .order('created_at', { ascending: false })
        .limit(10);
      
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
            user_name: userRes.data ? `${userRes.data.first_name || ''} ${userRes.data.last_name || ''}`.trim() : 'Unknown',
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
            user_name: userRes.data ? `${userRes.data.first_name || ''} ${userRes.data.last_name || ''}`.trim() : 'Unknown',
            isStatus: false,
          });
        }
      }
      actions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActions(actions.slice(0, 5));
    };
    fetchActions();
  }, []);

  return (
    <div className="space-y-6">
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
                {pagedRecentIdeas.map((idea: Idea) => (
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
                      {new Date(idea.created_at).toLocaleString()}
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

// All Ideas Page Component
const AllIdeasPage = ({ ideas, onUpdate }: any) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Ideas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea: Idea) => (
          <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
};

// My Ideas Page Component
const MyIdeasPage = ({ ideas, onUpdate }: any) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Ideas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea: Idea) => (
          <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
};

// Role-specific page components
const DiscoveryPage = ({ ideas, onUpdate }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Discovery Review</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea: Idea) => (
        <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={onUpdate} />
      ))}
    </div>
  </div>
);

const BasicValidationPage = ({ ideas, onUpdate }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Basic Validation</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea: Idea) => (
        <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={onUpdate} />
      ))}
    </div>
  </div>
);

const TechValidationPage = ({ ideas, onUpdate }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Tech Validation</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea: Idea) => (
        <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={onUpdate} />
      ))}
    </div>
  </div>
);

const LeadershipPitchPage = ({ ideas, onUpdate }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Leadership Pitch</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea: Idea) => (
        <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={onUpdate} />
      ))}
    </div>
  </div>
);

const MVPPage = ({ ideas, onUpdate }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">MVP Review</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea: Idea) => (
        <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={onUpdate} />
      ))}
    </div>
  </div>
);

// New page components for ideator roles
const IdeaValidationPage = ({ ideas, onUpdate }: any) => {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [ideationFrameworks, setIdeationFrameworks] = useState<any[]>([]);
  const [successfulProducts, setSuccessfulProducts] = useState<any[]>([]);
  const [implementedResults, setImplementedResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  // Load existing data from database
  const loadExistingData = async (ideaId: string) => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('idea_documents')
        .select('*')
        .eq('idea_id', ideaId)
        .in('document_type', ['ideation_frameworks', 'successful_products', 'framework_implementation']);

      if (error) throw error;

      if (data) {
        const frameworks = data.find(doc => doc.document_type === 'ideation_frameworks');
        const products = data.find(doc => doc.document_type === 'successful_products');
        const implementation = data.find(doc => doc.document_type === 'framework_implementation');

        if (frameworks) setIdeationFrameworks(frameworks.content || []);
        if (products) setSuccessfulProducts(products.content || []);
        if (implementation) setImplementedResults(implementation.content);
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate ideation frameworks
  const generateFrameworks = async () => {
    if (!selectedIdea) return;
    
    try {
      setGenerating('frameworks');
      // Simulate AI generation - replace with actual AI call
      const frameworks = [
        { 
          name: 'Design Thinking', 
          description: 'Human-centered approach to innovation', 
          steps: ['Empathize', 'Define', 'Ideate', 'Prototype', 'Test'],
          success_products: [
            { name: 'Airbnb', success_factor: 'Empathized with travelers needing affordable accommodation' },
            { name: 'IDEO', success_factor: 'Applied design thinking to solve complex human problems' },
            { name: 'Apple', success_factor: 'User-centered design approach for intuitive products' },
            { name: 'Nike', success_factor: 'Empathized with athletes\' needs and pain points' },
            { name: 'Starbucks', success_factor: 'Redesigned coffee experience around customer journey' }
          ]
        },
        { 
          name: 'Lean Startup', 
          description: 'Build-Measure-Learn feedback loop', 
          steps: ['Build MVP', 'Measure metrics', 'Learn from data'],
          success_products: [
            { name: 'Dropbox', success_factor: 'Built simple MVP, measured user adoption, iterated' },
            { name: 'Zappos', success_factor: 'Started with minimal inventory, validated demand' },
            { name: 'Groupon', success_factor: 'Tested concept with simple email before building platform' },
            { name: 'Instagram', success_factor: 'Launched MVP in 8 weeks, measured user engagement' },
            { name: 'Buffer', success_factor: 'Started with landing page to validate interest' }
          ]
        },
        { 
          name: 'Blue Ocean Strategy', 
          description: 'Create uncontested market space', 
          steps: ['Eliminate', 'Reduce', 'Raise', 'Create'],
          success_products: [
            { name: 'Cirque du Soleil', success_factor: 'Eliminated animals, reduced costs, raised artistry' },
            { name: 'Southwest Airlines', success_factor: 'Eliminated meals, reduced complexity, raised convenience' },
            { name: 'Netflix', success_factor: 'Eliminated late fees, reduced physical stores, raised selection' },
            { name: 'Uber', success_factor: 'Eliminated taxi medallions, reduced wait times, raised convenience' },
            { name: 'Tesla', success_factor: 'Eliminated gas stations, reduced emissions, raised performance' }
          ]
        },
        { 
          name: 'Jobs-to-be-Done', 
          description: 'Focus on customer jobs and outcomes', 
          steps: ['Identify job', 'Understand context', 'Design solution'],
          success_products: [
            { name: 'Uber', success_factor: 'Focused on job of getting from A to B conveniently' },
            { name: 'Amazon', success_factor: 'Focused on job of getting products quickly and easily' },
            { name: 'Slack', success_factor: 'Focused on job of team communication and collaboration' },
            { name: 'Spotify', success_factor: 'Focused on job of listening to music anywhere' },
            { name: 'Zoom', success_factor: 'Focused on job of connecting people remotely' }
          ]
        },
        { 
          name: 'Systematic Inventive Thinking', 
          description: 'Systematic approach to innovation', 
          steps: ['Subtraction', 'Division', 'Multiplication', 'Task unification'],
          success_products: [
            { name: 'Slack', success_factor: 'Unified communication tasks in one platform' },
            { name: 'WhatsApp', success_factor: 'Subtracted phone calls, unified messaging' },
            { name: 'Tinder', success_factor: 'Simplified dating to basic swipe mechanism' },
            { name: 'Venmo', success_factor: 'Unified social and financial transactions' },
            { name: 'TikTok', success_factor: 'Simplified video creation and consumption' }
          ]
        }
      ];
      
      setIdeationFrameworks(frameworks);
      setSuccessfulProducts(frameworks.flatMap(f => f.success_products));
      
      // Save to database
      await (supabase as any)
        .from('idea_documents')
        .upsert({
          idea_id: selectedIdea.id,
          document_type: 'ideation_frameworks',
          content: frameworks,
          created_by: (supabase as any).auth.user()?.id,
          updated_by: (supabase as any).auth.user()?.id
        });
        
    } catch (error) {
      console.error('Error generating frameworks:', error);
    } finally {
      setGenerating(null);
    }
  };

  // Implement frameworks on idea
  const implementFrameworks = async () => {
    if (!selectedIdea || ideationFrameworks.length === 0) return;
    
    try {
      setGenerating('implementation');
      // Simulate AI implementation - replace with actual AI call
      const results = {
        idea_title: selectedIdea.title,
        implementation_date: new Date().toISOString(),
        frameworks_applied: ideationFrameworks.map(f => f.name),
        framework_results: {
          'Design Thinking': {
            empathy_insights: [
              'Users struggle with complex onboarding processes',
              'Time constraints prevent thorough exploration of features',
              'Need for immediate value recognition'
            ],
            problem_definition: 'Users need a streamlined, intuitive experience that delivers value quickly',
            ideation_opportunities: [
              'Simplify user interface to reduce cognitive load',
              'Implement progressive disclosure for complex features',
              'Create quick-win scenarios for immediate engagement'
            ],
            prototype_focus: 'Focus on core user journey with minimal steps',
            testing_approach: 'A/B test onboarding flows with different user segments'
          },
          'Lean Startup': {
            mvp_scope: 'Core functionality that solves the primary user problem',
            key_metrics: [
              'User activation rate within first session',
              'Time to first value',
              'Feature adoption rate'
            ],
            learning_goals: [
              'Validate core value proposition',
              'Identify critical user pain points',
              'Measure user engagement patterns'
            ],
            iteration_plan: 'Weekly sprints based on user feedback and metrics',
            pivot_indicators: [
              'Low activation rate after onboarding',
              'High drop-off at specific feature points',
              'Negative user feedback on core functionality'
            ]
          },
          'Blue Ocean Strategy': {
            current_competitors: [
              'Traditional solutions with complex interfaces',
              'Feature-heavy platforms with steep learning curves',
              'Legacy systems with outdated user experiences'
            ],
            value_innovations: [
              'Simplified user experience that reduces time to value',
              'Intuitive design that requires minimal training',
              'Progressive feature discovery that grows with user needs'
            ],
            uncontested_markets: [
              'Users who need quick solutions without extensive training',
              'Organizations prioritizing user adoption over feature complexity',
              'Teams seeking immediate productivity gains'
            ],
            differentiation_factors: [
              'Zero-learning-curve interface design',
              'Contextual help and guidance',
              'Adaptive complexity based on user expertise'
            ]
          },
          'Jobs-to-be-Done': {
            primary_job: 'Help users achieve their goals quickly and efficiently',
            job_context: [
              'Users have limited time for learning new tools',
              'Immediate productivity is more valuable than feature richness',
              'Success is measured by outcomes, not tool mastery'
            ],
            job_outcomes: [
              'Complete tasks faster than with current solutions',
              'Reduce cognitive load during complex operations',
              'Achieve goals without extensive training or documentation'
            ],
            solution_design: [
              'Focus on outcome-oriented workflows',
              'Eliminate unnecessary steps and complexity',
              'Provide contextual guidance when needed'
            ]
          },
          'Systematic Inventive Thinking': {
            subtraction_analysis: 'Remove complex configuration options to focus on core functionality',
            division_approach: 'Break down complex processes into simple, sequential steps',
            multiplication_strategy: 'Replicate successful patterns across different user scenarios',
            task_unification: 'Combine user guidance with actual task execution',
            attribute_dependency: 'Adapt interface complexity based on user expertise level'
          }
        },
        overall_insights: [
          'Design Thinking: User empathy reveals key pain points in current solutions',
          'Lean Startup: MVP should focus on core value proposition first',
          'Blue Ocean Strategy: Opportunity exists in underserved market segment',
          'Jobs-to-be-Done: Primary job is reducing time and complexity',
          'Systematic Inventive Thinking: Can combine multiple existing solutions'
        ],
        recommendations: [
          'Start with user interviews to validate assumptions',
          'Build minimal prototype to test core hypothesis',
          'Identify unique market positioning opportunity',
          'Focus on outcome, not just features',
          'Consider partnerships with complementary services'
        ]
      };
      
      setImplementedResults(results);
      
      // Save to database
      await (supabase as any)
        .from('idea_documents')
        .upsert({
          idea_id: selectedIdea.id,
          document_type: 'framework_implementation',
          content: results,
          created_by: (supabase as any).auth.user()?.id,
          updated_by: (supabase as any).auth.user()?.id
        });
        
    } catch (error) {
      console.error('Error implementing frameworks:', error);
    } finally {
      setGenerating(null);
    }
  };

  // Load data when idea is selected
  useEffect(() => {
    if (selectedIdea) {
      loadExistingData(selectedIdea.id);
    }
  }, [selectedIdea]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Idea Validation</h2>
          <p className="text-muted-foreground">Validate and analyze ideas using frameworks and existing relevant ideas</p>
        </div>
      </div>

      {/* Idea Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Select Idea to Validate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => {
            const idea = ideas.find(i => i.id === value);
            setSelectedIdea(idea || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an idea to validate..." />
            </SelectTrigger>
            <SelectContent>
              {ideas.map((idea: Idea) => (
                <SelectItem key={idea.id} value={idea.id}>
                  {idea.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedIdea && (
        <>
          {/* Section 1: Ideation Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Ideation Frameworks & Success Examples
              </CardTitle>
              <CardDescription>5 ideation frameworks with real-world successful products that implemented them</CardDescription>
            </CardHeader>
            <CardContent>
                             {ideationFrameworks.length > 0 ? (
                 <div className="space-y-6">
                   {ideationFrameworks.map((framework, index) => (
                     <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-muted/30 to-muted/10">
                       <div className="flex items-start justify-between mb-4">
                         <div className="flex-1">
                           <h4 className="font-semibold text-xl mb-2">{framework.name}</h4>
                           <p className="text-muted-foreground mb-3">{framework.description}</p>
                           <div className="flex flex-wrap gap-2 mb-4">
                             {framework.steps?.map((step, stepIndex) => (
                               <Badge key={stepIndex} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                 {step}
                               </Badge>
                             ))}
                           </div>
                         </div>
                         <div className="ml-4 flex-shrink-0">
                           {index === 0 && <Brain className="h-8 w-8 text-blue-600" />}
                           {index === 1 && <Zap className="h-8 w-8 text-green-600" />}
                           {index === 2 && <TrendingUp className="h-8 w-8 text-purple-600" />}
                           {index === 3 && <Target className="h-8 w-8 text-orange-600" />}
                           {index === 4 && <Sparkles className="h-8 w-8 text-indigo-600" />}
                         </div>
                       </div>
                       
                       {/* Success Products for this Framework */}
                       <div className="mt-6">
                         <h5 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                           <TrendingUp className="h-4 w-4" />
                           Top 5 Successful Products Using {framework.name}
                         </h5>
                         <div className="grid gap-3">
                           {framework.success_products?.map((product, productIndex) => (
                             <div key={productIndex} className="bg-white/50 rounded-lg p-3 border-l-4 border-green-500">
                               <div className="flex items-start gap-3">
                                 <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                 <div className="flex-1">
                                   <h6 className="font-semibold text-green-800">{product.name}</h6>
                                   <p className="text-sm text-green-700">{product.success_factor}</p>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No frameworks and examples generated yet</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                         <Button 
                       onClick={generateFrameworks} 
                       disabled={generating === 'frameworks'}
                       className="flex items-center gap-2"
                     >
                       {generating === 'frameworks' ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                           Generating...
                         </>
                       ) : (
                         <>
                           <Sparkles className="h-4 w-4" />
                           Generate Frameworks & Success Examples
                         </>
                       )}
                     </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Implement Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Implement Frameworks on Your Idea
              </CardTitle>
              <CardDescription>Apply the above frameworks to your idea and see results</CardDescription>
            </CardHeader>
            <CardContent>
               {implementedResults ? (
                 <div className="space-y-6">
                   <div className="bg-muted/50 rounded-lg p-4">
                     <h4 className="font-semibold mb-2">Implementation Results for: {implementedResults.idea_title}</h4>
                     <p className="text-sm text-muted-foreground mb-4">
                       Implemented on: {new Date(implementedResults.implementation_date).toLocaleDateString()}
                     </p>
                   </div>
                   
                   <div>
                     <h5 className="font-semibold mb-2">Frameworks Applied:</h5>
                     <div className="flex flex-wrap gap-2 mb-4">
                       {implementedResults.frameworks_applied.map((framework, index) => (
                         <Badge key={index} variant="outline">{framework}</Badge>
                       ))}
                     </div>
                   </div>

                   {/* Framework-specific Results Tabs */}
                   <div>
                     <h5 className="font-semibold mb-4">Framework Implementation Details:</h5>
                     <Tabs defaultValue="design-thinking" className="w-full">
                       <TabsList className="grid w-full grid-cols-5">
                         <TabsTrigger value="design-thinking" className="text-xs">Design Thinking</TabsTrigger>
                         <TabsTrigger value="lean-startup" className="text-xs">Lean Startup</TabsTrigger>
                         <TabsTrigger value="blue-ocean" className="text-xs">Blue Ocean</TabsTrigger>
                         <TabsTrigger value="jobs-done" className="text-xs">Jobs-to-be-Done</TabsTrigger>
                         <TabsTrigger value="systematic" className="text-xs">Systematic</TabsTrigger>
                       </TabsList>
                       
                       {/* Design Thinking Tab */}
                       <TabsContent value="design-thinking" className="mt-4">
                         <Card>
                           <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-lg">
                               <Brain className="h-5 w-5" />
                               Design Thinking Implementation
                             </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-4">
                             <div>
                               <h6 className="font-semibold mb-2">Empathy Insights:</h6>
                               <ul className="space-y-1">
                                 {implementedResults.framework_results['Design Thinking'].empathy_insights.map((insight, index) => (
                                   <li key={index} className="flex items-start gap-2">
                                     <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                     <span className="text-sm">{insight}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Problem Definition:</h6>
                               <p className="text-sm bg-blue-50 p-3 rounded-lg">{implementedResults.framework_results['Design Thinking'].problem_definition}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Ideation Opportunities:</h6>
                               <div className="flex flex-wrap gap-2">
                                 {implementedResults.framework_results['Design Thinking'].ideation_opportunities.map((opportunity, index) => (
                                   <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">{opportunity}</Badge>
                                 ))}
                               </div>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Prototype Focus:</h6>
                               <p className="text-sm bg-blue-50 p-3 rounded-lg">{implementedResults.framework_results['Design Thinking'].prototype_focus}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Testing Approach:</h6>
                               <p className="text-sm bg-blue-50 p-3 rounded-lg">{implementedResults.framework_results['Design Thinking'].testing_approach}</p>
                             </div>
                           </CardContent>
                         </Card>
                       </TabsContent>

                       {/* Lean Startup Tab */}
                       <TabsContent value="lean-startup" className="mt-4">
                         <Card>
                           <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-lg">
                               <Zap className="h-5 w-5" />
                               Lean Startup Implementation
                             </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-4">
                             <div>
                               <h6 className="font-semibold mb-2">MVP Scope:</h6>
                               <p className="text-sm bg-green-50 p-3 rounded-lg">{implementedResults.framework_results['Lean Startup'].mvp_scope}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Key Metrics:</h6>
                               <div className="flex flex-wrap gap-2">
                                 {implementedResults.framework_results['Lean Startup'].key_metrics.map((metric, index) => (
                                   <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">{metric}</Badge>
                                 ))}
                               </div>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Learning Goals:</h6>
                               <ul className="space-y-1">
                                 {implementedResults.framework_results['Lean Startup'].learning_goals.map((goal, index) => (
                                   <li key={index} className="flex items-start gap-2">
                                     <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                     <span className="text-sm">{goal}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Iteration Plan:</h6>
                               <p className="text-sm bg-green-50 p-3 rounded-lg">{implementedResults.framework_results['Lean Startup'].iteration_plan}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Pivot Indicators:</h6>
                               <ul className="space-y-1">
                                 {implementedResults.framework_results['Lean Startup'].pivot_indicators.map((indicator, index) => (
                                   <li key={index} className="flex items-start gap-2">
                                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                     <span className="text-sm">{indicator}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           </CardContent>
                         </Card>
                       </TabsContent>

                       {/* Blue Ocean Strategy Tab */}
                       <TabsContent value="blue-ocean" className="mt-4">
                         <Card>
                           <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-lg">
                               <TrendingUp className="h-5 w-5" />
                               Blue Ocean Strategy Implementation
                             </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-4">
                             <div>
                               <h6 className="font-semibold mb-2">Current Competitors:</h6>
                               <ul className="space-y-1">
                                 {implementedResults.framework_results['Blue Ocean Strategy'].current_competitors.map((competitor, index) => (
                                   <li key={index} className="flex items-start gap-2">
                                     <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                     <span className="text-sm">{competitor}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Value Innovations:</h6>
                               <div className="flex flex-wrap gap-2">
                                 {implementedResults.framework_results['Blue Ocean Strategy'].value_innovations.map((innovation, index) => (
                                   <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">{innovation}</Badge>
                                 ))}
                               </div>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Uncontested Markets:</h6>
                               <ul className="space-y-1">
                                 {implementedResults.framework_results['Blue Ocean Strategy'].uncontested_markets.map((market, index) => (
                                   <li key={index} className="flex items-start gap-2">
                                     <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                     <span className="text-sm">{market}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Differentiation Factors:</h6>
                               <div className="flex flex-wrap gap-2">
                                 {implementedResults.framework_results['Blue Ocean Strategy'].differentiation_factors.map((factor, index) => (
                                   <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">{factor}</Badge>
                                 ))}
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       </TabsContent>

                       {/* Jobs-to-be-Done Tab */}
                       <TabsContent value="jobs-done" className="mt-4">
                         <Card>
                           <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-lg">
                               <Target className="h-5 w-5" />
                               Jobs-to-be-Done Implementation
                             </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-4">
                             <div>
                               <h6 className="font-semibold mb-2">Primary Job:</h6>
                               <p className="text-sm bg-orange-50 p-3 rounded-lg">{implementedResults.framework_results['Jobs-to-be-Done'].primary_job}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Job Context:</h6>
                               <ul className="space-y-1">
                                 {implementedResults.framework_results['Jobs-to-be-Done'].job_context.map((context, index) => (
                                   <li key={index} className="flex items-start gap-2">
                                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                     <span className="text-sm">{context}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Job Outcomes:</h6>
                               <ul className="space-y-1">
                                 {implementedResults.framework_results['Jobs-to-be-Done'].job_outcomes.map((outcome, index) => (
                                   <li key={index} className="flex items-start gap-2">
                                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                     <span className="text-sm">{outcome}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Solution Design:</h6>
                               <div className="flex flex-wrap gap-2">
                                 {implementedResults.framework_results['Jobs-to-be-Done'].solution_design.map((design, index) => (
                                   <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">{design}</Badge>
                                 ))}
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       </TabsContent>

                       {/* Systematic Inventive Thinking Tab */}
                       <TabsContent value="systematic" className="mt-4">
                         <Card>
                           <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-lg">
                               <Sparkles className="h-5 w-5" />
                               Systematic Inventive Thinking Implementation
                             </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-4">
                             <div>
                               <h6 className="font-semibold mb-2">Subtraction Analysis:</h6>
                               <p className="text-sm bg-indigo-50 p-3 rounded-lg">{implementedResults.framework_results['Systematic Inventive Thinking'].subtraction_analysis}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Division Approach:</h6>
                               <p className="text-sm bg-indigo-50 p-3 rounded-lg">{implementedResults.framework_results['Systematic Inventive Thinking'].division_approach}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Multiplication Strategy:</h6>
                               <p className="text-sm bg-indigo-50 p-3 rounded-lg">{implementedResults.framework_results['Systematic Inventive Thinking'].multiplication_strategy}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Task Unification:</h6>
                               <p className="text-sm bg-indigo-50 p-3 rounded-lg">{implementedResults.framework_results['Systematic Inventive Thinking'].task_unification}</p>
                             </div>
                             <div>
                               <h6 className="font-semibold mb-2">Attribute Dependency:</h6>
                               <p className="text-sm bg-indigo-50 p-3 rounded-lg">{implementedResults.framework_results['Systematic Inventive Thinking'].attribute_dependency}</p>
                             </div>
                           </CardContent>
                         </Card>
                       </TabsContent>
                     </Tabs>
                   </div>

                   <div>
                     <h5 className="font-semibold mb-2">Overall Key Insights:</h5>
                     <ul className="space-y-2">
                       {implementedResults.overall_insights.map((insight, index) => (
                         <li key={index} className="flex items-start gap-2">
                           <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                           <span className="text-sm">{insight}</span>
                         </li>
                       ))}
                     </ul>
                   </div>

                   <div>
                     <h5 className="font-semibold mb-2">Recommendations:</h5>
                     <ul className="space-y-2">
                       {implementedResults.recommendations.map((rec, index) => (
                         <li key={index} className="flex items-start gap-2">
                           <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                           <span className="text-sm">{rec}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {ideationFrameworks.length === 0 
                      ? 'Generate frameworks first to implement them on your idea'
                      : 'Apply the frameworks to your idea to see implementation results'
                    }
                  </p>
                  <Button 
                    onClick={implementFrameworks} 
                    disabled={generating === 'implementation' || ideationFrameworks.length === 0}
                    className="flex items-center gap-2"
                  >
                    {generating === 'implementation' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Implementing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Implement Frameworks on My Idea
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

const UserResearchPage = ({ ideas, onUpdate }: any) => {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [savedUserPains, setSavedUserPains] = useState<any[]>([]);
  const [userResearchInsights, setUserResearchInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing data from database
  const loadExistingData = async (ideaId: string) => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('idea_documents')
        .select('*')
        .eq('idea_id', ideaId)
        .in('document_type', ['user_pains', 'user_research_insights']);

      if (error) throw error;

      if (data) {
        const pains = data.find(doc => doc.document_type === 'user_pains');
        const insights = data.find(doc => doc.document_type === 'user_research_insights');

        if (pains) setSavedUserPains(pains.content || []);
        if (insights) setUserResearchInsights(insights.content);
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save user research insights
  const saveUserResearchInsights = async (formData: any) => {
    if (!selectedIdea) return;
    
    try {
      setSaving(true);
      
      // Get current user ID
      const { data: { user } } = await (supabase as any).auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Current user ID:', user.id);
      console.log('Selected idea ID:', selectedIdea.id);
      console.log('Selected idea submitted_by:', selectedIdea.submitted_by);

      const insights = {
        idea_title: selectedIdea.title,
        saved_date: new Date().toISOString(),
        ...formData
      };
      
      // First, try to delete any existing document of this type for this idea
      // This avoids upsert constraint issues
      const { error: deleteError } = await (supabase as any)
        .from('idea_documents')
        .delete()
        .eq('idea_id', selectedIdea.id)
        .eq('document_type', 'user_research_insights');

      if (deleteError) {
        console.log('Delete existing document error (this is usually OK):', deleteError);
      }

      // Now insert the new document
      const { data, error } = await (supabase as any)
        .from('idea_documents')
        .insert({
          idea_id: selectedIdea.id,
          document_type: 'user_research_insights',
          content: insights,
          created_by: user.id,
          updated_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Insert error details:', error);
        throw error;
      }

      // Update local state
      setUserResearchInsights(insights);
      
      // Show success message
      console.log('User research insights saved successfully!');
      
      // Set success state
      setSaveSuccess(true);
      
      // Optionally refresh the data
      await loadExistingData(selectedIdea.id);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
        
    } catch (error) {
      console.error('Error saving user research insights:', error);
      // Show detailed error information
      if (error && typeof error === 'object' && 'message' in error) {
        alert(`Error saving research insights: ${error.message}\n\nCode: ${(error as any).code}\nDetails: ${(error as any).details}`);
      } else {
        alert('Error saving research insights. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Load data when idea is selected
  useEffect(() => {
    if (selectedIdea) {
      loadExistingData(selectedIdea.id);
    }
  }, [selectedIdea]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Research</h2>
          <p className="text-muted-foreground">Research user problems and pain points</p>
        </div>
      </div>

      {/* Idea Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Select Idea to Research
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => {
            const idea = ideas.find(i => i.id === value);
            setSelectedIdea(idea || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an idea to research..." />
            </SelectTrigger>
            <SelectContent>
              {ideas.map((idea: Idea) => (
                <SelectItem key={idea.id} value={idea.id}>
                  {idea.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedIdea && (
        <>
          {/* Section 1: Saved User Pains from Earlier Stages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Pains from Earlier Stages
              </CardTitle>
              <CardDescription>Previously identified user problems and frustrations</CardDescription>
            </CardHeader>
            <CardContent>
              {savedUserPains.length > 0 ? (
                <div className="space-y-4">
                  {savedUserPains.map((pain, index) => (
                    <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h6 className="font-semibold text-red-800">{pain.title}</h6>
                          <p className="text-sm text-red-700">{pain.description}</p>
                          {pain.severity && (
                            <Badge variant="secondary" className="mt-2 bg-red-100 text-red-800">
                              Severity: {pain.severity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No user pains have been identified yet</p>
                  <p className="text-sm text-muted-foreground">User pains will appear here once they are identified in earlier stages</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: User Research Techniques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                User Research Techniques
              </CardTitle>
              <CardDescription>Suggested methods to gather user insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* User Interviews */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h6 className="font-semibold text-blue-800">User Interviews</h6>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">One-on-one conversations to understand user needs and pain points</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">15-30 min</Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">5-10 users</Badge>
                  </div>
                </div>

                {/* Surveys */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                    <h6 className="font-semibold text-green-800">Online Surveys</h6>
                  </div>
                  <p className="text-sm text-green-700 mb-3">Structured questionnaires to gather quantitative insights</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">5-10 min</Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">50+ responses</Badge>
                  </div>
                </div>

                {/* Observation */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="h-6 w-6 text-purple-600" />
                    <h6 className="font-semibold text-purple-800">User Observation</h6>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">Watch users interact with current solutions</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">30-60 min</Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">3-5 sessions</Badge>
                  </div>
                </div>

                {/* Focus Groups */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-orange-600" />
                    <h6 className="font-semibold text-orange-800">Focus Groups</h6>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">Group discussions to explore ideas and reactions</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">60-90 min</Badge>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">6-8 users</Badge>
                  </div>
                </div>

                {/* Analytics */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                    <h6 className="font-semibold text-indigo-800">Analytics Review</h6>
                  </div>
                  <p className="text-sm text-indigo-700 mb-3">Analyze existing data and user behavior patterns</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">2-4 hours</Badge>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">Data-driven</Badge>
                  </div>
                </div>

                {/* Social Listening */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageCircle className="h-6 w-6 text-pink-600" />
                    <h6 className="font-semibold text-pink-800">Social Listening</h6>
                  </div>
                  <p className="text-sm text-pink-700 mb-3">Monitor online conversations and feedback</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800 text-xs">Ongoing</Badge>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800 text-xs">Public data</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Share User Research Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Share Your User Research Insights
              </CardTitle>
              <CardDescription>Capture and share what you've learned about your users</CardDescription>
            </CardHeader>
            <CardContent>
              {userResearchInsights ? (
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Research Insights for: {userResearchInsights.idea_title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Saved on: {new Date(userResearchInsights.saved_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Display saved insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 text-blue-700">User Profile</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Target Users:</label>
                          <p className="text-sm bg-blue-50 p-3 rounded-lg">{userResearchInsights.targetUsers || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Typical User:</label>
                          <p className="text-sm bg-blue-50 p-3 rounded-lg">{userResearchInsights.typicalUser || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-3 text-red-700">Problems & Pain Points</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Main Problems:</label>
                          <p className="text-sm bg-red-50 p-3 rounded-lg">{userResearchInsights.mainProblems || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Most Urgent Problem:</label>
                          <p className="text-sm bg-red-50 p-3 rounded-lg">{userResearchInsights.mostUrgentProblem || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 text-green-700">Current Solutions</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">What They Do Now:</label>
                          <p className="text-sm bg-green-50 p-3 rounded-lg">{userResearchInsights.currentSolutions || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Dislikes About Current Solutions:</label>
                          <p className="text-sm bg-green-50 p-3 rounded-lg">{userResearchInsights.dislikesCurrentSolutions || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-3 text-purple-700">Evidence & Insights</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">How You Know:</label>
                          <p className="text-sm bg-purple-50 p-3 rounded-lg">{userResearchInsights.howYouKnow || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">User Quotes/Stories:</label>
                          <p className="text-sm bg-purple-50 p-3 rounded-lg">{userResearchInsights.userQuotes || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 text-orange-700">User Needs & Expectations</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">What They Expect:</label>
                          <p className="text-sm bg-orange-50 p-3 rounded-lg">{userResearchInsights.userExpectations || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">What Would Excite Them:</label>
                          <p className="text-sm bg-orange-50 p-3 rounded-lg">{userResearchInsights.whatWouldExciteThem || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-3 text-indigo-700">Adoption & Research</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Adoption Barriers:</label>
                          <p className="text-sm bg-indigo-50 p-3 rounded-lg">{userResearchInsights.adoptionBarriers || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Research Sources:</label>
                          <p className="text-sm bg-indigo-50 p-3 rounded-lg">{userResearchInsights.researchSources || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Research Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 text-pink-700">Research Details</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">People Talked To:</label>
                          <p className="text-sm bg-pink-50 p-3 rounded-lg">{userResearchInsights.peopleTalkedTo || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Research Methods Used:</label>
                          <p className="text-sm bg-pink-50 p-3 rounded-lg">{userResearchInsights.researchMethods || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setUserResearchInsights(null)} 
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Research Insights
                    </Button>
                  </div>
                </div>
              ) : (
                <UserResearchForm onSubmit={saveUserResearchInsights} saving={saving} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Research insights saved successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
};

// User Research Form Component
const UserResearchForm = ({ onSubmit, saving }: { onSubmit: (data: any) => void, saving: boolean }) => {
  const [formData, setFormData] = useState({
    targetUsers: '',
    typicalUser: '',
    mainProblems: '',
    mostUrgentProblem: '',
    currentSolutions: '',
    dislikesCurrentSolutions: '',
    howYouKnow: '',
    userQuotes: '',
    userExpectations: '',
    whatWouldExciteThem: '',
    adoptionBarriers: '',
    researchSources: '',
    peopleTalkedTo: '',
    researchMethods: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: Who are your users? */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h5 className="font-semibold text-blue-800 text-lg mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Step 1: Who are your users?
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Who do you think will use this idea?
            </label>
            <textarea
              value={formData.targetUsers}
              onChange={(e) => handleChange('targetUsers', e.target.value)}
              placeholder="Describe in simple terms — e.g., students, small shop owners, parents."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Describe in simple terms — e.g., students, small shop owners, parents.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Can you describe a "typical" user in a few words?
            </label>
            <textarea
              value={formData.typicalUser}
              onChange={(e) => handleChange('typicalUser', e.target.value)}
              placeholder="Age, occupation, habits, tech comfort level."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Age, occupation, habits, tech comfort level.</p>
          </div>
        </div>
      </div>

      {/* Step 2: What problems do they face? */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h5 className="font-semibold text-red-800 text-lg mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Step 2: What problems do they face?
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What are the main problems or frustrations they have?
            </label>
            <textarea
              value={formData.mainProblems}
              onChange={(e) => handleChange('mainProblems', e.target.value)}
              placeholder="List the key problems your users experience..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">List the key problems your users experience</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Which of these problems is the most urgent or painful for them?
            </label>
            <textarea
              value={formData.mostUrgentProblem}
              onChange={(e) => handleChange('mostUrgentProblem', e.target.value)}
              placeholder="Describe the most critical problem..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Describe the most critical problem</p>
          </div>
        </div>
      </div>

      {/* Step 3: How do they solve it today? */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h5 className="font-semibold text-green-800 text-lg mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Step 3: How do they solve it today?
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What are they doing right now to deal with this problem?
            </label>
            <textarea
              value={formData.currentSolutions}
              onChange={(e) => handleChange('currentSolutions', e.target.value)}
              placeholder="Any apps, tools, or workarounds they currently use..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Any apps, tools, or workarounds they currently use</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What do they dislike about these current solutions?
            </label>
            <textarea
              value={formData.dislikesCurrentSolutions}
              onChange={(e) => handleChange('dislikesCurrentSolutions', e.target.value)}
              placeholder="What frustrates them about existing solutions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">What frustrates them about existing solutions</p>
          </div>
        </div>
      </div>

      {/* Step 4: Evidence & Insights */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h5 className="font-semibold text-purple-800 text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Step 4: Evidence & Insights
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              How do you know these are their problems?
            </label>
            <textarea
              value={formData.howYouKnow}
              onChange={(e) => handleChange('howYouKnow', e.target.value)}
              placeholder="E.g., you spoke to them, saw them struggle, read feedback, personal experience."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">E.g., you spoke to them, saw them struggle, read feedback, personal experience</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Can you share any quotes, examples, or stories from real users?
            </label>
            <textarea
              value={formData.userQuotes}
              onChange={(e) => handleChange('userQuotes', e.target.value)}
              placeholder="Share specific user feedback or stories..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Share specific user feedback or stories</p>
          </div>
        </div>
      </div>

      {/* Step 5: User Needs & Expectations */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h5 className="font-semibold text-orange-800 text-lg mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Step 5: User Needs & Expectations
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What do users expect or hope a solution like yours could do?
            </label>
            <textarea
              value={formData.userExpectations}
              onChange={(e) => handleChange('userExpectations', e.target.value)}
              placeholder="What functionality or benefits do they expect..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">What functionality or benefits do they expect</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What would make them excited to try it?
            </label>
            <textarea
              value={formData.whatWouldExciteThem}
              onChange={(e) => handleChange('whatWouldExciteThem', e.target.value)}
              placeholder="What features or benefits would excite them..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">What features or benefits would excite them</p>
          </div>
        </div>
      </div>

      {/* Step 6: Adoption Barriers & Research Sources */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h5 className="font-semibold text-indigo-800 text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Step 6: Adoption & Research
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What might stop them from trying or sticking with your solution?
            </label>
            <textarea
              value={formData.adoptionBarriers}
              onChange={(e) => handleChange('adoptionBarriers', e.target.value)}
              placeholder="E.g., cost, learning curve, trust, competition..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">E.g., cost, learning curve, trust, competition</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Where did you get your information?
            </label>
            <textarea
              value={formData.researchSources}
              onChange={(e) => handleChange('researchSources', e.target.value)}
              placeholder="Surveys, interviews, observation, online research, etc."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Surveys, interviews, observation, online research, etc.</p>
          </div>
        </div>
      </div>

      {/* Additional Research Information */}
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
        <h5 className="font-semibold text-pink-800 text-lg mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Additional Research Information (Optional but Valuable)
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              How many people have you talked to about this idea?
            </label>
            <textarea
              value={formData.peopleTalkedTo}
              onChange={(e) => handleChange('peopleTalkedTo', e.target.value)}
              placeholder="Number of people and their roles..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">Number of people and their roles</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What research methods did you use?
            </label>
            <textarea
              value={formData.researchMethods}
              onChange={(e) => handleChange('researchMethods', e.target.value)}
              placeholder="Specific methods, tools, or approaches used..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">Specific methods, tools, or approaches used</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button 
          type="submit" 
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 text-lg"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving Research Insights...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save All Research Insights
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

const CompetitorAnalysisPage = ({ ideas, onUpdate }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Competitor Analysis</h2>
        <p className="text-muted-foreground">Analyze competitors and market positioning</p>
      </div>
    </div>
    <div className="grid gap-4">
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Competitor analysis tools and frameworks will be available here.</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const MarketAnalysisPage = ({ ideas, onUpdate }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Market Analysis</h2>
        <p className="text-muted-foreground">Analyze market size, TAM, SAM, and SOM</p>
      </div>
    </div>
    <div className="grid gap-4">
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Market analysis tools and calculators will be available here.</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export const RoleBasedDashboard = () => {
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading, getRoleDisplayName } = useUserRole();
  const { roles: availableRoles } = useRoles();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'basic_validation', label: 'Basic Validation' },
    { value: 'tech_validation', label: 'Tech Validation' },
    { value: 'leadership_pitch', label: 'Leadership Pitch' },
    { value: 'mvp', label: 'MVP' },
    { value: 'rejected', label: 'Rejected' },
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

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <RoleBasedSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} role={role} />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <div className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">IdeaLabs Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email || 'User'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3 w-3" />
                {roleLoading ? 'Loading...' : (role ? getRoleDisplayName(role) : 'No Role')}
              </Badge>
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<OverviewPage ideas={ideas} stats={stats} manageableIdeas={manageableIdeas} myIdeas={myIdeas} role={role} onUpdate={fetchIdeas} />} />
            <Route path="/all-ideas" element={<AllIdeasPage ideas={ideas} onUpdate={fetchIdeas} />} />
            {role === 'employee' && <Route path="/my-ideas" element={<MyIdeasPage ideas={myIdeas} onUpdate={fetchIdeas} />} />}
            {role === 'product_expert' && <Route path="/discovery" element={<DiscoveryPage ideas={ideas.filter(i => i.stage === 'discovery')} onUpdate={fetchIdeas} />} />}
            {role === 'product_expert' && <Route path="/basic-validation" element={<BasicValidationPage ideas={ideas.filter(i => i.stage === 'basic_validation')} onUpdate={fetchIdeas} />} />}
            {role === 'tech_expert' && <Route path="/tech-validation" element={<TechValidationPage ideas={ideas.filter(i => i.stage === 'tech_validation')} onUpdate={fetchIdeas} />} />}
            {role === 'leader' && <Route path="/leadership-pitch" element={<LeadershipPitchPage ideas={ideas.filter(i => i.stage === 'leadership_pitch')} onUpdate={fetchIdeas} />} />}
            {role === 'leader' && <Route path="/mvp" element={<MVPPage ideas={ideas.filter(i => i.stage === 'mvp')} onUpdate={fetchIdeas} />} />}
            <Route path="/ai" element={<AIModePage />} />
            <Route path="/submit" element={<IdeaSubmissionForm isOpen={true} setIsOpen={() => {}} onClose={() => navigate('/')} onSuccess={fetchIdeas} />} />
            <Route path="/validation" element={<IdeaValidationPage ideas={ideas} onUpdate={fetchIdeas} />} />
            <Route path="/user-research" element={<UserResearchPage ideas={ideas} onUpdate={fetchIdeas} />} />
            <Route path="/competitors" element={<CompetitorAnalysisPage ideas={ideas} onUpdate={fetchIdeas} />} />
            <Route path="/market" element={<MarketAnalysisPage ideas={ideas} onUpdate={fetchIdeas} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Idea Submission Dialog */}
      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <IdeaSubmissionForm isOpen={showSubmissionForm} setIsOpen={setShowSubmissionForm} onClose={() => setShowSubmissionForm(false)} onSuccess={fetchIdeas} />
      </Dialog>
    </div>
  );
};