import React, { useEffect, useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { IdeaWorkflowCard } from '@/components/IdeaWorkflowCard';
import { IdeaSubmissionForm } from '@/components/IdeaSubmissionForm';
import { Dialog } from '@/components/ui/dialog';
import { Plus, Filter, Search } from 'lucide-react';

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

export const IdeasPage = () => {
  const { role } = useUserRole();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'basic_validation', label: 'Basic Validation' },
    { value: 'tech_validation', label: 'Tech Validation' },
    { value: 'leadership_pitch', label: 'Leadership Pitch' },
    { value: 'mvp', label: 'MVP' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'process', label: 'Process' },
    { value: 'product', label: 'Product' },
    { value: 'service', label: 'Service' },
    { value: 'other', label: 'Other' },
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

  const getManageableIdeas = () => {
    if (!role) return [];
    if (role === 'super_admin') return ideas;
    if (role === 'product_expert') return ideas.filter(idea => ['discovery', 'basic_validation'].includes(idea.stage));
    if (role === 'tech_expert') return ideas.filter(idea => idea.stage === 'tech_validation');
    if (role === 'leader') return ideas.filter(idea => ['leadership_pitch', 'mvp'].includes(idea.stage));
    return [];
  };

  // Helper to filter ideas by search query, stage, and category
  const filterIdeas = (ideasToFilter: Idea[]) => {
    let filtered = ideasToFilter;
    if (filterStage !== 'all') {
      filtered = filtered.filter(idea => idea.stage === filterStage);
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(idea => idea.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) ||
        idea.problem_statement.toLowerCase().includes(q) ||
        idea.target_audience.toLowerCase().includes(q) ||
        (idea.category && idea.category.toLowerCase().includes(q)) ||
        (Array.isArray(idea.tags) && idea.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ideas...</p>
        </div>
      </div>
    );
  }

  const manageableIdeas = getManageableIdeas();
  const filteredIdeas = filterIdeas(ideas);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ideas Management</h1>
          <p className="text-muted-foreground">
            View and manage all ideas in the system
          </p>
        </div>
        <Button onClick={() => setShowSubmissionForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Submit New Idea
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter ideas by stage, category, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => (
          <IdeaWorkflowCard key={idea.id} idea={idea} onUpdate={fetchIdeas} />
        ))}
      </div>

      {/* Empty State */}
      {filteredIdeas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              {searchQuery || filterStage !== 'all' || filterCategory !== 'all' ? (
                <>
                  <h4 className="text-lg font-semibold mb-2">No ideas match your filters</h4>
                  <p className="text-muted-foreground text-center mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStage('all');
                      setFilterCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-semibold mb-2">No ideas yet</h4>
                  <p className="text-muted-foreground text-center mb-4">
                    Ideas will appear here once they are submitted
                  </p>
                  <Button onClick={() => setShowSubmissionForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Submit Your First Idea
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Idea Submission Dialog */}
      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <IdeaSubmissionForm 
          isOpen={showSubmissionForm} 
          setIsOpen={setShowSubmissionForm} 
          onClose={() => setShowSubmissionForm(false)} 
          onSuccess={fetchIdeas} 
        />
      </Dialog>
    </div>
  );
};
