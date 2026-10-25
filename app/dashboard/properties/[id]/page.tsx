"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Heart,
  Share2,
  BadgeCheck,
  Car,
  Wifi,
  Snowflake,
  Shield,
  Dumbbell,
  Trees,
  ArrowLeft,
  Calendar,
  TrendingDown,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const property = {
  id: 1,
  title: "Modern Apartment in DHA Phase 5",
  location: "DHA Phase 5, Lahore",
  fullAddress: "House 123, Street 45, DHA Phase 5, Lahore Cantt",
  price: 85000,
  beds: 3,
  baths: 2,
  sqft: 1800,
  trustScore: 94,
  verified: true,
  marketPrice: 92000,
  description: "Beautifully designed modern apartment in the heart of DHA Phase 5. This spacious 3-bedroom apartment features contemporary finishes, large windows with plenty of natural light, and a modern open-plan kitchen. Perfect for families looking for a comfortable and secure living space.",
  amenities: [
    { icon: Car, label: "Parking" },
    { icon: Wifi, label: "High-Speed Internet" },
    { icon: Snowflake, label: "Air Conditioning" },
    { icon: Shield, label: "24/7 Security" },
    { icon: Dumbbell, label: "Gym Access" },
    { icon: Trees, label: "Garden" },
  ],
  images: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
  ],
  owner: {
    name: "Ahmed Hassan",
    avatar: "AH",
    trustScore: 96,
    responseTime: "Usually responds within 2 hours",
    totalListings: 5,
    memberSince: "2023",
  },
};

export default function PropertyDetailsPage() {
  const { t, isRtl } = useI18n();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const savingsPercentage = Math.round(((property.marketPrice - property.price) / property.marketPrice) * 100);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/properties">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
            Back to Properties
          </Button>
        </Link>
      </div>

      {/* Image Gallery with Parallax Effect */}
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden group">
        <motion.img
          key={currentImage}
          src={property.images[currentImage]}
          alt={property.title}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Image Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentImage ? "w-6 bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-primary text-primary-foreground gap-1 text-sm">
            <Star className="h-4 w-4 fill-current" />
            {property.trustScore}% Trust Score
          </Badge>
          {property.verified && (
            <Badge className="bg-success text-success-foreground gap-1">
              <BadgeCheck className="h-4 w-4" />
              Verified
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={cn(
              "h-5 w-5",
              isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
            )} />
          </Button>
          <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {property.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={cn(
              "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
              index === currentImage ? "border-primary" : "border-transparent"
            )}
          >
            <img src={image} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Location */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {property.title}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {property.fullAddress}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              <span className="font-medium">{property.beds} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-primary" />
              <span className="font-medium">{property.baths} Bathrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5 text-primary" />
              <span className="font-medium">{property.sqft} sq ft</span>
            </div>
          </div>

          {/* Description */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Price Prediction */}
          <Card className="border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-success" />
                AI Price Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-background rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Listed Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    Rs {property.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-background rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Market Price</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    Rs {property.marketPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-xl">
                  <p className="text-sm text-success mb-1">Your Savings</p>
                  <p className="text-2xl font-bold text-success">
                    {savingsPercentage}% Below Market
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Our AI analyzed 500+ similar properties to provide this estimate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <Card className="border-border">
              <CardContent className="p-6">
                {/* Price */}
                <div className="mb-6">
                  <p className="text-3xl font-bold text-foreground">
                    Rs {property.price.toLocaleString()}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </p>
                  <Badge className="bg-success/10 text-success gap-1 mt-2">
                    <TrendingDown className="h-3 w-3" />
                    {savingsPercentage}% below market
                  </Badge>
                </div>

                {/* Owner Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {property.owner.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{property.owner.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span>{property.owner.trustScore}% Trust Score</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {property.owner.responseTime}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full h-12 text-base gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Visit
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-11 gap-2">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button variant="outline" className="h-11 gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Score Card */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Trust Score Breakdown</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="text-primary"
                      initial={{ strokeDasharray: "0 352" }}
                      animate={{ strokeDasharray: `${(property.trustScore / 100) * 352} 352` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">
                      {property.trustScore}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Owner Verification</span>
                    <span className="text-success">Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Document Check</span>
                    <span className="text-success">Passed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Property Visit</span>
                    <span className="text-success">Confirmed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
