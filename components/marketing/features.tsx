"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import {
  Brain,
  TrendingUp,
  BadgeCheck,
  FileSignature,
  CreditCard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const featureIcons = [
  Brain,
  TrendingUp,
  BadgeCheck,
  FileSignature,
  CreditCard,
  Users,
];

export function FeaturesSection() {
  const { t, isRtl } = useI18n();

  const features = [
    { ...t.features.trustScore, icon: Brain },
    { ...t.features.rentPrediction, icon: TrendingUp },
    { ...t.features.verifiedListings, icon: BadgeCheck },
    { ...t.features.digitalAgreements, icon: FileSignature },
    { ...t.features.securePayments, icon: CreditCard },
    { ...t.features.roommateMatching, icon: Users },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4",
            isRtl && "font-urdu"
          )}>
            {t.features.title}
          </h2>
          <p className={cn(
            "text-lg text-muted-foreground",
            isRtl && "font-urdu"
          )}>
            {t.features.subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 transition-colors duration-300">
                  {/* Icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-7 w-7 text-primary" />
                  </motion.div>

                  {/* Content */}
                  <h3 className={cn(
                    "text-xl font-semibold text-foreground mb-3",
                    isRtl && "font-urdu text-right"
                  )}>
                    {feature.title}
                  </h3>
                  <p className={cn(
                    "text-muted-foreground leading-relaxed",
                    isRtl && "font-urdu text-right"
                  )}>
                    {feature.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
