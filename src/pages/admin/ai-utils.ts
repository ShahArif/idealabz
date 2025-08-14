export type AIdea = {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  target_audience?: string;
  category: string;
  tags: string[] | null;
};

export const generateOnePager = (idea: AIdea): string => {
  const tags = (idea.tags || []).join(', ') || 'N/A';
  return (
    `Title: ${idea.title}
Problem: ${idea.problem_statement}
Proposed Solution: ${idea.description}
Target Audience: ${idea.target_audience || 'Knowledge workers / internal teams'}
Category: ${idea.category}
Tags: ${tags}
Differentiators: Speed, simplicity, and seamless integration with existing workflows
Success Metrics: Adoption, engagement, ROI on process efficiency`
  );
};

export const generateFullPRD = (idea: AIdea): string => {
  const sections = [
    `1. Overview\n${idea.description}`,
    `2. Goals & Non-Goals\n- Goals: Solve ${idea.problem_statement.toLowerCase()}\n- Non-Goals: Anything outside ${idea.category} in v1`,
    `3. Personas\n- Primary: ${idea.target_audience || 'Employees / Customers'}\n- Secondary: Stakeholders`,
    `4. Requirements\n- Must: Core features to address problem\n- Should: Enhancements\n- Could: Nice-to-haves`,
    `5. UX & Flows\n- Simple task-focused flows for first release`,
    `6. Technical Considerations\n- Integration with existing systems\n- Security, privacy, compliance`,
    `7. Metrics & Rollout\n- Activation, retention, CSAT\n- Phased rollout with feedback loops`,
  ];
  return sections.join('\n\n');
};

export const generateRelevantIdeas = (idea: AIdea, allIdeas: AIdea[]) => {
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

export const generateUserProblems = (idea: AIdea): string[] => {
  return [
    `Users struggle with ${idea.problem_statement.toLowerCase()}`,
    'Lack of visibility and feedback loops',
    'Manual handoffs causing delays and errors',
    'Tools are fragmented and non-intuitive for end users',
  ];
};

export const generateCompetitors = (idea: AIdea): string[] => {
  const tagHints = (idea.tags || []).map(t => t.toLowerCase());
  const base = ['Internal Tools', 'Spreadsheet Workflows'];
  if (tagHints.includes('ai')) base.push('OpenAI Assistants');
  if (tagHints.includes('product')) base.push('Productboard');
  if (tagHints.includes('process')) base.push('Asana');
  if (tagHints.includes('service')) base.push('Zendesk');
  return Array.from(new Set(base));
};

export const computeMarketNumbers = (idea: AIdea) => {
  const base = Math.max(5, idea.title.length + idea.problem_statement.length);
  const tam = base * 10;
  const sam = Math.round(tam * 0.3);
  const som = Math.round(sam * 0.25);
  return { base, tam, sam, som };
};

export const generateGTM = (idea: AIdea): string => {
  return (
    `ICP: Teams facing ${idea.problem_statement.toLowerCase()}
Channels: Product-led growth, internal evangelists, case studies
Messaging: Solve "${idea.problem_statement}" with ${idea.title}
Playbook: Beta with champions → Public launch → Land-and-expand`
  );
};
