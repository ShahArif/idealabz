import { Navigation } from '@/components/Navigation';
import { HeroSlider } from '@/components/HeroSlider';
import { WhatIsIdeaLabs } from '@/components/WhatIsIdeaLabs';
import { WhatsInItForYou } from '@/components/WhatsInItForYou';
import { ProcessSection } from '@/components/ProcessSection';
import { FAQSection } from '@/components/FAQSection';


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
