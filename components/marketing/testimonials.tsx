"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Faizan Ahmed",
    nameUrdu: "فیضان احمد",
    role: "Tenant",
    roleUrdu: "کرایہ دار",
    location: "Lahore",
    locationUrdu: "لاہور",
    content: "MakaanX helped me find a verified home in just 3 days. The AI trust score gave me confidence that the listing was genuine.",
    contentUrdu: "MakaanX نے مجھے صرف 3 دنوں میں تصدیق شدہ گھر تلاش کرنے میں مدد کی۔ AI ٹرسٹ سکور نے مجھے اعتماد دیا کہ لسٹنگ اصلی ہے۔",
    rating: 5,
    avatar: "FA",
  },
  {
    id: 2,
    name: "Ayesha Khan",
    nameUrdu: "عائشہ خان",
    role: "Landlord",
    roleUrdu: "مالک مکان",
    location: "Karachi",
    locationUrdu: "کراچی",
    content: "As a landlord, I love how the platform handles payments and agreements digitally. It has made property management so much easier.",
    contentUrdu: "ایک مالک مکان کے طور پر، مجھے پسند ہے کہ پلیٹ فارم ادائیگیوں اور معاہدوں کو ڈیجیٹل طور پر کیسے سنبھالتا ہے۔",
    rating: 5,
    avatar: "AK",
  },
  {
    id: 3,
    name: "Hassan Ali",
    nameUrdu: "حسن علی",
    role: "Tenant",
    roleUrdu: "کرایہ دار",
    location: "Islamabad",
    locationUrdu: "اسلام آباد",
    content: "The roommate matching feature is amazing! Found a compatible roommate who shares my lifestyle and budget preferences.",
    contentUrdu: "روم میٹ میچنگ فیچر حیرت انگیز ہے! ایک ہم آہنگ روم میٹ ملا جو میری طرز زندگی اور بجٹ کی ترجیحات شیئر کرتا ہے۔",
    rating: 5,
    avatar: "HA",
  },
  {
    id: 4,
    name: "Sara Malik",
    nameUrdu: "سارہ ملک",
    role: "Landlord",
    roleUrdu: "مالک مکان",
    location: "Rawalpindi",
    locationUrdu: "راولپنڈی",
    content: "The AI rent prediction helped me price my property correctly. Got great tenants within a week of listing!",
    contentUrdu: "AI کرایہ کی پیشگوئی نے مجھے اپنی پراپرٹی کی صحیح قیمت لگانے میں مدد کی۔ لسٹنگ کے ایک ہفتے کے اندر عمدہ کرایہ دار مل گئے!",
    rating: 5,
    avatar: "SM",
  },
];

export function TestimonialsSection() {
  const { t, language, isRtl } = useI18n();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
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
            {t.testimonials.title}
          </h2>
          <p className={cn(
            "text-lg text-muted-foreground",
            isRtl && "font-urdu"
          )}>
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-8 right-8 h-16 w-16 text-primary/10" />

              {/* Content */}
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className={cn(
                  "text-xl md:text-2xl text-foreground mb-8 leading-relaxed",
                  isRtl && "font-urdu text-right"
                )}>
                  &ldquo;{language === "ur" ? testimonials[current].contentUrdu : testimonials[current].content}&rdquo;
                </p>

                {/* Author */}
                <div className={cn(
                  "flex items-center gap-4",
                  isRtl && "flex-row-reverse"
                )}>
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {testimonials[current].avatar}
                  </div>
                  <div className={isRtl ? "text-right" : ""}>
                    <h4 className={cn(
                      "font-semibold text-foreground",
                      isRtl && "font-urdu"
                    )}>
                      {language === "ur" ? testimonials[current].nameUrdu : testimonials[current].name}
                    </h4>
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isRtl && "font-urdu"
                    )}>
                      {language === "ur" ? testimonials[current].roleUrdu : testimonials[current].role} • {language === "ur" ? testimonials[current].locationUrdu : testimonials[current].location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full"
            >
              <ChevronLeft className={cn("h-5 w-5", isRtl && "rotate-180")} />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrent(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === current
                      ? "w-8 bg-primary"
                      : "bg-primary/30 hover:bg-primary/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full"
            >
              <ChevronRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
