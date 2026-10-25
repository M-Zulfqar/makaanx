"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  Map,
  Grid3X3,
  Star,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Heart,
  BadgeCheck,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const properties = [
  {
    id: 1,
    title: "Modern Apartment in DHA Phase 5",
    location: "DHA Phase 5, Lahore",
    price: 85000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    trustScore: 94,
    verified: true,
    priceComparison: "below",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Luxury Villa with Garden",
    location: "Bahria Town, Lahore",
    price: 150000,
    beds: 5,
    baths: 4,
    sqft: 3500,
    trustScore: 97,
    verified: true,
    priceComparison: "at",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Cozy Studio in Gulberg",
    location: "Gulberg III, Lahore",
    price: 45000,
    beds: 1,
    baths: 1,
    sqft: 650,
    trustScore: 91,
    verified: true,
    priceComparison: "below",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Penthouse in F-7",
    location: "F-7, Islamabad",
    price: 250000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    trustScore: 98,
    verified: true,
    priceComparison: "above",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Family Home in Model Town",
    location: "Model Town, Lahore",
    price: 120000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    trustScore: 93,
    verified: true,
    priceComparison: "at",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "Modern Flat in Clifton",
    location: "Clifton, Karachi",
    price: 95000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    trustScore: 89,
    verified: false,
    priceComparison: "below",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop",
  },
];

export default function PropertiesPage() {
  const { t, isRtl } = useI18n();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([20000, 200000]);
  const [minTrustScore, setMinTrustScore] = useState(70);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [bedrooms, setBedrooms] = useState("any");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const filteredProperties = properties.filter((property) => {
    if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) && !property.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false;
    }
    if (property.trustScore < minTrustScore) {
      return false;
    }
    if (verifiedOnly && !property.verified) {
      return false;
    }
    if (bedrooms !== "any" && property.beds !== parseInt(bedrooms)) {
      return false;
    }
    return true;
  });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className={cn(isRtl && "font-urdu")}>{t.properties.budget}</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={10000}
          max={500000}
          step={5000}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Rs {priceRange[0].toLocaleString()}</span>
          <span>Rs {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className={cn(isRtl && "font-urdu")}>{t.properties.bedrooms}</Label>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1 Bedroom</SelectItem>
            <SelectItem value="2">2 Bedrooms</SelectItem>
            <SelectItem value="3">3 Bedrooms</SelectItem>
            <SelectItem value="4">4 Bedrooms</SelectItem>
            <SelectItem value="5">5+ Bedrooms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className={cn(isRtl && "font-urdu")}>{t.properties.trustScore}</Label>
        <Slider
          value={[minTrustScore]}
          onValueChange={(v) => setMinTrustScore(v[0])}
          min={0}
          max={100}
          step={5}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground">Min: {minTrustScore}%</p>
      </div>

      <div className="flex items-center justify-between">
        <Label className={cn(isRtl && "font-urdu")}>{t.properties.verified}</Label>
        <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "text-2xl md:text-3xl font-bold text-foreground",
            isRtl && "font-urdu text-right"
          )}>
            {t.properties.title}
          </h1>
          <p className="text-muted-foreground">
            {filteredProperties.length} properties available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("map")}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
            isRtl ? "right-3" : "left-3"
          )} />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("h-11", isRtl ? "pr-10" : "pl-10")}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 h-11">
              <SlidersHorizontal className="h-4 w-4" />
              {t.properties.filters}
            </Button>
          </SheetTrigger>
          <SheetContent side={isRtl ? "left" : "right"}>
            <SheetHeader>
              <SheetTitle>{t.properties.filters}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Card className="overflow-hidden border-border hover:border-primary/30 transition-all group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {property.trustScore}%
                        </Badge>
                        {property.verified && (
                          <Badge className="bg-success text-success-foreground gap-1">
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(property.id);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Heart
                          className={cn(
                            "h-5 w-5",
                            favorites.includes(property.id)
                              ? "fill-destructive text-destructive"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                      {/* Price Comparison Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "gap-1",
                            property.priceComparison === "below" && "bg-success/90 text-success-foreground",
                            property.priceComparison === "above" && "bg-destructive/90 text-destructive-foreground",
                            property.priceComparison === "at" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {property.priceComparison === "below" && <TrendingDown className="h-3 w-3" />}
                          {property.priceComparison === "above" && <TrendingUp className="h-3 w-3" />}
                          {property.priceComparison === "at" && <Minus className="h-3 w-3" />}
                          {property.priceComparison === "below" && "Below Market"}
                          {property.priceComparison === "above" && "Above Market"}
                          {property.priceComparison === "at" && "At Market"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4" />
                          {property.beds} beds
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.baths} baths
                        </span>
                        <span className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          {property.sqft} sqft
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-primary">
                          Rs {property.price.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                        <Button size="sm">{t.properties.viewDetails}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]"
          >
            {/* Map Placeholder */}
            <div className="bg-muted rounded-xl flex items-center justify-center order-2 lg:order-1">
              <div className="text-center">
                <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive Map View</p>
                <p className="text-sm text-muted-foreground">
                  Click on markers to view properties
                </p>
              </div>
            </div>

            {/* Property List */}
            <div className="space-y-4 overflow-y-auto order-1 lg:order-2">
              {filteredProperties.map((property) => (
                <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                            {property.title}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />
                            {property.location}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3" />
                              {property.trustScore}%
                            </Badge>
                            {property.verified && (
                              <Badge className="bg-success/10 text-success gap-1">
                                <BadgeCheck className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg font-bold text-primary">
                            Rs {property.price.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
