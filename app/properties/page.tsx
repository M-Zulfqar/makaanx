"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
  Shield,
  Star,
  TrendingUp,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

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

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad"]
const propertyTypes = ["All Types", "Apartment", "House", "Room", "Commercial"]

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([10000, 100000])
  const [selectedCity, setSelectedCity] = useState("Lahore")
  const [selectedType, setSelectedType] = useState("All Types")
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice =
      property.rent >= priceRange[0] && property.rent <= priceRange[1]
    const matchesType =
      selectedType === "All Types" || property.type === selectedType
    return matchesSearch && matchesPrice && matchesType
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-8 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your Perfect Home
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse verified properties across Pakistan with AI-powered trust scores
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-4 shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by location, property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full md:w-40 h-12">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-40 h-12">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="lg" className="h-12 px-8">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-foreground font-medium">
                {filteredProperties.length} properties found in {selectedCity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Properties</SheetTitle>
                    <SheetDescription>
                      Refine your search with these filters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-4">
                      <Label>Price Range (PKR)</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={5000}
                        max={200000}
                        step={5000}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>PKR {priceRange[0].toLocaleString()}</span>
                        <span>PKR {priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Bedrooms</Label>
                      <div className="flex gap-2">
                        {["Any", "1", "2", "3", "4+"].map((bed) => (
                          <Button key={bed} variant="outline" size="sm">
                            {bed}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Amenities</Label>
                      <div className="space-y-2">
                        {["Parking", "Furnished", "AC", "WiFi", "Security"].map(
                          (amenity) => (
                            <div
                              key={amenity}
                              className="flex items-center gap-2"
                            >
                              <Checkbox id={amenity} />
                              <Label htmlFor={amenity} className="font-normal">
                                {amenity}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Verified Only</Label>
                      <Checkbox />
                    </div>

                    <Button className="w-full">Apply Filters</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setView("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div
            className={
              view === "grid"
                ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/properties/${property.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                    {view === "grid" ? (
                      <>
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
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite(property.id)
                            }}
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
                                <span className="font-medium">
                                  {property.rating}
                                </span>
                                <span className="text-muted-foreground">
                                  ({property.reviews})
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <div className="flex gap-4 p-4">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="h-32 w-48 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {property.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {property.address}
                              </p>
                            </div>
                            {property.verified && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 gap-1">
                                <Shield className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{property.bedrooms} beds</span>
                            <span>{property.bathrooms} baths</span>
                            <span>{property.area} sq.ft</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-lg font-bold text-foreground">
                              PKR {property.rent.toLocaleString()}/mo
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              <span>{property.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Card className="p-8 bg-primary/5 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Want to list your property?
              </h3>
              <p className="text-muted-foreground mb-4">
                Join thousands of landlords on MakaanX and find verified tenants
              </p>
              <Link href="/auth/signup">
                <Button size="lg">List Your Property</Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
