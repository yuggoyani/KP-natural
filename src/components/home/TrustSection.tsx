import React from "react";
import { Sprout, CheckCircle2, Shield, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

const TRUST_PILLARS = [
  {
    icon: Sprout,
    title: "100% Farm-Crafted",
    description: "Formulated and packaged directly on the farm to guarantee freshness, consistency, and authentic quality.",
  },
  {
    icon: Shield,
    title: "Zero Synthetic Chemicals",
    description: "Every product strictly avoids synthetic fillers, harmful adulterants, and artificial enhancers.",
  },
  {
    icon: CheckCircle2,
    title: "Natural Nutrition Standards",
    description: "Carefully calibrated natural compositions to feed plants and provide uncompromised wholesome nutrition.",
  },
  {
    icon: Truck,
    title: "Direct Sourcing & Care",
    description: "Delivering products carefully from our farm gates with full traceability and dedicated customer care.",
  },
];

export function TrustSection() {
  return (
    <section id="quality" className="py-16 md:py-24 bg-brand-ivory-300/30 border-t border-brand-border/60">
      <Container size="lg">
        <SectionHeading
          eyebrow="Our Farm Standards"
          title="Rooted in Quality & Customer Trust"
          description="We uphold foundational principles of natural farm integrity across every stage of cultivation and production."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                className="bg-[#FCF9F2] p-6 flex flex-col items-start hover:border-brand-green/40"
              >
                <div className="w-12 h-12 rounded-farm bg-brand-green-50 text-brand-green border border-brand-green-100 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-text-primary mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
