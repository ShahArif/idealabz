import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { generateRelevantIdeas } from './ai-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Idea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience?: string;
  category: string;
  tags: string[] | null;
}

const frameworks = [
  { name: '5 Whys', summary: 'Iteratively ask "why" to uncover root cause.' },
  { name: 'Lean Canvas', summary: '1-page business model to validate assumptions.' },
  { name: 'Value Proposition Canvas', summary: 'Map customer jobs, pains, gains to product value.' },
  { name: 'RAT', summary: 'Test the most uncertain assumption first.' },
  { name: 'Problem-Solution Fit', summary: 'Qualitative interviews to validate direction.' },
];

export const ValidationFrameworksPage = () => {
  const [params] = useSearchParams();
  const ideaId = params.get('ideaId');
  const { user } = useAuth();
  const { toast } = useToast();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyFramework, setApplyFramework] = useState<string>('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!ideaId) return;
      setLoading(true);
      const [{ data: current }, { data: ideas }] = await Promise.all([
        supabase.from('ideas').select('*').eq('id', ideaId).single(),
        supabase.from('ideas').select('*').order('created_at', { ascending: false }),
      ]);
      if (current) setIdea(current as unknown as Idea);
      if (ideas) setAllIdeas(ideas as unknown as Idea[]);
      setLoading(false);
    };
    fetchData();
  }, [ideaId]);

  const similar = useMemo(() => (idea ? generateRelevantIdeas(idea, allIdeas) : []), [idea, allIdeas]);

  // Produce 5 top products per framework deterministically from similar/allIdeas
  const topProductsByFramework = useMemo(() => {
    const source = (similar.length > 0 ? similar : allIdeas).slice(0, 20);
    const map: Record<string, Idea[]> = {};
    frameworks.forEach((f, idx) => {
      // Rotate selection to diversify per framework
      const picks: Idea[] = [];
      for (let i = 0; i < source.length && picks.length < 5; i++) {
        const candidate = source[(i + idx) % source.length];
        if (!picks.find(p => p.id === candidate.id)) picks.push(candidate);
      }
      map[f.name] = picks;
    });
    return map;
  }, [similar, allIdeas]);

  const onImplementFramework = async () => {
    if (!user || !idea || !applyFramework) return;
    try {
      setApplying(true);
      const { error } = await supabase
        .from('comments')
        .insert({
          idea_id: idea.id,
          user_id: user.id,
          content: `Applied validation framework: ${applyFramework}`,
          is_internal: true,
        });
      if (error) throw error;
      toast({ title: 'Framework applied', description: `${applyFramework} has been recorded for this idea.` });
      setApplyFramework('');
    } catch (e: any) {
      toast({ title: 'Failed to apply framework', description: e.message || 'Unexpected error', variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  if (!ideaId) return <div className="p-6">Missing ideaId</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!idea) return <div className="p-6">Idea not found</div>;

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold">Idea Validation</h1>
        <p className="text-muted-foreground">Idea: <span className="font-medium">{idea.title}</span></p>
      </div>

      {/* Top Frameworks with example products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Frameworks</CardTitle>
          <CardDescription>Each framework with 5 successful products (placeholder list; OpenAI integration later)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {frameworks.map((f) => (
            <div key={f.name} className="space-y-2">
              <div>
                <span className="font-medium">{f.name}</span>
                <span className="text-muted-foreground"> — {f.summary}</span>
              </div>
              <div className="ml-4">
                {topProductsByFramework[f.name] && topProductsByFramework[f.name].length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {topProductsByFramework[f.name].map(p => (
                      <li key={p.id}>{p.title} <span className="text-muted-foreground">— {p.category}</span></li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No examples available.</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Apply selected framework */}
      <Card>
        <CardHeader>
          <CardTitle>Implement a Framework on This Idea</CardTitle>
          <CardDescription>Select a framework and record it against the idea</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select value={applyFramework} onValueChange={setApplyFramework}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Choose framework" />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map(f => (
                <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onImplementFramework} disabled={!applyFramework || !idea || applying}>
            {applying ? 'Applying...' : 'Implement the framework on my idea'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Relevant Ideas for context */}
      <Card>
        <CardHeader>
          <CardTitle>Top Relevant Ideas</CardTitle>
          <CardDescription>Ideas similar to the current one</CardDescription>
        </CardHeader>
        <CardContent>
          {similar.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {similar.map((ri, idx) => (
                <li key={ri.id}>
                  <span className="font-medium">{ri.title}</span>
                  <span className="text-muted-foreground"> — {ri.category}</span>
                  <Badge variant="outline" className="ml-2 text-[10px]">Match #{idx + 1}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No close matches found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
