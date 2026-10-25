"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ArrowRight, Zap, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    name: "Tenant Starter",
    description: "Perfect for renters exploring properties",
    price: "Free",
    icon: Users,
    features: [
      { text: "Search unlimited properties", included: true },
      { text: "Save favorites (5 max)", included: true },
      { text: "View property details", included: true },
      { text: "Contact landlords", included: false },
      { text: "Schedule viewings", included: false },
      { text: "AI rent predictions", included: false },
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Tenant Premium",
    description: "For serious property hunters",
    price: "PKR 499",
    period: "per month",
    icon: Zap,
    features: [
      { text: "Search unlimited properties", included: true },
      { text: "Save favorites (unlimited)", included: true },
      { text: "View property details", included: true },
      { text: "Contact landlords", included: true },
      { text: "Schedule viewings", included: true },
      { text: "AI rent predictions", included: true },
    ],
    cta: "Subscribe Now",
    highlighted: true,
  },
  {
    name: "Landlord Professional",
    description: "Manage properties efficiently",
    price: "PKR 1,999",
    period: "per month",
    icon: Building2,
    features: [
      { text: "List unlimited properties", included: true },
      { text: "Tenant screening tools", included: true },
      { text: "Payment collection", included: true },
      { text: "Maintenance requests", included: true },
      { text: "Analytics & reports", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start Listing",
    highlighted: false,
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Transparent Pricing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-balance"
          >
            Simple, Fair Pricing for Everyone
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto"
          >
            Choose the perfect plan to find your dream property or manage your rentals with ease.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-all",
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const annualPrice = plan.price !== "Free" 
                ? Math.floor(parseInt(plan.price) * 12 * 0.8).toString()
                : "Free";

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  {plan.highlighted && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-50" />
                  )}
                  
                  <Card className={cn(
                    "relative h-full",
                    plan.highlighted && "border-primary/50 shadow-2xl"
                  )}>
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          plan.highlighted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Price */}
                      <div>
                        {plan.price === "Free" ? (
                          <div className="text-4xl font-bold">Free</div>
                        ) : (
                          <>
                            <div className="text-4xl font-bold">
                              {billingCycle === "monthly" ? plan.price : `PKR ${annualPrice}`}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {billingCycle === "monthly"
                                ? `${plan.period}`
                                : "per year (billed annually)"
                              }
                            </p>
                          </>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-4">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={cn(
                              "text-sm",
                              !feature.included && "text-muted-foreground/50"
                            )}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        className={cn(
                          "w-full h-11",
                          plan.highlighted
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border hover:bg-muted"
                        )}
                        variant={plan.highlighted ? "default" : "outline"}
                        asChild
                      >
                        <Link href={plan.name.includes("Tenant") ? "/auth/signup" : "/auth/signup?role=landlord"}>
                          {plan.cta}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I change my plan anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and mobile payment methods including EasyPaisa and JazzCash.",
              },
              {
                q: "Is there a free trial for premium plans?",
                a: "Yes, all premium plans come with a 7-day free trial. No credit card required.",
              },
              {
                q: "What happens if I cancel?",
                a: "You can cancel anytime. Your access continues until the end of your billing cycle.",
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
