import { Button } from '@/components/ui/button';
import { Rocket, Target, Users, Lightbulb } from 'lucide-react';

export const WhatIsIdeaLabs = () => {
  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
            What is <span className="bg-gradient-primary bg-clip-text text-transparent">IdeaLabs</span>?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div className="space-y-6 text-left">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Idealabs is Ideas2IT's in-house product incubation lab, a launchpad where your ideas, 
                even in their roughest form, can turn into real products.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether it's a passing thought, a problem you've seen repeatedly, or a disruptive solution 
                you've dreamed up, Idealabs gives you the space, support, and structure to explore and build it.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                You don't need to look for seed funding or external support — we've got that covered. 
                From product thinking to tech execution and go-to-market strategy, Idealabs offers a 
                complete ecosystem to transform your idea into the next big thing.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-card p-6 rounded-lg border border-border/50 hover:shadow-glow transition-all duration-300 group">
                <Lightbulb className="w-8 h-8 text-innovation mb-3 group-hover:animate-pulse" />
                <h3 className="font-semibold text-foreground mb-2">Ideation</h3>
                <p className="text-sm text-muted-foreground">Raw ideas to refined concepts</p>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-lg border border-border/50 hover:shadow-electric transition-all duration-300 group">
                <Target className="w-8 h-8 text-electric mb-3 group-hover:animate-pulse" />
                <h3 className="font-semibold text-foreground mb-2">Validation</h3>
                <p className="text-sm text-muted-foreground">Market research & testing</p>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-lg border border-border/50 hover:shadow-glow transition-all duration-300 group">
                <Users className="w-8 h-8 text-primary mb-3 group-hover:animate-pulse" />
                <h3 className="font-semibold text-foreground mb-2">Team Support</h3>
                <p className="text-sm text-muted-foreground">Expert mentorship & guidance</p>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-lg border border-border/50 hover:shadow-innovation transition-all duration-300 group">
                <Rocket className="w-8 h-8 text-innovation mb-3 group-hover:animate-pulse" />
                <h3 className="font-semibold text-foreground mb-2">Launch</h3>
                <p className="text-sm text-muted-foreground">Full product development</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-primary p-8 rounded-2xl border border-primary/20 shadow-glow">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              And the best part?
            </h3>
            <p className="text-xl text-primary-foreground/90 font-semibold">
              You don't just contribute — you get the chance to become a <span className="text-innovation">co-founder</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};