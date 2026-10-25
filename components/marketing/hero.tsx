"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: "/hero-villa.jpg",
    tagline: "Discover Luxury Living",
    description: "Find verified villas with AI-powered pricing and trusted landlords.",
    type: "villa",
  },
  {
    id: 2,
    image: "/hero-apartment.jpg",
    tagline: "Smart Apartments in Every City",
    description: "Search thousands of verified apartments across Pakistan.",
    type: "apartment",
  },
  {
    id: 3,
    image: "/hero-room.jpg",
    tagline: "Find Rooms & Perfect Roommates",
    description: "Affordable living with AI roommate matching.",
    type: "room",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handlePrevSlide = () => {
    setIsAutoPlay(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setIsAutoPlay(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-background">
      {/* Background Image Slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.tagline}
              fill
              className="object-cover"
              priority
              quality={95}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content - Fixed Position, No Animation */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
        <div className="max-w-2xl text-center space-y-6">
          {/* Tagline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`tagline-${slide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-4xl md:text-6xl font-bold text-white text-balance"
            >
              {slide.tagline}
            </motion.h1>
          </AnimatePresence>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${slide.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: "easeInOut" }}
              className="text-lg md:text-xl text-white/90"
            >
              {slide.description}
            </motion.p>
          </AnimatePresence>

          {/* CTA Buttons - Static, No Animation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/properties">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50 text-white rounded-xl gap-2 group"
              >
                Start Searching
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/signup?role=landlord">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md rounded-xl"
              >
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlay(false);
              setCurrentSlide(index);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all backdrop-blur-sm",
              currentSlide === index
                ? "bg-white w-8 shadow-lg"
                : "bg-white/40 hover:bg-white/60 w-1.5"
            )}
          />
        ))}
      </div>

      {/* Arrow Controls */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-colors opacity-0 hover:opacity-100"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-colors opacity-0 hover:opacity-100"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-6 md:right-8 text-white/70 text-sm font-medium z-20">
        {currentSlide + 1} / {slides.length}
      </div>
    </section>
  );
}
