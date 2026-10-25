"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Eye,
  Wrench,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const stats = [
  {
    title: "Total Properties",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Active Tenants",
    value: "34",
    change: "+5",
    trend: "up",
    icon: Users,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Monthly Revenue",
    value: "PKR 5.2L",
    change: "+12%",
    trend: "up",
    icon: CreditCard,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Occupancy Rate",
    value: "94%",
    change: "-2%",
    trend: "down",
    icon: TrendingUp,
    color: "bg-purple-500/10 text-purple-600",
  },
]

const revenueData = [
  { month: "Jan", revenue: 320000, expenses: 45000 },
  { month: "Feb", revenue: 340000, expenses: 52000 },
  { month: "Mar", revenue: 380000, expenses: 48000 },
  { month: "Apr", revenue: 420000, expenses: 55000 },
  { month: "May", revenue: 450000, expenses: 42000 },
  { month: "Jun", revenue: 520000, expenses: 58000 },
]

const propertyTypeData = [
  { name: "Apartments", value: 5, color: "#3b82f6" },
  { name: "Houses", value: 4, color: "#10b981" },
  { name: "Commercial", value: 2, color: "#f59e0b" },
  { name: "Rooms", value: 1, color: "#8b5cf6" },
]

const recentPayments = [
  {
    tenant: "Ali Hassan",
    property: "Apartment 5B, DHA Phase 5",
    amount: "PKR 45,000",
    status: "completed",
    date: "Today",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    tenant: "Fatima Khan",
    property: "Villa 7, Bahria Town",
    amount: "PKR 85,000",
    status: "pending",
    date: "Yesterday",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    tenant: "Ahmed Raza",
    property: "Shop 12, Commercial Plaza",
    amount: "PKR 120,000",
    status: "completed",
    date: "2 days ago",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  },
  {
    tenant: "Sara Ahmed",
    property: "Flat 3A, Gulberg",
    amount: "PKR 35,000",
    status: "overdue",
    date: "5 days ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  },
]

const maintenanceRequests = [
  {
    id: 1,
    title: "AC Not Working",
    property: "Apartment 5B",
    priority: "high",
    status: "pending",
    date: "2 hours ago",
  },
  {
    id: 2,
    title: "Water Leakage",
    property: "Villa 7",
    priority: "urgent",
    status: "in-progress",
    date: "5 hours ago",
  },
  {
    id: 3,
    title: "Door Lock Issue",
    property: "Flat 3A",
    priority: "medium",
    status: "pending",
    date: "1 day ago",
  },
]

const upcomingLeases = [
  {
    tenant: "Mohammad Usman",
    property: "Apartment 2C",
    expiresIn: "15 days",
    action: "renewal",
  },
  {
    tenant: "Ayesha Malik",
    property: "Room 4, Hostel Block",
    expiresIn: "30 days",
    action: "renewal",
  },
]

export default function LandlordDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Ahmed!</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            March 2024
          </Button>
          <Button className="gap-2">
            Download Report
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      stat.trend === "up"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    }
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly income vs expenses</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`PKR ${value.toLocaleString()}`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Property Types</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {propertyTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest tenant transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={payment.avatar} />
                    <AvatarFallback>{payment.tenant[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{payment.tenant}</p>
                    <p className="text-sm text-muted-foreground truncate">{payment.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{payment.amount}</p>
                    <Badge
                      variant="secondary"
                      className={
                        payment.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : payment.status === "pending"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-600"
                      }
                    >
                      {payment.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {payment.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {payment.status === "overdue" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance & Alerts */}
        <div className="space-y-6">
          {/* Maintenance Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance Requests
                  </CardTitle>
                </div>
                <Badge variant="secondary">{maintenanceRequests.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          request.priority === "urgent"
                            ? "bg-red-500"
                            : request.priority === "high"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.property} - {request.date}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact Tenant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Lease Expirations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Lease Expirations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingLeases.map((lease, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
                  >
                    <div>
                      <p className="font-medium text-sm">{lease.tenant}</p>
                      <p className="text-xs text-muted-foreground">{lease.property}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                        Expires in {lease.expiresIn}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Collection Progress</CardTitle>
              <CardDescription>Rent collection status for March 2024</CardDescription>
            </div>
            <p className="text-2xl font-bold text-foreground">PKR 4.8L / 5.2L</p>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={92} className="h-3" />
          <div className="flex justify-between mt-3 text-sm text-muted-foreground">
            <span>92% collected</span>
            <span>8% pending (PKR 40,000)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
