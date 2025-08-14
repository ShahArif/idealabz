import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { generateUserProblems } from './ai-utils';

interface Idea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience?: string;
  category: string;
  tags: string[] | null;
}

export const UserProblemsPage = () => {
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

  const problems = useMemo(() => (idea ? generateUserProblems(idea) : []), [idea]);

  if (!ideaId) return <div className="p-6">Missing ideaId</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!idea) return <div className="p-6">Idea not found</div>;

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold">User Research — User Problems</h1>
        <p className="text-muted-foreground">Idea: <span className="font-medium">{idea.title}</span></p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Problems</CardTitle>
          <CardDescription>Initial list to validate with users</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {problems.map((p, idx) => <li key={idx}>{p}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
