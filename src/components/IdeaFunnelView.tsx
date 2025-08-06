import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  Search, 
  Settings, 
  Presentation, 
  Rocket,
  Calendar,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  description: string;
  stage: 'discovery' | 'basic_validation' | 'tech_validation' | 'leadership_pitch' | 'mvp';
  created_at: string;
  category: string;
  tags: string[];
}

interface IdeaFunnelViewProps {
  ideas: Idea[];
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
  }
};

export const IdeaFunnelView = ({ ideas }: IdeaFunnelViewProps) => {
  const getIdeasByStage = (stage: keyof typeof stageConfig) => {
    return ideas.filter(idea => idea.stage === stage);
  };

  const getStageProgress = (stage: keyof typeof stageConfig) => {
    const stageIdeas = getIdeasByStage(stage);
    const totalIdeas = ideas.length;
    return totalIdeas > 0 ? (stageIdeas.length / totalIdeas) * 100 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Funnel Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Idea Pipeline Overview
          </CardTitle>
          <CardDescription>
            Track your ideas through the 5-stage validation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(stageConfig).map(([stage, config]) => {
              const stageIdeas = getIdeasByStage(stage as keyof typeof stageConfig);
              const progress = getStageProgress(stage as keyof typeof stageConfig);
              const IconComponent = config.icon;
              
              return (
                <div key={stage} className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full ${config.color} flex items-center justify-center mb-3`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{config.label}</h4>
                  <p className="text-2xl font-bold mb-2">{stageIdeas.length}</p>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {progress.toFixed(0)}% of total
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Staged Tabs */}
      <Tabs defaultValue="discovery" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(stageConfig).map(([stage, config]) => {
            const count = getIdeasByStage(stage as keyof typeof stageConfig).length;
            return (
              <TabsTrigger key={stage} value={stage} className="text-xs">
                {config.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(stageConfig).map(([stage, config]) => {
          const stageIdeas = getIdeasByStage(stage as keyof typeof stageConfig);
          
          return (
            <TabsContent key={stage} value={stage} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <config.icon className={`h-6 w-6 text-white p-1 rounded ${config.color}`} />
                <div>
                  <h3 className="text-lg font-semibold">{config.label}</h3>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>

              {stageIdeas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <config.icon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No ideas in {config.label}</h4>
                    <p className="text-muted-foreground text-center">
                      Your ideas will appear here when they reach this stage
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stageIdeas.map((idea) => (
                    <Card key={idea.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base line-clamp-2">{idea.title}</CardTitle>
                          <Badge variant="secondary" className={`${config.color} text-white ml-2`}>
                            {config.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {idea.description}
                        </p>
                        
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

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Comments
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Updates
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};