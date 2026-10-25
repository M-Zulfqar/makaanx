"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Shield,
  Star,
  TrendingUp,
  Phone,
  MessageCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Snowflake,
  Tv,
  Lock,
  Dumbbell,
  Users,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

const properties = [
  {
    id: "1",
    title: "Modern Apartment in DHA Phase 5",
    type: "Apartment",
    address: "Block J, DHA Phase 5, Lahore",
    rent: 45000,
    securityDeposit: 90000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    floor: "3rd Floor",
    totalFloors: 6,
    furnishing: "Semi-Furnished",
    facing: "North",
    age: "2 years old",
    availableFrom: "Immediate",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    ],
    verified: true,
    trustScore: 92,
    featured: true,
    rating: 4.8,
    reviews: 24,
    description:
      "Beautiful modern apartment in the heart of DHA Phase 5. This spacious 2-bedroom apartment features contemporary design, large windows with plenty of natural light, and premium finishes throughout. Perfect for young professionals or small families looking for a comfortable living space in a prime location.",
    amenities: [
      { icon: Wifi, label: "High-Speed WiFi" },
      { icon: Car, label: "Parking Space" },
      { icon: Snowflake, label: "Air Conditioning" },
      { icon: Tv, label: "Cable TV" },
      { icon: Lock, label: "24/7 Security" },
      { icon: Dumbbell, label: "Gym Access" },
    ],
    landlord: {
      name: "Ahmed Hassan",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      verified: true,
      trustScore: 94,
      properties: 5,
      memberSince: "2022",
      responseTime: "Usually responds within 1 hour",
    },
    nearbyPlaces: [
      { name: "LUMS University", distance: "5 min drive" },
      { name: "Packages Mall", distance: "10 min drive" },
      { name: "DHA Phase 5 Market", distance: "2 min walk" },
      { name: "CMH Hospital", distance: "15 min drive" },
    ],
  },
  {
    id: "2",
    title: "Luxury Villa in Bahria Town",
    type: "House",
    address: "Sector F, Bahria Town, Lahore",
    rent: 85000,
    securityDeposit: 170000,
    bedrooms: 4,
    bathrooms: 3,
    area: 3500,
    floor: "Ground + 1",
    totalFloors: 2,
    furnishing: "Fully Furnished",
    facing: "East",
    age: "Brand New",
    availableFrom: "May 1, 2026",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    verified: true,
    trustScore: 88,
    featured: true,
    rating: 4.9,
    reviews: 18,
    description:
      "Stunning luxury villa in the prestigious Sector F of Bahria Town. This fully furnished 4-bedroom house offers the ultimate in comfort and style. Features include a modern kitchen, spacious living areas, a beautiful garden, and top-of-the-line security systems.",
    amenities: [
      { icon: Wifi, label: "High-Speed WiFi" },
      { icon: Car, label: "2 Car Garage" },
      { icon: Snowflake, label: "Central AC" },
      { icon: Tv, label: "Smart TV" },
      { icon: Lock, label: "Gated Community" },
      { icon: Dumbbell, label: "Private Gym" },
    ],
    landlord: {
      name: "Fatima Khan",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      verified: true,
      trustScore: 96,
      properties: 8,
      memberSince: "2021",
      responseTime: "Usually responds within 30 minutes",
    },
    nearbyPlaces: [
      { name: "Bahria Town Hospital", distance: "3 min drive" },
      { name: "Grand Jamia Mosque", distance: "5 min drive" },
      { name: "Arena Cinema", distance: "10 min drive" },
      { name: "Eiffel Tower Replica", distance: "8 min drive" },
    ],
  },
]

export default function PropertyDetailsPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const property = properties.find((p) => p.id === params.id) || properties[0]

  const handleContactClick = () => {
    setShowAuthPrompt(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 max-w-md w-full shadow-2xl border border-border"
          >
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Sign in Required
              </h3>
              <p className="text-muted-foreground mb-6">
                To contact the landlord and view their details, you need to create an
                account or sign in.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/auth/signup">
                  <Button className="w-full" size="lg">
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full" size="lg">
                    Sign In
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => setShowAuthPrompt(false)}
                  className="w-full"
                >
                  Continue Browsing
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Back Button */}
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Properties
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <div className="aspect-[16/10] relative">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="object-cover w-full h-full"
                  />

                  {/* Navigation Buttons */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
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

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-background/80 backdrop-blur"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-background/80 backdrop-blur"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 mt-2">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-1 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Property Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">
                          {property.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{property.address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-foreground">
                          PKR {property.rent.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <Badge
                        variant="secondary"
                        className="gap-1 bg-emerald-500/10 text-emerald-600"
                      >
                        <TrendingUp className="h-3 w-3" />
                        Trust Score: {property.trustScore}%
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{property.rating}</span>
                        <span className="text-muted-foreground">
                          ({property.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Bed className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bedrooms</p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Bath className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bathrooms</p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Square className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Area</p>
                          <p className="font-semibold">{property.area} sq.ft</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Available</p>
                          <p className="font-semibold">{property.availableFrom}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Description */}
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-foreground mb-3">
                        About this property
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {property.description}
                      </p>
                    </div>

                    {/* Property Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="font-medium">{property.type}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Furnishing</p>
                        <p className="font-medium">{property.furnishing}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Floor</p>
                        <p className="font-medium">
                          {property.floor} of {property.totalFloors}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Facing</p>
                        <p className="font-medium">{property.facing}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Property Age</p>
                        <p className="font-medium">{property.age}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Security Deposit
                        </p>
                        <p className="font-medium">
                          PKR {property.securityDeposit.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Amenities */}
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-4">
                        Amenities
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {property.amenities.map((amenity) => (
                          <div
                            key={amenity.label}
                            className="flex items-center gap-3"
                          >
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <amenity.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-sm">{amenity.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Nearby Places */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Nearby Places</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {property.nearbyPlaces.map((place) => (
                        <div
                          key={place.name}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <span className="font-medium">{place.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {place.distance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Landlord Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage src={property.landlord.image} />
                        <AvatarFallback>
                          {property.landlord.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold text-foreground">
                        {property.landlord.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {property.landlord.verified && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {property.landlord.trustScore}%
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Properties</span>
                        <span className="font-medium">
                          {property.landlord.properties} listings
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium">
                          {property.landlord.memberSince}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{property.landlord.responseTime}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full gap-2" onClick={handleContactClick}>
                        <Phone className="h-4 w-4" />
                        Contact Landlord
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleContactClick}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Send Message
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full gap-2"
                        onClick={handleContactClick}
                      >
                        <Calendar className="h-4 w-4" />
                        Schedule Visit
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Sign in to contact the landlord and schedule visits
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
