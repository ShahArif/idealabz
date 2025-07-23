import { Navigation } from '@/components/Navigation';
import { HeroSlider } from '@/components/HeroSlider';
import { WhatIsIdeaLabs } from '@/components/WhatIsIdeaLabs';
import { WhatsInItForYou } from '@/components/WhatsInItForYou';
import { ProcessSection } from '@/components/ProcessSection';
import { FAQSection } from '@/components/FAQSection';
import { ProductCommunity } from '@/components/ProductCommunity';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSlider />
      <WhatIsIdeaLabs />
      <WhatsInItForYou />
      <ProcessSection />
      <FAQSection />
      <ProductCommunity />
    </div>
  );
};

export default Index;
