import { Navigation } from '@/components/Navigation';
import { HeroSlider } from '@/components/HeroSlider';
import { WhatIsIdeaLabs } from '@/components/WhatIsIdeaLabs';
import { WhatsInItForYou } from '@/components/WhatsInItForYou';
import { ProcessSection } from '@/components/ProcessSection';
import { FAQSection } from '@/components/FAQSection';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Plus, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';


const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center p-4 bg-card border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">IdeaLabs Platform</h1>
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Welcome, {user.email}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Submit Idea
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <Navigation />
      <HeroSlider />
      <WhatIsIdeaLabs />
      <WhatsInItForYou />
      <ProcessSection />
      <FAQSection />
    </div>
  );
};

export default Index;
