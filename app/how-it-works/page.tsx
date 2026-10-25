"use client";

import { Navbar } from "@/components/marketing/navbar";
import { HowItWorksSection } from "@/components/marketing/how-it-works";
import { Footer } from "@/components/marketing/footer";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function HowItWorksPage() {
  const { isRtl, t } = useI18n();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance",
              isRtl && "font-urdu"
            )}>
              How MakaanX Works
            </h1>
            <p className={cn(
              "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto",
              isRtl && "font-urdu"
            )}>
              Discover the simple 4-step process to find your perfect property or list yours for rent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
