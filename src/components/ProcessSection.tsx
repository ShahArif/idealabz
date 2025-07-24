import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Rocket, Users, Target, Zap, TrendingUp } from 'lucide-react';

const processSteps = [
  {
    id: "idea",
    number: "01",
    icon: Lightbulb,
    title: "Idea Submission",
    description: "Submit your product idea through our simple form. Our team reviews and evaluates the potential.",
    details: "Every great product starts with a spark of inspiration. Submit your idea and we'll help you evaluate its market potential, technical feasibility, and business viability.",
    visual: "💡"
  },
  {
    id: "evaluation",
    number: "02", 
    icon: Target,
    title: "Evaluation & Selection",
    description: "Ideas are evaluated for feasibility, market potential, and alignment with our capabilities.",
    details: "Our expert team conducts thorough market research, competitive analysis, and technical assessment to determine the best path forward for your idea.",
    visual: "🎯"
  },
  {
    id: "team",
    number: "03",
    icon: Users,
    title: "Team Formation",
    description: "We assemble a cross-functional team including engineers, designers, and product managers.",
    details: "You'll work alongside experienced professionals who bring diverse skills and perspectives to turn your vision into reality.",
    visual: "👥"
  },
  {
    id: "build",
    number: "04",
    icon: Rocket,
    title: "Build & Iterate",
    description: "Using agile methodologies, we build, test, and refine your product iteratively.",
    details: "Through rapid prototyping and user feedback, we ensure your product meets market needs and exceeds expectations.",
    visual: "🚀"
  },
  {
    id: "launch",
    number: "05",
    icon: TrendingUp,
    title: "Launch & Scale",
    description: "Successfully launch your product and scale it with continued support and optimization.",
    details: "From go-to-market strategy to post-launch optimization, we support your product's journey to success.",
    visual: "📈"
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
                <div className="bg-background rounded-2xl shadow-soft p-8 h-96 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="text-8xl animate-pulse">
                      {activeStepData.visual}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-foreground">
                        {activeStepData.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {activeStepData.description}
                      </p>
                    </div>
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