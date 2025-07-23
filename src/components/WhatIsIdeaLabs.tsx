import { Button } from '@/components/ui/button';
import { Rocket, Target, Users, Lightbulb } from 'lucide-react';
import aiNetworks from '@/assets/ai-networks.jpg';

export const WhatIsIdeaLabs = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                What is <span className="bg-gradient-primary bg-clip-text text-transparent">IdeaLabs</span>?
              </h2>
              
              <div className="space-y-6">
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

              <div className="bg-gradient-primary p-6 rounded-xl border border-primary/10 shadow-soft">
                <h3 className="text-xl font-bold text-primary-foreground mb-3">
                  And the best part?
                </h3>
                <p className="text-primary-foreground/90 text-lg font-semibold">
                  You don't just contribute — you get the chance to become a <span className="text-innovation">co-founder</span>.
                </p>
              </div>
            </div>

            {/* Right side - AI Networks Image + Feature Grid */}
            <div className="space-y-8">
              <div className="relative">
                <img 
                  src={aiNetworks} 
                  alt="AI Networks and Innovation" 
                  className="w-full h-64 object-cover rounded-xl shadow-soft"
                />
                <div className="absolute inset-0 bg-gradient-primary/10 rounded-xl"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border border-border shadow-soft hover:shadow-glow transition-all duration-300 group">
                  <Lightbulb className="w-6 h-6 text-innovation mb-2 group-hover:animate-pulse" />
                  <h4 className="font-semibold text-foreground text-sm mb-1">Ideation</h4>
                  <p className="text-xs text-muted-foreground">Raw ideas to refined concepts</p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border border-border shadow-soft hover:shadow-electric transition-all duration-300 group">
                  <Target className="w-6 h-6 text-electric mb-2 group-hover:animate-pulse" />
                  <h4 className="font-semibold text-foreground text-sm mb-1">Validation</h4>
                  <p className="text-xs text-muted-foreground">Market research & testing</p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border border-border shadow-soft hover:shadow-glow transition-all duration-300 group">
                  <Users className="w-6 h-6 text-primary mb-2 group-hover:animate-pulse" />
                  <h4 className="font-semibold text-foreground text-sm mb-1">Team Support</h4>
                  <p className="text-xs text-muted-foreground">Expert mentorship & guidance</p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border border-border shadow-soft hover:shadow-innovation transition-all duration-300 group">
                  <Rocket className="w-6 h-6 text-innovation mb-2 group-hover:animate-pulse" />
                  <h4 className="font-semibold text-foreground text-sm mb-1">Launch</h4>
                  <p className="text-xs text-muted-foreground">Full product development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};