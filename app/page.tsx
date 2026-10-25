"use client";

import { Navbar } from "@/components/marketing/navbar";
import { HeroSection } from "@/components/marketing/hero";
import { FeaturesSection } from "@/components/marketing/features";
import { FeaturedProperties } from "@/components/marketing/featured-properties";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { Footer } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
