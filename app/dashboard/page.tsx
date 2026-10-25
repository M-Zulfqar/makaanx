"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  CreditCard,
  Clock,
  ArrowRight,
  TrendingUp,
  Star,
  MapPin,
  Sparkles,
  BedDouble,
  Bath,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const recommendedProperties = [
  {
    id: 1,
    title: "Modern Apartment in DHA Phase 5",
    location: "DHA Phase 5, Lahore",
    price: 85000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    trustScore: 94,
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
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
  },
];

const upcomingPayments = [
  { id: 1, title: "Monthly Rent", amount: 85000, dueDate: "Apr 15, 2026", status: "upcoming" },
  { id: 2, title: "Utility Bills", amount: 5200, dueDate: "Apr 20, 2026", status: "upcoming" },
];

const applicationStatus = [
  { id: 1, property: "Modern Apartment in DHA", status: "approved", date: "Mar 28, 2026" },
  { id: 2, property: "Luxury Penthouse in F-7", status: "pending", date: "Apr 05, 2026" },
  { id: 3, property: "3BR House in Model Town", status: "rejected", date: "Apr 01, 2026" },
];

export default function DashboardPage() {
  const { t, language, isRtl } = useI18n();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 lg:pb-0"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold text-foreground mb-1",
          isRtl && "font-urdu text-right"
        )}>
          {t.dashboard.welcome}, Faizan!
        </h1>
        <p className={cn(
          "text-muted-foreground",
          isRtl && "font-urdu text-right"
        )}>
          Here&apos;s what&apos;s happening with your rental journey.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Properties</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trust Score</p>
                <p className="text-2xl font-bold text-foreground">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due This Month</p>
                <p className="text-2xl font-bold text-foreground">Rs 90K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div variants={itemVariants}>
        <Card className="border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className={cn(isRtl && "font-urdu")}>
                {t.dashboard.recommendations}
              </CardTitle>
            </div>
            <Link href="/dashboard/properties">
              <Button variant="ghost" size="sm" className="gap-1">
                {t.dashboard.viewAll}
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-muted/30 rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-colors">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {property.trustScore}%
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3 w-3" />
                          {property.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          {property.baths}
                        </span>
                        <span className="flex items-center gap-1">
                          <Square className="h-3 w-3" />
                          {property.sqft} sqft
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-primary">
                          Rs {property.price.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payments & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <motion.div variants={itemVariants}>
          <Card className="border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={cn("flex items-center gap-2", isRtl && "font-urdu")}>
                <CreditCard className="h-5 w-5 text-primary" />
                {t.dashboard.upcomingPayments}
              </CardTitle>
              <Link href="/dashboard/payments">
                <Button variant="ghost" size="sm" className="gap-1">
                  {t.dashboard.viewAll}
                  <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-foreground">{payment.title}</p>
                    <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      Rs {payment.amount.toLocaleString()}
                    </p>
                    <Button size="sm" variant="outline" className="mt-1">
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Status */}
        <motion.div variants={itemVariants}>
          <Card className="border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={cn("flex items-center gap-2", isRtl && "font-urdu")}>
                <Clock className="h-5 w-5 text-primary" />
                {t.dashboard.applicationStatus}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationStatus.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-foreground line-clamp-1">{app.property}</p>
                    <p className="text-sm text-muted-foreground">{app.date}</p>
                  </div>
                  <Badge
                    variant={
                      app.status === "approved"
                        ? "default"
                        : app.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className={cn(
                      app.status === "approved" && "bg-success text-success-foreground"
                    )}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
