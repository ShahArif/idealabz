import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Lightbulb, Users, Search } from 'lucide-react';
import aiRobot from '@/assets/ai-robot-1.jpg';
import aiNetworks from '@/assets/ai-networks.jpg';
import aiBrain from '@/assets/ai-brain.jpg';

const heroSlides = [
  {
    headline: "Become a Co-Founder",
    subheadline: "Take ownership of a product idea, drive it from scratch, and earn the title of co-founder — right here at Ideas2IT.",
    ctaText: "Start Your Journey",
  },
  {
    headline: "Spark the Builder in You",
    subheadline: "Whether you're an engineer, PM, designer, or domain expert, you can now take an idea to a real product, supported by our structured incubation process.",
    ctaText: "Submit Your Idea",
  },
  {
    headline: "Got an Idea? Let's Build It Together.",
    subheadline: "Every idea deserves a shot. At Idealabs, we help you shape it, build it, and maybe even launch it as the next big product.",
    ctaText: "Let's Build It",
  },
  {
    headline: "Agents can automate execution. But vision? That still needs you.",
    subheadline: "That's still human. That's still you. Let's build it.",
    ctaText: "Share Your Vision",
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle pt-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* AI-themed background elements */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src={aiNetworks} 
          alt="AI Networks" 
          className="absolute top-0 right-0 w-1/2 h-1/2 object-cover blur-sm"
        />
        <img 
          src={aiBrain} 
          alt="AI Brain" 
          className="absolute bottom-0 left-0 w-64 h-64 object-cover rounded-full blur-lg"
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/30 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-electric/30 rounded-full animate-float blur-lg" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-innovation/30 rounded-full animate-float blur-2xl" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 mt-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Slider Content */}
          <div className="relative h-72 flex items-center justify-center mb-6">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  index === currentSlide 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentSlide 
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  {slide.headline}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                  {slide.subheadline}
                </p>
                <Button variant="hero" size="xl" className="group" asChild>
                  <a href="https://forms.gle/9zTTkeED7WXKkbF37" target="_blank" rel="noopener noreferrer">
                    <Lightbulb className="group-hover:animate-pulse" />
                    {slide.ctaText}
                  </a>
                </Button>
              </div>
            ))}
          </div>

          {/* Navigation - Screen End Arrows */}
          <Button
            variant="glow"
            size="lg"
            onClick={prevSlide}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-20 rounded-full w-16 h-16"
          >
            <ChevronLeft size={32} />
          </Button>
          <Button
            variant="glow"
            size="lg"
            onClick={nextSlide}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-20 rounded-full w-16 h-16"
          >
            <ChevronRight size={32} />
          </Button>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary shadow-glow' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Decorative grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </section>
  );
};