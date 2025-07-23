import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Do I need a fully fleshed-out idea to submit?",
    answer: "No. Even a raw thought or a loosely defined problem statement is enough to start. Idealabs is here to help you shape it into something real."
  },
  {
    question: "Who can submit ideas to Idealabs?",
    answer: "Anyone at Ideas2IT — regardless of your role. Developers, QAs, designers, analysts, project managers — all are welcome. If you have an idea, we're listening."
  },
  {
    question: "Can I submit more than one idea?",
    answer: "Absolutely. There's no limit. Submit as many ideas as you'd like — just make sure each submission is focused and clearly explained."
  },
  {
    question: "What happens after I submit an idea?",
    answer: "Your idea will be reviewed for relevance, potential, and feasibility. If shortlisted, you'll get support from product experts to validate, iterate, and shape it for pitching."
  },
  {
    question: "What if I'm not confident in my product skills?",
    answer: "That's the point! Idealabs is also a learning journey. You'll get mentorship and exposure to product thinking, design, AI, and go-to-market strategies."
  },
  {
    question: "Will I get time during work hours to build my idea?",
    answer: "Yes. Once your idea is selected, time allocation and support will be planned — either part-time initially or with a dedicated team, depending on the scope."
  },
  {
    question: "What does it mean to be a co-founder internally?",
    answer: "It means you'll be the face and driver of the product. You'll lead decision-making, continue to grow the product, and may also be part of any spinoff or productization effort."
  },
  {
    question: "Can I join someone else's idea if I don't have one?",
    answer: "Yes! You can contribute your skills to someone else's project — as a developer, designer, tester, or researcher. There's always room for passionate builders."
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked <span className="bg-gradient-primary bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about getting started with IdeaLabs
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between group hover:bg-primary/5 transition-colors duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors duration-300">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-all duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-6 pt-0 pl-20">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-electric p-8 rounded-2xl border border-electric/20 shadow-electric">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Still have questions?
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                Reach out to our team and we'll be happy to help you get started.
              </p>
              <button className="bg-foreground text-background px-8 py-3 rounded-lg font-semibold hover:bg-foreground/90 hover:scale-105 transition-all duration-300">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};