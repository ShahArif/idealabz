import { CheckCircle, Search, RotateCcw, Mic, Rocket } from 'lucide-react';

const processSteps = [
  {
    number: "01",
    icon: CheckCircle,
    title: "Submit the Idea",
    description: "No idea is too small or unpolished. Just drop your concept — even if it's raw — into our Idea Repository. If it solves a problem or sparks a vision, we want to hear it.",
    gradient: "bg-gradient-primary",
    shadow: "shadow-glow"
  },
  {
    number: "02",
    icon: Search,
    title: "Research and Support",
    description: "You won't be alone. Product experts and mentors help you explore the problem space, understand users, do market/competitor research, and define the core opportunity.",
    gradient: "bg-gradient-electric",
    shadow: "shadow-electric"
  },
  {
    number: "03",
    icon: RotateCcw,
    title: "Idea Validation & Iteration",
    description: "We assess viability, impact, and uniqueness. You'll work closely with Idealabs to scope features, test assumptions, and shape your idea into a strong, focused concept — with PoC planning or even early prototyping.",
    gradient: "bg-gradient-innovation",
    shadow: "shadow-innovation"
  },
  {
    number: "04",
    icon: Mic,
    title: "Pitch to Leadership",
    description: "Now's your moment. With our support, you pitch the refined idea to leadership. If it gets the green light, it moves into incubation — backed by resources, team, and a clear product vision.",
    gradient: "bg-gradient-primary",
    shadow: "shadow-glow"
  },
  {
    number: "05",
    icon: Rocket,
    title: "Launch the Product",
    description: "You lead the charge. With Idealabs' full-stack support — product, tech, design, GTM, and more — your idea becomes a real product. You could co-own it, continue building it, or even grow it into a standalone venture.",
    gradient: "bg-gradient-electric",
    shadow: "shadow-electric"
  }
];

export const ProcessSection = () => {
  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              The Process: From <span className="bg-gradient-innovation bg-clip-text text-transparent">Idea to Product</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A structured journey that transforms your raw ideas into market-ready products
            </p>
          </div>

          <div className="space-y-8">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex flex-col lg:flex-row items-center gap-8 p-8 bg-gradient-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500">
                  {/* Step Number and Icon */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-20 h-20 ${step.gradient} rounded-2xl flex items-center justify-center group-hover:${step.shadow} transition-all duration-300 group-hover:scale-110`}>
                      <step.icon className="w-10 h-10 text-foreground group-hover:animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Progress Line (hidden on last item) */}
                  {index < processSteps.length - 1 && (
                    <div className="absolute left-1/2 lg:left-10 bottom-0 transform translate-y-8 w-px h-8 bg-gradient-to-b from-primary to-transparent opacity-50"></div>
                  )}
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-primary p-8 rounded-2xl border border-primary/20 shadow-glow">
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                Ready to start your journey?
              </h3>
              <p className="text-primary-foreground/90 text-lg mb-6">
                Every great product started with someone brave enough to share their idea.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-foreground text-background px-8 py-3 rounded-lg font-semibold hover:bg-foreground/90 hover:scale-105 transition-all duration-300">
                  Submit Your Idea Now
                </button>
                <button className="bg-transparent border-2 border-foreground/20 text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-foreground/10 hover:scale-105 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};