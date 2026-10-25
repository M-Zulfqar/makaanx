"use client"

import { motion } from "framer-motion"
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  Server,
  Database,
  Cpu,
  MoreHorizontal,
  Eye,
  Ban,
  UserCheck,
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
  BarChart,
  Bar,
  Cell,
} from "recharts"

const platformStats = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+234",
    trend: "up",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Active Properties",
    value: "3,421",
    change: "+89",
    trend: "up",
    icon: Building2,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Monthly Transactions",
    value: "PKR 2.4Cr",
    change: "+18%",
    trend: "up",
    icon: CreditCard,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Platform Revenue",
    value: "PKR 48L",
    change: "+12%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-purple-500/10 text-purple-600",
  },
]

const userGrowth = [
  { date: "Jan", users: 8500, landlords: 1200, tenants: 7300 },
  { date: "Feb", users: 9200, landlords: 1350, tenants: 7850 },
  { date: "Mar", users: 9800, landlords: 1480, tenants: 8320 },
  { date: "Apr", users: 10500, landlords: 1620, tenants: 8880 },
  { date: "May", users: 11400, landlords: 1780, tenants: 9620 },
  { date: "Jun", users: 12847, landlords: 1950, tenants: 10897 },
]

const verificationQueue = [
  {
    id: 1,
    user: "Hassan Ali",
    type: "CNIC",
    status: "pending",
    submittedAt: "10 min ago",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    id: 2,
    user: "Fatima Sheikh",
    type: "CNIC + Police",
    status: "pending",
    submittedAt: "25 min ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    id: 3,
    user: "Ahmed Malik",
    type: "Property Docs",
    status: "in-review",
    submittedAt: "1 hour ago",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  },
  {
    id: 4,
    user: "Sara Khan",
    type: "Employment",
    status: "pending",
    submittedAt: "2 hours ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  },
]

const recentReports = [
  {
    id: 1,
    type: "Fraud",
    description: "Fake property listing reported",
    property: "Apartment in DHA Phase 6",
    reporter: "Ali Raza",
    status: "investigating",
    priority: "high",
  },
  {
    id: 2,
    type: "Scam",
    description: "Suspicious payment request",
    property: "Villa in Bahria Town",
    reporter: "Fatima Khan",
    status: "open",
    priority: "urgent",
  },
  {
    id: 3,
    type: "Harassment",
    description: "Inappropriate messages from landlord",
    property: "Flat in Model Town",
    reporter: "Sara Ahmed",
    status: "resolved",
    priority: "medium",
  },
]

const systemHealth = [
  { name: "API Server", status: "healthy", uptime: 99.9, load: 45 },
  { name: "Database", status: "healthy", uptime: 99.95, load: 32 },
  { name: "File Storage", status: "healthy", uptime: 99.8, load: 58 },
  { name: "ML Services", status: "warning", uptime: 98.5, load: 78 },
]

const cityDistribution = [
  { city: "Lahore", users: 4200, color: "#3b82f6" },
  { city: "Karachi", users: 3800, color: "#10b981" },
  { city: "Islamabad", users: 2100, color: "#f59e0b" },
  { city: "Rawalpindi", users: 1400, color: "#8b5cf6" },
  { city: "Faisalabad", users: 800, color: "#ef4444" },
  { city: "Others", users: 547, color: "#6b7280" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and system management
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            System Status
          </Button>
          <Button className="gap-2 bg-destructive hover:bg-destructive/90">
            <AlertTriangle className="h-4 w-4" />
            View Reports (3)
          </Button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {platformStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Platform user acquisition trends</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Total Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* City Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>By city</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityDistribution} layout="vertical">
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="city" width={80} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                    {cityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Queue & Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Queue
                </CardTitle>
                <CardDescription>Pending user verifications</CardDescription>
              </div>
              <Badge variant="secondary">8 pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={item.avatar} />
                    <AvatarFallback>{item.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.type} - {item.submittedAt}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      item.status === "pending"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-blue-500/10 text-blue-600"
                    }
                  >
                    {item.status === "pending" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      <Eye className="h-3 w-3 mr-1" />
                    )}
                    {item.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-emerald-600">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Recent Reports
                </CardTitle>
                <CardDescription>User-submitted complaints</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-xl border ${
                    report.priority === "urgent"
                      ? "border-red-500/30 bg-red-500/5"
                      : report.priority === "high"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          report.priority === "urgent"
                            ? "bg-red-500 hover:bg-red-600"
                            : report.priority === "high"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }
                      >
                        {report.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          report.status === "resolved"
                            ? "border-emerald-500/50 text-emerald-600"
                            : report.status === "investigating"
                            ? "border-blue-500/50 text-blue-600"
                            : "border-amber-500/50 text-amber-600"
                        }
                      >
                        {report.status}
                      </Badge>
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
                          <Ban className="h-4 w-4 mr-2" />
                          Ban User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm font-medium text-foreground">{report.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.property} - Reported by {report.reporter}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Real-time infrastructure monitoring</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {systemHealth.map((system) => (
              <div
                key={system.name}
                className={`p-4 rounded-xl ${
                  system.status === "healthy"
                    ? "bg-emerald-500/5 border border-emerald-500/20"
                    : "bg-amber-500/5 border border-amber-500/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {system.name === "API Server" && <Server className="h-4 w-4" />}
                    {system.name === "Database" && <Database className="h-4 w-4" />}
                    {system.name === "File Storage" && <Activity className="h-4 w-4" />}
                    {system.name === "ML Services" && <Cpu className="h-4 w-4" />}
                    <span className="font-medium text-sm">{system.name}</span>
                  </div>
                  <div
                    className={`h-2 w-2 rounded-full ${
                      system.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                    } animate-pulse`}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uptime</span>
                    <span>{system.uptime}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Load</span>
                    <span>{system.load}%</span>
                  </div>
                  <Progress
                    value={system.load}
                    className={`h-1.5 ${
                      system.load > 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
