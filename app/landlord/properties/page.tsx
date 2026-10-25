"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Bed,
  Bath,
  Square,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Building2,
  Home,
  Store,
  DoorOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
    status: "occupied",
    tenant: "Ali Hassan",
    occupancyRate: 100,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    trustScore: 92,
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
    status: "occupied",
    tenant: "Fatima Khan",
    occupancyRate: 100,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    trustScore: 88,
  },
  {
    id: 3,
    title: "Commercial Shop in Gulberg",
    type: "Commercial",
    address: "MM Alam Road, Gulberg III, Lahore",
    rent: 120000,
    bedrooms: 0,
    bathrooms: 1,
    area: 800,
    status: "vacant",
    tenant: null,
    occupancyRate: 0,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    trustScore: null,
  },
  {
    id: 4,
    title: "Studio Apartment in Model Town",
    type: "Apartment",
    address: "Block C, Model Town, Lahore",
    rent: 25000,
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    status: "occupied",
    tenant: "Ahmed Raza",
    occupancyRate: 100,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    trustScore: 95,
  },
  {
    id: 5,
    title: "Penthouse in Johar Town",
    type: "Apartment",
    address: "Block A, Johar Town, Lahore",
    rent: 75000,
    bedrooms: 3,
    bathrooms: 2,
    area: 2000,
    status: "maintenance",
    tenant: "Sara Ahmed",
    occupancyRate: 100,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    trustScore: 78,
  },
  {
    id: 6,
    title: "Single Room in Student Hostel",
    type: "Room",
    address: "Near LUMS, DHA Phase 5, Lahore",
    rent: 15000,
    bedrooms: 1,
    bathrooms: 1,
    area: 200,
    status: "vacant",
    tenant: null,
    occupancyRate: 0,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
    trustScore: null,
  },
]

const propertyTypes = [
  { value: "all", label: "All Types", icon: Grid3X3 },
  { value: "apartment", label: "Apartments", icon: Building2 },
  { value: "house", label: "Houses", icon: Home },
  { value: "commercial", label: "Commercial", icon: Store },
  { value: "room", label: "Rooms", icon: DoorOpen },
]

export default function LandlordPropertiesPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [addPropertyOpen, setAddPropertyOpen] = useState(false)

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      typeFilter === "all" || property.type.toLowerCase() === typeFilter
    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: properties.length,
    occupied: properties.filter((p) => p.status === "occupied").length,
    vacant: properties.filter((p) => p.status === "vacant").length,
    maintenance: properties.filter((p) => p.status === "maintenance").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all your rental properties
          </p>
        </div>
        <Dialog open={addPropertyOpen} onOpenChange={setAddPropertyOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
              <DialogDescription>
                Fill in the details to list a new property on MakaanX
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" placeholder="e.g., Modern Apartment in DHA Phase 5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rent">Monthly Rent (PKR)</Label>
                  <Input id="rent" type="number" placeholder="45000" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Full address of the property" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" placeholder="2" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" placeholder="2" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area">Area (sq.ft)</Label>
                  <Input id="area" type="number" placeholder="1200" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property, amenities, nearby facilities..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddPropertyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setAddPropertyOpen(false)}>Add Property</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.occupied}</p>
                <p className="text-sm text-muted-foreground">Occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <DoorOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.vacant}</p>
                <p className="text-sm text-muted-foreground">Vacant</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
                <TabsList>
                  <TabsTrigger value="grid" className="gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="h-4 w-4" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <AnimatePresence mode="popLayout">
        {view === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={
                          property.status === "occupied"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : property.status === "vacant"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Tenants
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {property.trustScore && (
                      <div className="absolute bottom-3 right-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur gap-1"
                        >
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          {property.trustScore}% Trust
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {property.title}
                          </h3>
                          <Badge variant="outline" className="shrink-0">
                            {property.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {property.bedrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
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
                          <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                        {property.tenant && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Current Tenant</p>
                            <p className="text-sm font-medium text-foreground">
                              {property.tenant}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredProperties.map((property) => (
                  <motion.div
                    key={property.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-20 w-28 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {property.title}
                        </h3>
                        <Badge variant="outline" className="shrink-0">
                          {property.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {property.address}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {property.bedrooms > 0 && (
                          <span>{property.bedrooms} beds</span>
                        )}
                        <span>{property.bathrooms} baths</span>
                        <span>{property.area} sq.ft</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        PKR {property.rent.toLocaleString()}
                      </p>
                      <Badge
                        className={
                          property.status === "occupied"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : property.status === "vacant"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                        }
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No properties found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your filters or add a new property
            </p>
            <Button className="mt-4 gap-2" onClick={() => setAddPropertyOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
