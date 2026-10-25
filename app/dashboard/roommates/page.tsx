"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Heart,
  MessageSquare,
  Shield,
  Cigarette,
  Coffee,
  Moon,
  Sun,
  Music,
  Dumbbell,
  Dog,
  Utensils,
  Sparkles,
  Users,
  Clock,
  CreditCard,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const roommates = [
  {
    id: 1,
    name: "Ali Hassan",
    age: 26,
    occupation: "Software Engineer",
    company: "LUMS Graduate",
    location: "DHA Phase 5, Lahore",
    budget: "25,000 - 35,000",
    moveIn: "Immediate",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    verified: true,
    trustScore: 92,
    compatibility: 95,
    bio: "Software engineer at a tech startup. Looking for a clean, quiet flatmate. I work from home 3 days a week and enjoy cooking on weekends.",
    preferences: {
      smoking: false,
      pets: true,
      nightOwl: false,
      earlyBird: true,
      cooking: true,
      fitness: true,
      music: false,
    },
    languages: ["English", "Urdu"],
    interests: ["Tech", "Cricket", "Cooking", "Hiking"],
  },
  {
    id: 2,
    name: "Sara Ahmed",
    age: 24,
    occupation: "Medical Student",
    company: "King Edward Medical University",
    location: "Gulberg, Lahore",
    budget: "15,000 - 25,000",
    moveIn: "Next Month",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    verified: true,
    trustScore: 88,
    compatibility: 87,
    bio: "Final year medical student looking for a peaceful environment. I study a lot but also enjoy movies and good conversation.",
    preferences: {
      smoking: false,
      pets: false,
      nightOwl: true,
      earlyBird: false,
      cooking: false,
      fitness: true,
      music: true,
    },
    languages: ["English", "Urdu", "Punjabi"],
    interests: ["Medicine", "Movies", "Reading", "Yoga"],
  },
  {
    id: 3,
    name: "Usman Malik",
    age: 28,
    occupation: "Marketing Manager",
    company: "Unilever Pakistan",
    location: "Bahria Town, Lahore",
    budget: "30,000 - 45,000",
    moveIn: "Flexible",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    coverImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    verified: true,
    trustScore: 85,
    compatibility: 78,
    bio: "Working professional who travels frequently. Looking for a responsible flatmate to share a spacious apartment.",
    preferences: {
      smoking: false,
      pets: true,
      nightOwl: false,
      earlyBird: true,
      cooking: true,
      fitness: true,
      music: true,
    },
    languages: ["English", "Urdu"],
    interests: ["Travel", "Football", "Photography", "Business"],
  },
  {
    id: 4,
    name: "Fatima Khan",
    age: 25,
    occupation: "UX Designer",
    company: "Freelancer",
    location: "Model Town, Lahore",
    budget: "20,000 - 30,000",
    moveIn: "Immediate",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    verified: false,
    trustScore: 75,
    compatibility: 82,
    bio: "Creative designer working from home. I value artistic expression and enjoy hosting small gatherings occasionally.",
    preferences: {
      smoking: false,
      pets: true,
      nightOwl: true,
      earlyBird: false,
      cooking: true,
      fitness: false,
      music: true,
    },
    languages: ["English", "Urdu"],
    interests: ["Art", "Design", "Music", "Coffee"],
  },
  {
    id: 5,
    name: "Hassan Raza",
    age: 27,
    occupation: "Accountant",
    company: "KPMG Pakistan",
    location: "Johar Town, Lahore",
    budget: "20,000 - 30,000",
    moveIn: "Next Month",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
    verified: true,
    trustScore: 90,
    compatibility: 85,
    bio: "Chartered accountant with a structured lifestyle. Early riser, gym enthusiast, and appreciate a clean living space.",
    preferences: {
      smoking: false,
      pets: false,
      nightOwl: false,
      earlyBird: true,
      cooking: false,
      fitness: true,
      music: false,
    },
    languages: ["English", "Urdu"],
    interests: ["Finance", "Fitness", "Cricket", "Books"],
  },
  {
    id: 6,
    name: "Ayesha Tariq",
    age: 23,
    occupation: "Content Writer",
    company: "Remote Worker",
    location: "DHA Phase 6, Lahore",
    budget: "18,000 - 28,000",
    moveIn: "Flexible",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    coverImage: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    verified: true,
    trustScore: 86,
    compatibility: 91,
    bio: "Freelance content writer who loves quiet mornings and creative evenings. Looking for a like-minded roommate.",
    preferences: {
      smoking: false,
      pets: true,
      nightOwl: true,
      earlyBird: false,
      cooking: true,
      fitness: false,
      music: true,
    },
    languages: ["English", "Urdu"],
    interests: ["Writing", "Podcasts", "Cooking", "Plants"],
  },
]

const lifestyleIcons = {
  smoking: Cigarette,
  pets: Dog,
  nightOwl: Moon,
  earlyBird: Sun,
  cooking: Utensils,
  fitness: Dumbbell,
  music: Music,
}

export default function RoommatesPage() {
  const [liked, setLiked] = useState<number[]>([])
  const [selectedRoommate, setSelectedRoommate] = useState<typeof roommates[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    budgetRange: [15000, 50000],
    location: "all",
    gender: "all",
    moveIn: "all",
  })

  const filteredRoommates = roommates.filter((r) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        r.name.toLowerCase().includes(query) ||
        r.occupation.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (liked.includes(id)) {
      setLiked(liked.filter((l) => l !== id))
    } else {
      setLiked([...liked, id])
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Roommate Finder
          </h1>
          <p className="text-muted-foreground mt-1">
            Find your perfect roommate with AI-powered compatibility matching
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Roommates</SheetTitle>
              <SheetDescription>
                Adjust your preferences to find better matches
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-4">
                <Label>Budget Range (PKR)</Label>
                <Slider
                  value={filters.budgetRange}
                  onValueChange={(value) =>
                    setFilters({ ...filters, budgetRange: value })
                  }
                  min={5000}
                  max={100000}
                  step={5000}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>PKR {filters.budgetRange[0].toLocaleString()}</span>
                  <span>PKR {filters.budgetRange[1].toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => setFilters({ ...filters, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="dha">DHA</SelectItem>
                    <SelectItem value="bahria">Bahria Town</SelectItem>
                    <SelectItem value="gulberg">Gulberg</SelectItem>
                    <SelectItem value="model-town">Model Town</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Move-in Timeline</Label>
                <Select
                  value={filters.moveIn}
                  onValueChange={(value) => setFilters({ ...filters, moveIn: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="next-month">Next Month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label>Lifestyle Preferences</Label>
                <div className="space-y-3">
                  {[
                    { key: "noSmoking", label: "Non-smoker only" },
                    { key: "petsOk", label: "Pet friendly" },
                    { key: "verifiedOnly", label: "Verified profiles only" },
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between">
                      <span className="text-sm">{pref.label}</span>
                      <Switch />
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roommates.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Heart className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{liked.length}</p>
              <p className="text-sm text-muted-foreground">Liked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Matches</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, occupation, or location..."
          className="pl-10 h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Roommates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoommates.map((roommate, index) => (
          <motion.div
            key={roommate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-full"
              onClick={() => setSelectedRoommate(roommate)}
            >
              {/* Cover Image */}
              <div className="relative h-40">
                <img
                  src={roommate.coverImage}
                  alt={roommate.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Compatibility Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground gap-1 px-2 py-1">
                    <Sparkles className="h-3 w-3" />
                    {roommate.compatibility}% Match
                  </Badge>
                </div>

                {/* Like Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "absolute top-3 left-3 h-9 w-9 rounded-full",
                    liked.includes(roommate.id)
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-black/30 text-white hover:bg-black/50"
                  )}
                  onClick={(e) => handleLike(roommate.id, e)}
                >
                  <Heart className={cn("h-4 w-4", liked.includes(roommate.id) && "fill-current")} />
                </Button>

                {/* Avatar */}
                <div className="absolute -bottom-8 left-4">
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={roommate.avatar} />
                    <AvatarFallback>{roommate.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <CardContent className="pt-10 pb-4">
                {/* Name & Verification */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">
                    {roommate.name}, {roommate.age}
                  </h3>
                  {roommate.verified && (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs gap-0.5">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Occupation */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {roommate.occupation}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  {roommate.location}
                </div>

                {/* Budget & Move-in */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      Budget
                    </div>
                    <p className="font-medium text-sm">PKR {roommate.budget}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Move-in
                    </div>
                    <p className="font-medium text-sm">{roommate.moveIn}</p>
                  </div>
                </div>

                {/* Trust Score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Trust Score</span>
                    <span className="font-medium">{roommate.trustScore}%</span>
                  </div>
                  <Progress value={roommate.trustScore} className="h-1.5" />
                </div>

                {/* Lifestyle Icons */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(roommate.preferences)
                    .filter(([_, value]) => value)
                    .slice(0, 4)
                    .map(([key]) => {
                      const Icon = lifestyleIcons[key as keyof typeof lifestyleIcons]
                      return (
                        <div
                          key={key}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
                          title={key.replace(/([A-Z])/g, " $1").trim()}
                        >
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Roommate Detail Dialog */}
      <Dialog open={!!selectedRoommate} onOpenChange={() => setSelectedRoommate(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedRoommate && (
            <>
              <div className="relative h-48 -mx-6 -mt-6 mb-4">
                <img
                  src={selectedRoommate.coverImage}
                  alt={selectedRoommate.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
                  <Avatar className="h-20 w-20 border-4 border-background">
                    <AvatarImage src={selectedRoommate.avatar} />
                    <AvatarFallback>{selectedRoommate.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="text-white flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {selectedRoommate.name}, {selectedRoommate.age}
                      </h2>
                      {selectedRoommate.verified && (
                        <Badge className="bg-emerald-500 gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/80 text-sm">{selectedRoommate.occupation}</p>
                  </div>
                </div>

                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground gap-1">
                  <Sparkles className="h-3 w-3" />
                  {selectedRoommate.compatibility}% Match
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground text-sm">{selectedRoommate.bio}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </div>
                    <p className="font-medium text-sm">{selectedRoommate.location}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <CreditCard className="h-3 w-3" />
                      Budget
                    </div>
                    <p className="font-medium text-sm">PKR {selectedRoommate.budget}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      Move-in
                    </div>
                    <p className="font-medium text-sm">{selectedRoommate.moveIn}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Shield className="h-3 w-3" />
                      Trust Score
                    </div>
                    <p className="font-medium text-sm">{selectedRoommate.trustScore}%</p>
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <h3 className="font-semibold mb-2">Lifestyle</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedRoommate.preferences).map(([key, value]) => {
                      const Icon = lifestyleIcons[key as keyof typeof lifestyleIcons]
                      return (
                        <Badge
                          key={key}
                          variant="outline"
                          className={cn(
                            value
                              ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/5"
                              : "border-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoommate.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoommate.languages.join(", ")}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 gap-2",
                    liked.includes(selectedRoommate.id) && "border-red-500 text-red-500"
                  )}
                  onClick={(e) => handleLike(selectedRoommate.id, e)}
                >
                  <Heart className={cn("h-4 w-4", liked.includes(selectedRoommate.id) && "fill-current")} />
                  {liked.includes(selectedRoommate.id) ? "Liked" : "Like"}
                </Button>
                <Button className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
