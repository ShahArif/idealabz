export type PRDInputs = {
  title: string;
  description: string;
  problem: string;
  audience?: string;
  category?: string;
  tags?: string[] | null;
};

export async function generateOnePagerWithAI(inputs: PRDInputs, apiKey?: string): Promise<string> {
  const key = apiKey || (import.meta as any).env?.VITE_OPENAI_API_KEY;
  if (!key) throw new Error('Missing OpenAI API key');

  const system = `You are a senior product manager. Create a crisp one-pager PRD. Sections: Title, Problem, Solution, Audience, Differentiators, Success Metrics.`;
  const user = `Title: ${inputs.title}\nProblem: ${inputs.problem}\nDescription: ${inputs.description}\nAudience: ${inputs.audience || 'Knowledge workers'}\nCategory: ${inputs.category || ''}\nTags: ${(inputs.tags || []).join(', ')}`;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.3,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function generateFullPRDWithAI(inputs: PRDInputs, apiKey?: string): Promise<string> {
  const key = apiKey || (import.meta as any).env?.VITE_OPENAI_API_KEY;
  if (!key) throw new Error('Missing OpenAI API key');

  const system = `You are a principal PM. Create a thorough PRD with sections: Overview, Goals & Non-Goals, Personas, Requirements (Must/Should/Could), UX & Flows, Technical Considerations, Metrics & Rollout.`;
  const user = `Title: ${inputs.title}\nProblem: ${inputs.problem}\nDescription: ${inputs.description}\nAudience: ${inputs.audience || 'Knowledge workers'}\nCategory: ${inputs.category || ''}\nTags: ${(inputs.tags || []).join(', ')}`;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.3,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
