import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { computeMarketNumbers } from './ai-utils';

interface Idea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience?: string;
  category: string;
  tags: string[] | null;
}

export const MarketCalculationPage = () => {
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

  const calc = useMemo(() => (idea ? computeMarketNumbers(idea) : null), [idea]);

  if (!ideaId) return <div className="p-6">Missing ideaId</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!idea) return <div className="p-6">Idea not found</div>;

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold">Market Analysis — TAM / SAM / SOM</h1>
        <p className="text-muted-foreground">Idea: <span className="font-medium">{idea.title}</span></p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Methodology</CardTitle>
          <CardDescription>Heuristic method (replace with OpenAI + data sources later)</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>Base = max(5, len(title) + len(problem_statement))</p>
          <p>TAM = Base × 10 (in millions)</p>
          <p>SAM = TAM × 0.3</p>
          <p>SOM = SAM × 0.25</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Numbers</CardTitle>
          <CardDescription>Calculated from the methodology above</CardDescription>
        </CardHeader>
        <CardContent>
          {calc ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-muted/40">
                <div className="text-xs text-muted-foreground">TAM</div>
                <div className="text-lg font-semibold">${calc.tam}M</div>
              </div>
              <div className="p-3 rounded bg-muted/40">
                <div className="text-xs text-muted-foreground">SAM</div>
                <div className="text-lg font-semibold">${calc.sam}M</div>
              </div>
              <div className="p-3 rounded bg-muted/40">
                <div className="text-xs text-muted-foreground">SOM</div>
                <div className="text-lg font-semibold">${calc.som}M</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an idea first.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>Where the numbers come from</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li>Placeholder: Internal heuristic for demo</li>
            <li>Later: OpenAI synthesis from public market reports</li>
            <li>Later: Company internal data and CRM</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
