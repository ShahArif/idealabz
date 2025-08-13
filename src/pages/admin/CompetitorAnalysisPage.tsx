import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { generateCompetitors } from './ai-utils';

interface Idea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience?: string;
  category: string;
  tags: string[] | null;
}

export const CompetitorAnalysisPage = () => {
  const [params] = useSearchParams();
  const ideaId = params.get('ideaId');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!ideaId) return;
      setLoading(true);
      const { data } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single();
      if (data) setIdea(data as unknown as Idea);
      setLoading(false);
    };
    fetchIdea();
  }, [ideaId]);

  const competitors = useMemo(() => (idea ? generateCompetitors(idea) : []), [idea]);

  if (!ideaId) return <div className="p-6">Missing ideaId</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!idea) return <div className="p-6">Idea not found</div>;

  // Simple mock chart data
  const scores = competitors.map((c, i) => ({ name: c, score: 80 - i * 10 }));

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold">Competitor Analysis</h1>
        <p className="text-muted-foreground">Idea: <span className="font-medium">{idea.title}</span></p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Landscape</CardTitle>
          <CardDescription>Detected competitors</CardDescription>
        </CardHeader>
        <CardContent>
          {competitors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {competitors.map((c) => (
                <Badge key={c} variant="secondary">{c}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No competitors detected.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparison (Mock Scores)</CardTitle>
          <CardDescription>Placeholder scores; will be powered by OpenAI later</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scores.map((row) => (
              <div key={row.name} className="flex items-center gap-3">
                <div className="w-40 text-sm">{row.name}</div>
                <div className="flex-1 h-3 bg-muted rounded">
                  <div className="h-3 bg-primary rounded" style={{ width: `${row.score}%` }} />
                </div>
                <div className="w-10 text-xs text-muted-foreground">{row.score}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observations</CardTitle>
          <CardDescription>Auto-generated notes</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Our solution emphasizes integration with existing workflows</li>
            <li>Opportunities exist in internal tooling and PLG channels</li>
            <li>Further validation required for enterprise segments</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
