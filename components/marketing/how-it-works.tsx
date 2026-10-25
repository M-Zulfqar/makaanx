"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/lib/i18n/context";
import { UserPlus, Search, CalendarCheck, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function HowItWorksSection() {
  const { t, isRtl } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const steps = [
    { ...t.howItWorks.step1, icon: UserPlus },
    { ...t.howItWorks.step2, icon: Search },
    { ...t.howItWorks.step3, icon: CalendarCheck },
    { ...t.howItWorks.step4, icon: FileCheck },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4",
            isRtl && "font-urdu"
          )}>
            {t.howItWorks.title}
          </h2>
          <p className={cn(
            "text-lg text-muted-foreground",
            isRtl && "font-urdu"
          )}>
            {t.howItWorks.subtitle}
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={containerRef} className="relative max-w-4xl mx-auto">
          {/* Animated Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block">
            <motion.div
              className="absolute top-0 left-0 right-0 bg-primary"
              initial={{ height: 0 }}
              animate={isInView ? { height: "100%" } : { height: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className={cn(
                    "relative md:grid md:grid-cols-2 md:gap-8 items-center",
                    index !== steps.length - 1 && "md:pb-16"
                  )}
                >
                  {/* Content */}
                  <div
                    className={cn(
                      "md:text-right",
                      !isLeft && "md:order-2 md:text-left",
                      isRtl && isLeft && "md:text-left",
                      isRtl && !isLeft && "md:text-right"
                    )}
                  >
                    <div
                      className={cn(
                        "bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors",
                        "group"
                      )}
                    >
                      <div className={cn(
                        "flex items-center gap-4 mb-4",
                        isLeft ? "md:justify-end" : "md:justify-start",
                        isRtl && isLeft && "md:justify-start",
                        isRtl && !isLeft && "md:justify-end"
                      )}>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-primary">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className={cn(
                        "text-xl font-semibold text-foreground mb-2",
                        isRtl && "font-urdu"
                      )}>
                        {step.title}
                      </h3>
                      <p className={cn(
                        "text-muted-foreground",
                        isRtl && "font-urdu"
                      )}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Point */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
                      className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg"
                    >
                      {index + 1}
                    </motion.div>
                  </div>

                  {/* Empty Space */}
                  <div className={cn("hidden md:block", !isLeft && "md:order-1")} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
