import { Button } from '@/components/ui/button';
import { GraduationCap, Search, Brain, Wrench, MessageCircle, Users } from 'lucide-react';

const communityFeatures = [
  {
    icon: GraduationCap,
    title: "Workshops",
    description: "Learn how to ideate, scope, and validate like a pro.",
    gradient: "bg-gradient-primary"
  },
  {
    icon: Search,
    title: "Teardowns",
    description: "Dive deep into successful products and understand what made them work.",
    gradient: "bg-gradient-electric"
  },
  {
    icon: Brain,
    title: "Master Classes",
    description: "Hear from internal and external product leaders.",
    gradient: "bg-gradient-innovation"
  },
  {
    icon: Wrench,
    title: "Resources",
    description: "Templates, guides, AI tools, and curated frameworks to build faster and smarter.",
    gradient: "bg-gradient-primary"
  },
  {
    icon: MessageCircle,
    title: "Slack/Product Channel",
    description: "Get feedback, jam with fellow makers, and stay updated on opportunities.",
    gradient: "bg-gradient-electric"
  }
];

export const ProductCommunity = () => {
  return (
    <section id="community" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Join the <span className="bg-gradient-innovation bg-clip-text text-transparent">Product Community</span>
            </h2>
            <p className="text-2xl font-semibold text-muted-foreground mb-4">
              Learn. Build. Grow — Together.
            </p>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Idealabs isn't just a launchpad for ideas — it's also your gateway into Ideas2IT's internal Product Community.
              Whether you're new to product thinking or already building something exciting, this is where you level up.
            </p>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              📚 What You Get Access To:
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-gradient-card p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300`}>
                    <feature.icon className="w-7 h-7 text-foreground group-hover:animate-pulse" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    🎓 {feature.title}
                  </h4>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                </div>
              ))}
              
              {/* Special card for Slack channel */}
              <div className="md:col-span-2 lg:col-span-3">
                <div className="group bg-gradient-primary p-8 rounded-xl border border-primary/20 shadow-glow text-center">
                  <Users className="w-12 h-12 text-primary-foreground mx-auto mb-4 group-hover:animate-pulse" />
                  <h4 className="text-xl font-bold text-primary-foreground mb-3">
                    💬 Slack/Product Channel
                  </h4>
                  <p className="text-primary-foreground/90 text-lg">
                    Get feedback, jam with fellow makers, and stay updated on opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-card p-8 rounded-2xl border border-border/50 mb-8">
              <p className="text-lg text-muted-foreground mb-6">
                <span className="text-innovation font-semibold">No idea is needed to join</span> — just curiosity and a willingness to grow.
              </p>
              <p className="text-muted-foreground">
                Become part of a vibrant circle of builders, thinkers, and future founders.
              </p>
            </div>

            <div className="bg-gradient-innovation p-8 rounded-2xl border border-innovation/20 shadow-innovation">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-3xl">🧩</span>
                <p className="text-xl font-semibold text-foreground italic">
                  "Not building yet? No problem. Join the Product Community and get inspired."
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" className="group">
                  <Users className="group-hover:animate-pulse" />
                  Join the Community
                </Button>
                <Button variant="glow" size="xl">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};