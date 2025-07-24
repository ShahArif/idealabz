import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Rocket, Users, Target, Zap, TrendingUp } from 'lucide-react';

const processSteps = [
  {
    id: "idea",
    number: "01",
    icon: Lightbulb,
    title: "Submit the Idea",
    description: "Submit your product idea through our simple form. Our team reviews and evaluates the potential.",
    details: "Every great product starts with a spark of inspiration. Submit your idea and we'll help you evaluate its market potential, technical feasibility, and business viability.",
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600&h=400&fit=crop"
  },
  {
    id: "research",
    number: "02", 
    icon: Target,
    title: "Research and Support",
    description: "Our experts conduct thorough market research and feasibility analysis for your idea.",
    details: "Our expert team conducts thorough market research, competitive analysis, and technical assessment to determine the best path forward for your idea.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"
  },
  {
    id: "validation",
    number: "03",
    icon: Users,
    title: "Idea Validation & Iteration",
    description: "We validate your concept through user feedback and market testing methodologies.",
    details: "Through user interviews, surveys, and prototype testing, we validate your concept and iterate based on real market feedback to ensure product-market fit.",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop"
  },
  {
    id: "pitch",
    number: "04",
    icon: TrendingUp,
    title: "Pitch to Leadership",
    description: "Present your refined concept to leadership with comprehensive market analysis.",
    details: "With validated data and refined concept, we help you prepare and present a compelling pitch to leadership, backed by market research and user validation.",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop"
  },
  {
    id: "launch",
    number: "05",
    icon: Rocket,
    title: "Launch the Product",
    description: "Transform your validated idea into a market-ready product with our support.",
    details: "From development to go-to-market strategy, we support your product's journey from concept to successful market launch and beyond.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"
  }
];

export const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState("idea");

  const activeStepData = processSteps.find(step => step.id === activeStep) || processSteps[0];

  return (
    <section id="process" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Process: From Idea to Product
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our proven 5-step process transforms your ideas into market-ready products with structured support at every stage.
          </p>
        </div>

        {/* Tabs Layout */}
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {processSteps.map((step) => (
                <TabsTrigger 
                  key={step.id}
                  value={step.id}
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <span className="text-xs font-medium text-muted-foreground">{step.number}</span>
                  <step.icon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content - Left Side */}
              <div className="space-y-6">
                {processSteps.map((step) => (
                  <TabsContent key={step.id} value={step.id} className="mt-0">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Step {step.number}</span>
                          <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.details}
                      </p>

                      <div className="pt-4">
                        <Button variant="default" size="lg" asChild>
                          <a href="https://forms.gle/9zTTkeED7WXKkbF37" target="_blank" rel="noopener noreferrer">
                            <Lightbulb className="w-4 h-4" />
                            Submit Your Idea
                          </a>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>

              {/* Visual Content - Right Side */}
              <div className="lg:pl-8">
                <div className="relative overflow-hidden rounded-2xl shadow-soft h-96">
                  <img 
                    src={activeStepData.image} 
                    alt={activeStepData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-xl font-semibold text-foreground mb-2">
                      Step {activeStepData.number}: {activeStepData.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {activeStepData.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-background rounded-2xl shadow-soft p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Idea?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join hundreds of innovators who have brought their ideas to life with our proven process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild>
                <a href="https://forms.gle/9zTTkeED7WXKkbF37" target="_blank" rel="noopener noreferrer">
                  <Lightbulb className="w-4 h-4" />
                  Submit Your Idea Now
                </a>
              </Button>
              <Button variant="outline" size="lg">
                <Zap className="w-4 h-4" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};