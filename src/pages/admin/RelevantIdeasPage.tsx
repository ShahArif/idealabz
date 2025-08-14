import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { generateRelevantIdeas } from './ai-utils';

interface Idea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience?: string;
  category: string;
  tags: string[] | null;
}

export const RelevantIdeasPage = () => {
  const [params] = useSearchParams();
  const ideaId = params.get('ideaId');
  const [idea, setIdea] = useState<Idea | null>(null);
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!ideaId) return <div className="p-6">Missing ideaId</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!idea) return <div className="p-6">Idea not found</div>;

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold">Existing Relevant Ideas</h1>
        <p className="text-muted-foreground">Idea: <span className="font-medium">{idea.title}</span></p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Matches</CardTitle>
          <CardDescription>Based on category and overlapping tags</CardDescription>
        </CardHeader>
        <CardContent>
          {similar.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {similar.map((ri) => (
                <li key={ri.id}>
                  <span className="font-medium">{ri.title}</span>
                  <span className="text-muted-foreground"> — {ri.category}</span>
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
