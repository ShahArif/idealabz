import { Crown, TrendingUp, Users, Target, Award, Cpu } from 'lucide-react';

const benefits = [
  {
    icon: Crown,
    title: "Become a Co-Founder",
    description: "Your idea could be the next product we launch — and you could lead it as a co-founder. You bring the spark, and we bring the fuel.",
    gradient: "bg-gradient-primary",
    shadow: "shadow-glow"
  },
  {
    icon: TrendingUp,
    title: "Grow into a Product Thinker",
    description: "From identifying user needs to scoping features, testing markets, and iterating fast — you'll learn what it truly takes to build and scale a product.",
    gradient: "bg-gradient-electric",
    shadow: "shadow-electric"
  },
  {
    icon: Users,
    title: "Level Up with Real-World Experience",
    description: "You'll work closely with product managers, GTM experts, and tech mentors — gaining hands-on experience that's hard to get in regular client work.",
    gradient: "bg-gradient-innovation",
    shadow: "shadow-innovation"
  },
  {
    icon: Target,
    title: "Solve Real Problems",
    description: "Idealabs is not about gimmicks — it's about building products that solve meaningful problems. This process sharpens your design thinking and builds empathy for end users.",
    gradient: "bg-gradient-primary",
    shadow: "shadow-glow"
  },
  {
    icon: Award,
    title: "Boost Your Career",
    description: "This journey helps you evolve beyond your current role — into a strategic thinker, product leader, or even a founder. You'll have stories, case studies, and working products to show for it.",
    gradient: "bg-gradient-electric",
    shadow: "shadow-electric"
  },
  {
    icon: Cpu,
    title: "Build with the Latest in AI",
    description: "Work on cutting-edge ideas powered by Agentic AI, Multi-Agent Systems, and LLMs. Upskill yourself and future-proof your career while building things that matter.",
    gradient: "bg-gradient-innovation",
    shadow: "shadow-innovation"
  }
];

export const WhatsInItForYou = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              What's In It <span className="bg-gradient-electric bg-clip-text text-transparent">For You</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              At Idealabs, you don't just submit ideas — you shape them, own them, and grow with them. 
              Whether you're a developer, designer, analyst, or QA — if you've ever had an idea worth building, this is your platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-gradient-card p-8 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 ${benefit.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:${benefit.shadow} transition-all duration-300`}>
                  <benefit.icon className="w-8 h-8 text-foreground group-hover:animate-pulse" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>

          <div className="text-center bg-gradient-card p-8 rounded-2xl border border-border/50">
            <p className="text-lg text-muted-foreground italic">
              <span className="text-innovation font-semibold">No matter where you start from</span>, 
              your curiosity, your ideas, and your initiative are all you need to begin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};