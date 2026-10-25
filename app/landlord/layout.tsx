"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Plus,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import { useTheme } from "@/lib/theme/context"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/landlord", icon: Home },
  { name: "My Properties", href: "/landlord/properties", icon: Building2 },
  { name: "Manage Listings", href: "/landlord/manage", icon: Plus },
  { name: "Tenants", href: "/landlord/tenants", icon: Users },
  { name: "Payments", href: "/landlord/payments", icon: CreditCard },
  { name: "Analytics", href: "/landlord/analytics", icon: BarChart3 },
  { name: "Messages", href: "/landlord/inbox", icon: MessageSquare, badge: 3 },
  { name: "Settings", href: "/landlord/settings", icon: Settings },
]

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { t, language, setLanguage } = useI18n()
  const { theme, setTheme } = useTheme()
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: "application", title: "New Rental Application", message: "Sarah applied for Apartment 5B", time: "2 min ago", read: false },
    { id: 2, type: "payment", title: "Payment Received", message: "PKR 45,000 from Unit 3A", time: "1 hour ago", read: false },
    { id: 3, type: "maintenance", title: "Maintenance Request", message: "AC repair needed at Villa 7", time: "3 hours ago", read: false },
    { id: 4, type: "message", title: "New Message", message: "Tenant Ali sent you a message", time: "5 hours ago", read: true },
    { id: 5, type: "payment", title: "Payment Overdue", message: "Unit 2B rent is 5 days overdue", time: "1 day ago", read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    toast.success("Notification marked as read")
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link href="/landlord" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">MakaanX</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Landlord Profile Card */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">Ahmed Khan</p>
                <p className="text-xs text-muted-foreground">Landlord Account</p>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pro</Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-2xl font-bold text-emerald-600">12</p>
                <p className="text-xs text-emerald-600/70">Properties</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-600">34</p>
                <p className="text-xs text-blue-600/70">Tenants</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={() => {
                toast.success("Logged out successfully");
                window.location.href = "/auth/login";
              }}
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties, tenants..."
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Property Button */}
            <Button size="sm" className="hidden sm:flex gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ur" : "en")}
              className="font-medium"
            >
              {language === "en" ? "اردو" : "EN"}
            </Button>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto py-1">
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={cn(
                          "w-full flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors",
                          !notification.read && "bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <p className={cn("font-medium text-sm", !notification.read && "font-semibold")}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full ml-auto" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t border-border">
                  <Button variant="ghost" className="w-full text-sm" asChild>
                    <Link href="/landlord/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                    <AvatarFallback>AK</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
