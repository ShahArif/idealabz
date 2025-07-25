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
    image: "https://cdn.shopify.com/s/files/1/0408/8443/7160/files/p080p3jc.jpg"
  },
  {
    id: "research",
    number: "02", 
    icon: Target,
    title: "Research and Support",
    description: "Our experts conduct thorough market research and feasibility analysis for your idea.",
    details: "Our expert team conducts thorough market research, competitive analysis, and technical assessment to determine the best path forward for your idea.",
    image: "https://cdn.prod.website-files.com/62c41df069f3e62476a3ccbe/62c53890b83d755c8376f871_629eefd383ef76091b371e9b_viaxsXEmtOwsXNBb3TxZcB8tsZuh5kGlzdHsDpJEvvY-nnOIZRvI-if2D16u5ehYqck1EfCxtELYgSLjFe3_hTkPJzxNUeKDum4a6T339OLpFXfI4y38R1YQt_waDQt6DawB68Y.png"
  },
  {
    id: "validation",
    number: "03",
    icon: Users,
    title: "Idea Validation & Iteration",
    description: "We validate your concept through user feedback and market testing methodologies.",
    details: "Through user interviews, surveys, and prototype testing, we validate your concept and iterate based on real market feedback to ensure product-market fit.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
  },
  {
    id: "pitch",
    number: "04",
    icon: TrendingUp,
    title: "Pitch to Leadership",
    description: "Present your refined concept to leadership with comprehensive market analysis.",
    details: "With validated data and refined concept, we help you prepare and present a compelling pitch to leadership, backed by market research and user validation.",
    image: "https://img.uxcel.com/cdn-cgi/image/format=auto/tags/product-pitch-1725529007627-2x.jpg"
  },
  {
    id: "launch",
    number: "05",
    icon: Rocket,
    title: "Launch the Product",
    description: "Transform your validated idea into a market-ready product with our support.",
    details: "From development to go-to-market strategy, we support your product's journey from concept to successful market launch and beyond.",
    image: "https://fireflies.ai/blog/content/images/size/w2000/2021/10/feat-min-2.png"
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
            <TabsList className="grid w-full grid-cols-5 mb-12">
              {processSteps.map((step) => (
                <TabsTrigger 
                  key={step.id}
                  value={step.id}
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="text-xs font-medium text-muted-foreground">{step.number}</span>
                  <step.icon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
              {/* Text Content - Left Side */}
              <div className="space-y-6 flex flex-col justify-center">
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
              <div className="lg:pl-8 mt-12 lg:mt-8">
                <div className="overflow-hidden rounded-2xl shadow-soft h-80 lg:h-96 w-full">
                  <img 
                    src={activeStepData.image} 
                    alt={activeStepData.title}
                    className="w-full h-full object-cover object-center"
                  />
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