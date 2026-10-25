"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const monthlyRevenue = [
  { month: "Jan", revenue: 320000, target: 350000, expenses: 45000 },
  { month: "Feb", revenue: 340000, target: 350000, expenses: 52000 },
  { month: "Mar", revenue: 380000, target: 380000, expenses: 48000 },
  { month: "Apr", revenue: 420000, target: 400000, expenses: 55000 },
  { month: "May", revenue: 450000, target: 420000, expenses: 42000 },
  { month: "Jun", revenue: 520000, target: 450000, expenses: 58000 },
  { month: "Jul", revenue: 480000, target: 480000, expenses: 51000 },
  { month: "Aug", revenue: 510000, target: 500000, expenses: 49000 },
  { month: "Sep", revenue: 490000, target: 520000, expenses: 53000 },
  { month: "Oct", revenue: 530000, target: 530000, expenses: 47000 },
  { month: "Nov", revenue: 550000, target: 550000, expenses: 56000 },
  { month: "Dec", revenue: 580000, target: 580000, expenses: 62000 },
]

const propertyPerformance = [
  { name: "DHA Apt 5B", occupancy: 100, revenue: 540000, rating: 4.8 },
  { name: "Bahria Villa", occupancy: 100, revenue: 1020000, rating: 4.5 },
  { name: "Gulberg Shop", occupancy: 85, revenue: 1020000, rating: 4.2 },
  { name: "Model Town Studio", occupancy: 100, revenue: 300000, rating: 4.9 },
  { name: "Johar Penthouse", occupancy: 92, revenue: 828000, rating: 4.0 },
]

const occupancyTrend = [
  { month: "Jan", rate: 85 },
  { month: "Feb", rate: 88 },
  { month: "Mar", rate: 90 },
  { month: "Apr", rate: 92 },
  { month: "May", rate: 94 },
  { month: "Jun", rate: 94 },
  { month: "Jul", rate: 96 },
  { month: "Aug", rate: 94 },
  { month: "Sep", rate: 92 },
  { month: "Oct", rate: 94 },
  { month: "Nov", rate: 96 },
  { month: "Dec", rate: 94 },
]

const tenantDemographics = [
  { name: "Families", value: 45, color: "#3b82f6" },
  { name: "Young Professionals", value: 30, color: "#10b981" },
  { name: "Students", value: 15, color: "#f59e0b" },
  { name: "Businesses", value: 10, color: "#8b5cf6" },
]

const expenseBreakdown = [
  { category: "Maintenance", amount: 180000, color: "#ef4444" },
  { category: "Utilities", amount: 120000, color: "#f59e0b" },
  { category: "Insurance", amount: 80000, color: "#3b82f6" },
  { category: "Property Tax", amount: 150000, color: "#8b5cf6" },
  { category: "Management", amount: 70000, color: "#10b981" },
]

const areaPerformance = [
  { area: "DHA", properties: 4, avgRent: 55000, occupancy: 98 },
  { area: "Bahria", properties: 3, avgRent: 75000, occupancy: 95 },
  { area: "Gulberg", properties: 2, avgRent: 90000, occupancy: 85 },
  { area: "Model Town", properties: 2, avgRent: 35000, occupancy: 100 },
  { area: "Johar Town", properties: 1, avgRent: 65000, occupancy: 92 },
]

const portfolioMetrics = [
  { metric: "Occupancy", value: 94, fullMark: 100 },
  { metric: "Collection", value: 92, fullMark: 100 },
  { metric: "Tenant Satisfaction", value: 88, fullMark: 100 },
  { metric: "Maintenance Response", value: 85, fullMark: 100 },
  { metric: "ROI", value: 78, fullMark: 100 },
  { metric: "Property Condition", value: 90, fullMark: 100 },
]

const kpiCards = [
  {
    title: "Total Revenue (YTD)",
    value: "PKR 56.7L",
    change: "+18.5%",
    trend: "up",
    icon: CreditCard,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Average Occupancy",
    value: "94%",
    change: "+6%",
    trend: "up",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Total Tenants",
    value: "34",
    change: "+8",
    trend: "up",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Net Profit Margin",
    value: "72%",
    change: "+4%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-amber-500/10 text-amber-600",
  },
]

export default function LandlordAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12m")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your rental portfolio performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      kpi.trend === "up"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    }
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {kpi.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{kpi.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="gap-2">
            <Activity className="h-4 w-4" />
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-2">
            <Target className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue vs Target Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue vs Target</CardTitle>
                <CardDescription>Monthly revenue compared to targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenue}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`PKR ${value.toLocaleString()}`, ""]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#6366f1"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Target"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Property Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Properties</CardTitle>
                <CardDescription>By annual revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {propertyPerformance.slice(0, 4).map((property, index) => (
                    <div key={property.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{property.name}</span>
                        <span className="text-sm text-muted-foreground">
                          PKR {(property.revenue / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(property.revenue / 1200000) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Occupancy Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trend</CardTitle>
                <CardDescription>Monthly occupancy rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={occupancyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[80, 100]} className="text-xs" tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Occupancy"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Tenant Demographics</CardTitle>
                <CardDescription>Distribution by tenant type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenantDemographics}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tenantDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {tenantDemographics.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Annual expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} />
                      <YAxis type="category" dataKey="category" width={100} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`PKR ${value.toLocaleString()}`, ""]}
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Summary</CardTitle>
                <CardDescription>Total annual expense analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <p className="text-4xl font-bold text-foreground">PKR 6.0L</p>
                    <p className="text-muted-foreground mt-1">Total Annual Expenses</p>
                  </div>
                  <div className="space-y-3">
                    {expenseBreakdown.map((expense) => (
                      <div
                        key={expense.category}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: expense.color }}
                          />
                          <span className="font-medium">{expense.category}</span>
                        </div>
                        <span className="text-foreground font-semibold">
                          PKR {expense.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Portfolio Health Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Health Score</CardTitle>
                <CardDescription>Overall performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={portfolioMetrics}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="metric" className="text-xs" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Area Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Area</CardTitle>
                <CardDescription>Property metrics across different locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {areaPerformance.map((area) => (
                    <div
                      key={area.area}
                      className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{area.area}</h4>
                        <Badge variant="outline">{area.properties} properties</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Rent</p>
                          <p className="text-lg font-bold text-foreground">
                            PKR {area.avgRent.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Occupancy</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-foreground">{area.occupancy}%</p>
                            <Zap
                              className={`h-4 w-4 ${
                                area.occupancy >= 95 ? "text-emerald-500" : "text-amber-500"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
