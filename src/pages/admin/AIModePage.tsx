import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Sparkles, TrendingUp, Lightbulb, Brain, Zap, Search, Settings, Presentation, Rocket, Users, Target, BarChart3, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateOnePagerWithAI, generateFullPRDWithAI } from './ai-openai';

interface Idea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience?: string;
  stage: 'discovery' | 'basic_validation' | 'tech_validation' | 'leadership_pitch' | 'mvp' | 'rejected';
  created_at: string;
  category: string;
  tags: string[] | null;
  submitted_by: string;
}

export const AIModePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [prdOnePager, setPrdOnePager] = useState('');
  const [prdFull, setPrdFull] = useState('');
  const [isOnePagerSaved, setIsOnePagerSaved] = useState(false);
  const [isFullPrdSaved, setIsFullPrdSaved] = useState(false);
  const [relevantIdeas, setRelevantIdeas] = useState<Idea[]>([]);
  const [userProblems, setUserProblems] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [marketTAM, setMarketTAM] = useState('');
  const [marketSAM, setMarketSAM] = useState('');
  const [marketSOM, setMarketSOM] = useState('');
  const [gtm, setGtm] = useState('');

  // AI PRD generation flags
  const [loadingOnePager, setLoadingOnePager] = useState(false);
  const [loadingFullPrd, setLoadingFullPrd] = useState(false);

  // Optional free-form AI query
  const [aiQuery, setAiQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoadingIdeas(true);
        const { data } = await supabase
          .from('ideas')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setIdeas(data as unknown as Idea[]);
      } finally {
        setLoadingIdeas(false);
      }
    };
    fetchIdeas();
  }, []);

  const handleAIAnalysis = async () => {
    if (!aiQuery.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiResponse(
        `AI Analysis for: "${aiQuery}"
\nBased on the current data and patterns, here are some insights:
\n1. Trend Analysis: The query suggests potential areas for innovation
2. Market Opportunity: This could align with current market demands
3. Resource Requirements: Estimated development timeline and resources needed
4. Risk Assessment: Potential challenges and mitigation strategies`
      );
      setIsAnalyzing(false);
    }, 1200);
  };

  // Basic generators used for previews and non-AI sections
  const generateRelevantIdeas = (idea: Idea, allIdeas: Idea[]) => {
    const baseTags = new Set((idea.tags || []).map(t => t.toLowerCase()));
    const similar = allIdeas
      .filter(i => i.id !== idea.id)
      .map(i => ({
        idea: i,
        score:
          (i.category === idea.category ? 2 : 0) +
          (i.tags || []).reduce((acc, t) => acc + (baseTags.has(t.toLowerCase()) ? 1 : 0), 0),
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(x => x.idea);
    return similar;
  };

  const generateUserProblems = (idea: Idea) => {
    return [
      `Users struggle with ${idea.problem_statement.toLowerCase()}`,
      'Lack of visibility and feedback loops',
      'Manual handoffs causing delays and errors',
      'Tools are fragmented and non-intuitive for end users',
    ];
  };

  const generateCompetitors = (idea: Idea) => {
    const tagHints = (idea.tags || []).map(t => t.toLowerCase());
    const base = ['Internal Tools', 'Spreadsheet Workflows'];
    if (tagHints.includes('ai')) base.push('OpenAI Assistants');
    if (tagHints.includes('product')) base.push('Productboard');
    if (tagHints.includes('process')) base.push('Asana');
    if (tagHints.includes('service')) base.push('Zendesk');
    return Array.from(new Set(base));
  };

  const marketCalc = useMemo(() => {
    if (!selectedIdea) return null;
    const base = Math.max(5, selectedIdea.title.length + selectedIdea.problem_statement.length);
    const tam = base * 10;
    const sam = Math.round(tam * 0.3);
    const som = Math.round(sam * 0.25);
    return { base, tam, sam, som };
  }, [selectedIdea]);

  const generateMarketNumbers = (idea: Idea) => {
    const base = Math.max(5, idea.title.length + idea.problem_statement.length);
    const tam = base * 10;
    const sam = Math.round(tam * 0.3);
    const som = Math.round(sam * 0.25);
    setMarketTAM(`~$${tam}M`);
    setMarketSAM(`~$${sam}M`);
    setMarketSOM(`~$${som}M`);
  };

  const generateGTM = (idea: Idea) => {
    return (
      `ICP: Teams facing ${idea.problem_statement.toLowerCase()}
Channels: Product-led growth, internal evangelists, case studies
Messaging: Solve "${idea.problem_statement}" with ${idea.title}
Playbook: Beta with champions → Public launch → Land-and-expand`
    );
  };

  // Fetch existing PRD content for selected idea
  const loadExistingPRD = async (idea: Idea) => {
    try {
      // Try fetching existing PRD documents from the new idea_documents table
      const { data: documents, error } = await (supabase as any)
        .from('idea_documents')
        .select('*')
        .eq('idea_id', idea.id)
        .in('document_type', ['prd_one_pager', 'prd_full'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      // Find the latest one pager and full PRD
      const onePagerDoc = documents?.find(d => d.document_type === 'prd_one_pager');
      const fullPrdDoc = documents?.find(d => d.document_type === 'prd_full');

      if (onePagerDoc?.content) {
        setPrdOnePager(onePagerDoc.content);
        setIsOnePagerSaved(true);
      } else {
        setPrdOnePager('');
        setIsOnePagerSaved(false);
      }

      if (fullPrdDoc?.content) {
        setPrdFull(fullPrdDoc.content);
        setIsFullPrdSaved(true);
      } else {
        setPrdFull('');
        setIsFullPrdSaved(false);
      }
    } catch (e: any) {
      console.error('Document load error:', e);
      toast({ title: 'Failed to load documents', description: 'Error loading from database', variant: 'destructive' });
    }
  };

  const regenerateOnePager = async () => {
    if (!selectedIdea) return;
    const idea = selectedIdea;
    const inputs = {
      title: idea.title,
      description: idea.description,
      problem: idea.problem_statement,
      audience: idea.target_audience,
      category: idea.category,
      tags: idea.tags || [],
    };
    try {
      setLoadingOnePager(true);
      const text = await generateOnePagerWithAI(inputs);
      setPrdOnePager(text);
      setIsOnePagerSaved(false); // Reset saved status when regenerating
      toast({ title: 'One Pager generated successfully! Click Save to store it in the database.' });
    } catch (e: any) {
      toast({ title: 'Failed to generate', description: e.message || 'Error', variant: 'destructive' });
    } finally {
      setLoadingOnePager(false);
    }
  };

  const regenerateFullPRD = async () => {
    if (!selectedIdea) return;
    const idea = selectedIdea;
    const inputs = {
      title: idea.title,
      description: idea.description,
      problem: idea.problem_statement,
      audience: idea.target_audience,
      category: idea.category,
      tags: idea.tags || [],
    };
    try {
      setLoadingFullPrd(true);
      const text = await generateFullPRDWithAI(inputs);
      setPrdFull(text);
      setIsFullPrdSaved(false); // Reset saved status when regenerating
      toast({ title: 'Full PRD generated successfully! Click Save to store it in the database.' });
    } catch (e: any) {
      toast({ title: 'Failed to generate', description: e.message || 'Error', variant: 'destructive' });
    } finally {
      setLoadingFullPrd(false);
    }
  };

  const onSelectIdea = (id: string) => {
    setSelectedIdeaId(id);
    const idea = ideas.find(i => i.id === id) || null;
    setSelectedIdea(idea);
    if (idea) {
      // Load existing PRD from database
      loadExistingPRD(idea);
      // Generate non-PRD sections locally
      setIsGenerating(true);
      setTimeout(() => {
        setRelevantIdeas(generateRelevantIdeas(idea, ideas));
        setUserProblems(generateUserProblems(idea));
        setCompetitors(generateCompetitors(idea));
        generateMarketNumbers(idea);
        setGtm(
          `ICP: Teams facing ${idea.problem_statement.toLowerCase()}
Channels: Product-led growth, internal evangelists, case studies
Messaging: Solve "${idea.problem_statement}" with ${idea.title}
Playbook: Beta with champions → Public launch → Land-and-expand`
        );
        setIsGenerating(false);
      }, 200);
    } else {
      setPrdOnePager('');
      setPrdFull('');
      setIsOnePagerSaved(false);
      setIsFullPrdSaved(false);
      setRelevantIdeas([]);
      setUserProblems([]);
      setCompetitors([]);
      setMarketTAM('');
      setMarketSAM('');
      setMarketSOM('');
      setGtm('');
    }
  };

  const recentInsights = [
    { type: 'Trend', message: 'Technology ideas trending upward by 23% this quarter', confidence: 'High' },
    { type: 'Opportunity', message: 'Process improvement ideas show high potential ROI', confidence: 'Medium' },
    { type: 'Risk', message: 'Service product ideas need additional validation', confidence: 'High' },
  ];

  const disabledCardClasses = !selectedIdea ? 'opacity-60 pointer-events-none' : 'cursor-pointer hover:shadow-md transition-shadow';

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center gap-3">
         <div className="p-2 bg-primary/10 rounded-lg">
           <Bot className="h-8 w-8 text-primary" />
         </div>
         <div>
           <h1 className="text-3xl font-bold">AI Mode</h1>
           <p className="text-muted-foreground">Leverage AI to generate product docs and insights</p>
           {selectedIdea && (
             <div className="flex items-center gap-2 mt-2">
               <Badge variant="secondary" className="text-xs">
                 Current Stage: {selectedIdea.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
               </Badge>
               <span className="text-xs text-muted-foreground">
                 {selectedIdea.stage === 'discovery' && 'Initial idea exploration and research'}
                 {selectedIdea.stage === 'basic_validation' && 'Market research and basic feasibility'}
                 {selectedIdea.stage === 'tech_validation' && 'Technical feasibility and architecture review'}
                 {selectedIdea.stage === 'leadership_pitch' && 'Presenting to leadership for approval'}
                 {selectedIdea.stage === 'mvp' && 'Minimum viable product development'}
               </span>
             </div>
           )}
         </div>
       </div>

      {/* Idea Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Idea Filter
          </CardTitle>
          <CardDescription>Select an idea to auto-generate all sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select value={selectedIdeaId} onValueChange={onSelectIdea}>
              <SelectTrigger className="w-full sm:w-[420px]">
                <SelectValue placeholder={loadingIdeas ? 'Loading ideas...' : 'Choose an idea'} />
              </SelectTrigger>
              <SelectContent>
                {ideas.map((i) => (
                  <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedIdea && (
              <Badge variant="secondary">{selectedIdea.category}</Badge>
            )}
            {isGenerating && (
              <div className="text-sm text-muted-foreground">Generating content...</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stage Tabs */}
      <Tabs defaultValue="discovery" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="discovery" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>Discovery</span>
            <Badge variant={selectedIdea?.stage === 'discovery' ? 'default' : 'outline'} className="text-xs">1</Badge>
          </TabsTrigger>
          <TabsTrigger value="basic_validation" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Basic Validation</span>
            <Badge variant={selectedIdea?.stage === 'basic_validation' ? 'default' : 'outline'} className="text-xs">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="tech_feasibility" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Tech Feasibility</span>
            <Badge variant={selectedIdea?.stage === 'tech_validation' ? 'default' : 'outline'} className="text-xs">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="leadership_pitch" className="flex items-center gap-2">
            <Presentation className="h-4 w-4" />
            <span>Leadership Pitch</span>
            <Badge variant={selectedIdea?.stage === 'leadership_pitch' ? 'default' : 'outline'} className="text-xs">4</Badge>
          </TabsTrigger>
          <TabsTrigger value="mvp" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span>MVP</span>
            <Badge variant={selectedIdea?.stage === 'mvp' ? 'default' : 'outline'} className="text-xs">5</Badge>
          </TabsTrigger>
        </TabsList>
        
        {/* Stage Progress Indicator */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Stage Progress:</span>
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${selectedIdea?.stage === 'discovery' ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`w-3 h-3 rounded-full ${selectedIdea?.stage === 'basic_validation' ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`w-3 h-3 rounded-full ${selectedIdea?.stage === 'tech_validation' ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`w-3 h-3 rounded-full ${selectedIdea?.stage === 'leadership_pitch' ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`w-3 h-3 rounded-full ${selectedIdea?.stage === 'mvp' ? 'bg-primary' : 'bg-muted'}`}></div>
            </div>
            <span className="text-xs">
              {selectedIdea ? `Current: ${selectedIdea.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'Select an idea to see progress'}
            </span>
          </div>
        </div>
        
        {/* Stage Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              {selectedIdea && (selectedIdea.stage === 'basic_validation' || selectedIdea.stage === 'tech_validation' || selectedIdea.stage === 'leadership_pitch' || selectedIdea.stage === 'mvp') && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="font-medium">Discovery</span>
            <span>Initial idea exploration and research</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Search className="h-4 w-4 text-yellow-500" />
              {selectedIdea && (selectedIdea.stage === 'tech_validation' || selectedIdea.stage === 'leadership_pitch' || selectedIdea.stage === 'mvp') && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="font-medium">Basic Validation</span>
            <span>Market research and feasibility</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Settings className="h-4 w-4 text-orange-500" />
              {selectedIdea && (selectedIdea.stage === 'leadership_pitch' || selectedIdea.stage === 'mvp') && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="font-medium">Tech Feasibility</span>
            <span>Technical assessment</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Presentation className="h-4 w-4 text-purple-500" />
              {selectedIdea && selectedIdea.stage === 'mvp' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="font-medium">Leadership Pitch</span>
            <span>Executive approval</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Rocket className="h-4 w-4 text-green-500" />
              {selectedIdea && selectedIdea.stage === 'mvp' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="font-medium">MVP</span>
            <span>Product development</span>
          </div>
        </div>

        {/* Discovery Tab: PRDs */}
        <TabsContent value="discovery" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                         <Card>
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <div>
                     <CardTitle className="flex items-center gap-2">
                       <FileText className="h-5 w-5 text-blue-600" />
                       <span>PRD — One Pager</span>
                       <Badge variant="outline" className="text-xs">Step 1.1</Badge>
                       {isOnePagerSaved && (
                         <Badge variant="secondary" className="text-xs">Saved</Badge>
                       )}
                     </CardTitle>
                     <CardDescription>
                       {prdOnePager 
                         ? (isOnePagerSaved ? 'Generated and saved to database' : 'Generated - click Save to store in database')
                         : 'Click Generate to create One Pager'
                       }
                     </CardDescription>
                   </div>
                  <div className="flex gap-2">
                    {!prdOnePager && (
                      <Button 
                        size="sm" 
                        onClick={regenerateOnePager} 
                        disabled={!selectedIdea || loadingOnePager}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loadingOnePager ? 'Generating...' : 'Generate'}
                      </Button>
                    )}
                    {prdOnePager && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={regenerateOnePager} 
                          disabled={!selectedIdea || loadingOnePager}
                        >
                          {loadingOnePager ? 'Regenerating...' : 'Regenerate'}
                        </Button>
                        {!isOnePagerSaved && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={async () => {
                              if (selectedIdea && prdOnePager) {
                                try {
                                  await (supabase as any)
                                    .from('idea_documents')
                                    .upsert({
                                      idea_id: selectedIdea.id,
                                      document_type: 'prd_one_pager',
                                      content: prdOnePager,
                                      title: 'One Pager PRD',
                                      description: 'AI-generated one-page product requirements document',
                                      is_ai_generated: true,
                                      ai_model: 'openai',
                                      created_by: user?.id || '',
                                      status: 'draft'
                                    }, { 
                                      onConflict: 'idea_id,document_type,version'
                                    });
                                  setIsOnePagerSaved(true);
                                  toast({ title: 'One Pager saved successfully!' });
                                } catch (error) {
                                  console.error('Save error:', error);
                                  toast({ title: 'Failed to save', description: 'Error saving to database', variant: 'destructive' });
                                }
                              }
                            }}
                          >
                            Save
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {prdOnePager ? (
                  <div className="space-y-3">
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/40 p-3 rounded max-h-[300px] overflow-auto">{prdOnePager}</pre>
                    <div className="text-xs text-muted-foreground">
                      Generated on: {new Date().toLocaleDateString()}
                      {isOnePagerSaved && ' • Saved to database'}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-3">
                      {selectedIdea ? 'No One Pager generated yet' : 'Select an idea first'}
                    </p>
                    {selectedIdea && (
                      <Button 
                        size="sm" 
                        onClick={regenerateOnePager} 
                        disabled={loadingOnePager}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loadingOnePager ? 'Generating...' : 'Generate One Pager'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

                         {/* Trend Insights Card */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="h-5 w-5" />
                   <span>Market Trends & Insights</span>
                   <Badge variant="outline" className="text-xs">Step 1.2</Badge>
                 </CardTitle>
                 <CardDescription>
                   AI-powered analysis of current market trends and opportunities
                 </CardDescription>
               </CardHeader>
              <CardContent>
                {selectedIdea ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Growing Market Demand</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <Zap className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Technology Maturity</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Innovation Opportunity</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Based on {selectedIdea.category} industry analysis
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Select an idea to view market trends
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

                     {/* Relevant Products Section */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Lightbulb className="h-5 w-5" />
                 <span>Relevant Internal Products</span>
                 <Badge variant="outline" className="text-xs">Step 1.3</Badge>
               </CardTitle>
               <CardDescription>
                 Existing products and solutions that might be relevant to this idea
               </CardDescription>
             </CardHeader>
            <CardContent>
              {selectedIdea ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Product A</div>
                      <div className="text-xs text-muted-foreground">Similar technology stack</div>
                      <Badge variant="outline" className="text-xs mt-1">Internal</Badge>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Product B</div>
                      <div className="text-xs text-muted-foreground">Target audience overlap</div>
                      <Badge variant="outline" className="text-xs mt-1">Internal</Badge>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Product C</div>
                      <div className="text-xs text-muted-foreground">Market segment alignment</div>
                      <Badge variant="outline" className="text-xs mt-1">Internal</Badge>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">Product D</div>
                      <div className="text-xs text-muted-foreground">Technology integration potential</div>
                      <Badge variant="outline" className="text-xs mt-1">Internal</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {relevantIdeas.length} similar ideas found in the system
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Select an idea to view relevant internal products
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Basic Validation Tab: Remaining sections */}
        <TabsContent value="basic_validation" className="space-y-4">
                     {/* Full PRD moved here */}
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="flex items-center gap-2">
                     <FileText className="h-5 w-5 text-green-600" />
                     <span>PRD — Full PRD</span>
                     <Badge variant="outline" className="text-xs">Step 2.0</Badge>
                     {isFullPrdSaved && (
                       <Badge variant="secondary" className="text-xs">Saved</Badge>
                     )}
                   </CardTitle>
                   <CardDescription>
                     {prdFull 
                       ? (isFullPrdSaved ? 'Generated and saved to database' : 'Generated - click Save to store in database')
                       : 'Click Generate to create Full PRD'
                     }
                   </CardDescription>
                 </div>
                <div className="flex gap-2">
                  {!prdFull && (
                    <Button 
                      size="sm" 
                      onClick={regenerateFullPRD} 
                      disabled={!selectedIdea || loadingFullPrd}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {loadingFullPrd ? 'Generating...' : 'Generate'}
                    </Button>
                  )}
                  {prdFull && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={regenerateFullPRD} 
                        disabled={!selectedIdea || loadingFullPrd}
                      >
                        {loadingFullPrd ? 'Regenerating...' : 'Regenerate'}
                      </Button>
                      {!isFullPrdSaved && (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={async () => {
                            if (selectedIdea && prdFull) {
                              try {
                                await (supabase as any)
                                  .from('idea_documents')
                                  .upsert({
                                    idea_id: selectedIdea.id,
                                    document_type: 'prd_full',
                                    content: prdFull,
                                    title: 'Full PRD',
                                    description: 'AI-generated comprehensive product requirements document',
                                    is_ai_generated: true,
                                    ai_model: 'openai',
                                    created_by: user?.id || '',
                                    status: 'draft'
                                  }, { 
                                    onConflict: 'idea_id,document_type,version'
                                  });
                                setIsFullPrdSaved(true);
                                toast({ title: 'Full PRD saved successfully!' });
                              } catch (error) {
                                console.error('Save error:', error);
                                toast({ title: 'Failed to save', description: 'Error saving to database', variant: 'destructive' });
                              }
                            }
                          }}
                        >
                          Save
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {prdFull ? (
                <div className="space-y-3">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/40 p-3 rounded max-h-[300px] overflow-auto">{prdFull}</pre>
                  <div className="text-xs text-muted-foreground">
                    Generated on: {new Date().toLocaleDateString()}
                    {isFullPrdSaved && ' • Saved to database'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-3">
                    {selectedIdea ? 'No Full PRD generated yet' : 'Select an idea first'}
                  </p>
                  {selectedIdea && (
                    <Button 
                      size="sm" 
                      onClick={regenerateFullPRD} 
                      disabled={loadingFullPrd}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {loadingFullPrd ? 'Generating...' : 'Generate Full PRD'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <Card
               className={disabledCardClasses}
               onClick={() => selectedIdea && navigate(`/ideator/validation?ideaId=${selectedIdea.id}`)}
             >
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Search className="h-5 w-5 text-blue-600" />
                   <span>Idea Validation — Existing Relevant Ideas</span>
                   <Badge variant="outline" className="text-xs">Step 2.1</Badge>
                 </CardTitle>
                 <CardDescription>Click to open details (frameworks + matches)</CardDescription>
               </CardHeader>
               <CardContent>
                 {selectedIdea ? (
                   relevantIdeas.length > 0 ? (
                     <ul className="list-disc pl-5 space-y-1 text-sm">
                       {relevantIdeas.map((ri) => (
                         <li key={ri.id}>
                           <span className="font-medium">{ri.title}</span>
                           <span className="text-muted-foreground"> — {ri.category}</span>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-muted-foreground text-sm">No close matches found.</p>
                   )
                 ) : (
                   <p className="text-muted-foreground text-sm">Select an idea to view similar ideas.</p>
                 )}
               </CardContent>
             </Card>

             <Card
               className={disabledCardClasses}
               onClick={() => selectedIdea && navigate(`/ideator/user-research?ideaId=${selectedIdea.id}`)}
             >
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Users className="h-5 w-5 text-green-600" />
                   <span>User Research — User Problems</span>
                   <Badge variant="outline" className="text-xs">Step 2.2</Badge>
                 </CardTitle>
                 <CardDescription>Click to open details</CardDescription>
               </CardHeader>
               <CardContent>
                 {selectedIdea ? (
                   <ul className="list-disc pl-5 space-y-1 text-sm">
                     {userProblems.map((p, idx) => <li key={idx}>{p}</li>)}
                   </ul>
                 ) : (
                   <p className="text-muted-foreground text-sm">Select an idea to generate user problems.</p>
                 )}
               </CardContent>
             </Card>
           </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <Card
               className={disabledCardClasses}
               onClick={() => selectedIdea && navigate(`/ideator/competitors?ideaId=${selectedIdea.id}`)}
             >
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Target className="h-5 w-5 text-red-600" />
                   <span>Competitor Analysis</span>
                   <Badge variant="outline" className="text-xs">Step 2.3</Badge>
                 </CardTitle>
                 <CardDescription>Click to open detailed analysis</CardDescription>
               </CardHeader>
               <CardContent>
                 {selectedIdea ? (
                   competitors.length > 0 ? (
                     <ul className="list-disc pl-5 space-y-1 text-sm">
                       {competitors.map((c, idx) => <li key={idx}>{c}</li>)}
                     </ul>
                   ) : (
                     <p className="text-muted-foreground text-sm">No obvious competitors detected.</p>
                   )
                 ) : (
                   <p className="text-muted-foreground text-sm">Select an idea to generate competitor analysis.</p>
                 )}
               </CardContent>
             </Card>

             <Card
               className={disabledCardClasses}
               onClick={() => selectedIdea && navigate(`/ideator/market?ideaId=${selectedIdea.id}`)}
             >
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5 text-purple-600" />
                   <span>Market Analysis — TAM / SAM / SOM</span>
                   <Badge variant="outline" className="text-xs">Step 2.4</Badge>
                 </CardTitle>
                 <CardDescription>Click to open calculation details</CardDescription>
               </CardHeader>
               <CardContent>
                 {selectedIdea ? (
                   <div className="grid grid-cols-3 gap-3">
                     <div className="p-3 rounded bg-muted/40">
                       <div className="text-xs text-muted-foreground">TAM</div>
                       <div className="text-lg font-semibold">{marketTAM || '-'}</div>
                     </div>
                     <div className="p-3 rounded bg-muted/40">
                       <div className="text-xs text-muted-foreground">SAM</div>
                       <div className="text-lg font-semibold">{marketSAM || '-'}</div>
                     </div>
                     <div className="p-3 rounded bg-muted/40">
                       <div className="text-xs text-muted-foreground">SOM</div>
                       <div className="text-lg font-semibold">{marketSOM || '-'}</div>
                     </div>
                   </div>
                 ) : (
                   <p className="text-muted-foreground text-sm">Select an idea to estimate TAM/SAM/SOM.</p>
                 )}
               </CardContent>
             </Card>
           </div>

                     <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Rocket className="h-5 w-5 text-orange-600" />
                 <span>GTM</span>
                 <Badge variant="outline" className="text-xs">Step 2.5</Badge>
               </CardTitle>
               <CardDescription>Launch strategy and messaging</CardDescription>
             </CardHeader>
             <CardContent>
               {selectedIdea ? (
                 gtm ? (
                   <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/40 p-3 rounded">{gtm}</pre>
                 ) : (
                   <p className="text-muted-foreground text-sm">Generating GTM...</p>
                 )
               ) : (
                 <p className="text-muted-foreground text-sm">Select an idea to generate GTM.</p>
               )}
             </CardContent>
           </Card>
        </TabsContent>

        {/* Tech Feasibility */}
        <TabsContent value="tech_feasibility">
          <Card>
            <CardHeader>
              <CardTitle>Tech Feasibility</CardTitle>
              <CardDescription>Technical assessment and constraints</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leadership_pitch">
          <Card>
            <CardHeader>
              <CardTitle>Leadership Pitch</CardTitle>
              <CardDescription>Executive summary and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mvp">
          <Card>
            <CardHeader>
              <CardTitle>MVP</CardTitle>
              <CardDescription>Scope, success metrics, and rollout</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Optional: Free-form AI Query and recent insights retained */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Analysis
            </CardTitle>
            <CardDescription>Ask AI to analyze ideas, trends, or provide insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ask AI anything about ideas, trends, or insights..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="min-h-[120px]"
            />
            <Button onClick={handleAIAnalysis} disabled={!aiQuery.trim() || isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Response
            </CardTitle>
            <CardDescription>AI-generated insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {aiResponse ? (
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono">{aiResponse}</pre>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ask AI a question to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent AI Insights
          </CardTitle>
          <CardDescription>Latest AI-generated insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant={insight.type === 'Risk' ? 'destructive' : insight.type === 'Opportunity' ? 'default' : 'secondary'}>
                    {insight.type}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{insight.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <Badge variant="outline" className="text-xs">{insight.confidence}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
