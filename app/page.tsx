
import { Suspense } from "react";
import { RentalLoading } from "@/components/rentals/loading";
import { Navbar } from "@/components/marketing/navbar";
import { HeroSection } from "@/components/marketing/hero";
import { FeaturesSection } from "@/components/marketing/features";
import { FeaturedProperties } from "@/components/marketing/featured-properties";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { Footer } from "@/components/marketing/footer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <Suspense fallback={<RentalLoading/>}><FeaturedProperties /></Suspense>
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
