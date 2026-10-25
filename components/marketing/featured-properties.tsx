"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Shield,
  Star,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

const properties = [
  {
    id: 1,
    title: "Modern Apartment in DHA Phase 5",
    type: "Apartment",
    address: "Block J, DHA Phase 5, Lahore",
    rent: 45000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    verified: true,
    trustScore: 92,
    featured: true,
    rating: 4.8,
    reviews: 24,
  },
  {
    id: 2,
    title: "Luxury Villa in Bahria Town",
    type: "House",
    address: "Sector F, Bahria Town, Lahore",
    rent: 85000,
    bedrooms: 4,
    bathrooms: 3,
    area: 3500,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    verified: true,
    trustScore: 88,
    featured: true,
    rating: 4.9,
    reviews: 18,
  },
  {
    id: 3,
    title: "Studio Apartment near LUMS",
    type: "Apartment",
    address: "Block A, DHA Phase 5, Lahore",
    rent: 25000,
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    verified: true,
    trustScore: 95,
    featured: false,
    rating: 4.7,
    reviews: 31,
  },
  {
    id: 4,
    title: "Executive Flat in Gulberg",
    type: "Apartment",
    address: "Main Boulevard, Gulberg III, Lahore",
    rent: 55000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    verified: true,
    trustScore: 90,
    featured: false,
    rating: 4.6,
    reviews: 12,
  },
  {
    id: 5,
    title: "Penthouse with City View",
    type: "Apartment",
    address: "Block B, Johar Town, Lahore",
    rent: 75000,
    bedrooms: 3,
    bathrooms: 2,
    area: 2000,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    verified: false,
    trustScore: 78,
    featured: false,
    rating: 4.4,
    reviews: 8,
  },
  {
    id: 6,
    title: "Family Home in Model Town",
    type: "House",
    address: "Block C, Model Town, Lahore",
    rent: 65000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
    verified: true,
    trustScore: 85,
    featured: false,
    rating: 4.5,
    reviews: 15,
  },
]

export function FeaturedProperties() {
  const { t, isRtl } = useI18n()
  const [favorites, setFavorites] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const visibleProperties = properties.slice(0, 6)

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-center mb-12", isRtl && "font-urdu")}
        >
          <Badge variant="secondary" className="mb-4">
            {t.features.title}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {t.hero.cta}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified rental properties across Pakistan with AI-powered trust scores
          </p>
        </motion.div>

        {/* Properties Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/properties/${property.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {property.featured && (
                        <Badge className="bg-amber-500">Featured</Badge>
                      )}
                      {property.verified && (
                        <Badge className="bg-emerald-500 gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Trust Score */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur gap-1"
                      >
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        {property.trustScore}%
                      </Badge>
                    </div>

                    {/* Favorite Button */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-3 right-3 h-9 w-9 bg-background/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => toggleFavorite(property.id, e)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(property.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          <span>{property.area} sq.ft</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            PKR {property.rent.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            per month
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="font-medium">{property.rating}</span>
                          <span className="text-muted-foreground">
                            ({property.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/properties">
            <Button size="lg" variant="outline" className="gap-2">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
