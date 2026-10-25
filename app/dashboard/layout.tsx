"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Building2,
  LayoutDashboard,
  Home,
  MessageSquare,
  CreditCard,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon,
  Stars,
  Globe,
  LogOut,
  User,
  Sparkles,
  Check,
  AlertCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AIChatbot } from "@/components/ai-chatbot";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", labelUrdu: "ڈیش بورڈ" },
  { href: "/dashboard/properties", icon: Home, label: "Properties", labelUrdu: "پراپرٹیز" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages", labelUrdu: "پیغامات" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Payments", labelUrdu: "ادائیگیاں" },
  { href: "/dashboard/roommates", icon: Users, label: "Roommates", labelUrdu: "روم میٹس" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", labelUrdu: "ترتیبات" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language, setLanguage, t, isRtl } = useI18n();
  const { theme, setTheme, themes } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "payment", title: "Payment Received", message: "Your rent payment of PKR 45,000 was received", time: "2 mins ago", read: false },
    { id: 2, type: "message", title: "New Message", message: "Landlord Ahmed Khan sent you a message", time: "1 hour ago", read: false },
    { id: 3, type: "property", title: "Property Update", message: "New property matching your criteria in DHA Phase 5", time: "3 hours ago", read: false },
    { id: 4, type: "alert", title: "Maintenance Scheduled", message: "Water supply maintenance on April 15", time: "1 day ago", read: true },
    { id: 5, type: "payment", title: "Payment Reminder", message: "Your rent is due in 5 days", time: "2 days ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast.success("Notification marked as read");
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment": return DollarSign;
      case "message": return MessageSquare;
      case "property": return Home;
      case "alert": return AlertCircle;
      default: return Bell;
    }
  };

  const themeIcons: Record<string, typeof Sun> = {
    light: Sun,
    dark: Moon,
    realestate: Home,
    midnight: Stars,
  };

  const ThemeIcon = themeIcons[theme] || Sun;

  return (
    <div className={cn("min-h-screen bg-background flex", isRtl && "flex-row-reverse")}>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className={cn(
          "hidden lg:flex flex-col fixed top-0 bottom-0 bg-sidebar border-r border-sidebar-border z-30",
          isRtl ? "right-0" : "left-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xl font-bold text-sidebar-foreground whitespace-nowrap overflow-hidden"
                >
                  MakaanX
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform",
              sidebarCollapsed && "rotate-180",
              isRtl && "rotate-180",
              isRtl && sidebarCollapsed && "rotate-0"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: isRtl ? -4 : 4 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                    sidebarCollapsed && "justify-center"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className={cn(
                          "whitespace-nowrap overflow-hidden",
                          isRtl && "font-urdu"
                        )}
                      >
                        {language === "ur" ? link.labelUrdu : link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Badge */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <button
                onClick={() => setAiChatOpen(true)}
                className="w-full text-left bg-gradient-to-r from-sidebar-primary/20 to-sidebar-accent/20 rounded-xl p-4 hover:from-sidebar-primary/30 hover:to-sidebar-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-sidebar-primary-foreground" />
                  </div>
                  <span className="font-medium text-sidebar-foreground">AI Assistant</span>
                </div>
                <p className="text-xs text-sidebar-foreground/70">
                  Need help? Ask our AI for property recommendations.
                </p>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: isRtl ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? 280 : -280 }}
              className={cn(
                "fixed top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50 lg:hidden",
                isRtl ? "right-0" : "left-0"
              )}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-sidebar-foreground">MakaanX</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sidebar-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="p-4 space-y-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className={cn(isRtl && "font-urdu")}>
                          {language === "ur" ? link.labelUrdu : link.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen",
          !sidebarCollapsed && "lg:ml-[280px]",
          sidebarCollapsed && "lg:ml-[80px]",
          isRtl && !sidebarCollapsed && "lg:mr-[280px] lg:ml-0",
          isRtl && sidebarCollapsed && "lg:mr-[80px] lg:ml-0"
        )}
      >
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="hidden md:flex relative w-64 lg:w-80">
              <Search className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRtl ? "right-3" : "left-3"
              )} />
              <Input
                placeholder="Search properties, messages..."
                className={cn(
                  "h-10 bg-muted/50",
                  isRtl ? "pr-10" : "pl-10"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? "start" : "end"}>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  <span className="mr-2">EN</span> English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ur")} className="font-urdu">
                  <span className="mr-2">UR</span> اردو
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ThemeIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? "start" : "end"}>
                {themes.map((t) => {
                  const Icon = themeIcons[t.value];
                  return (
                    <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)}>
                      <Icon className="h-4 w-4 mr-2" />
                      {t.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align={isRtl ? "start" : "end"} className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto py-1">
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                          <button
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={cn(
                              "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors",
                              !notification.read && "bg-primary/5"
                            )}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                              notification.type === "payment" && "bg-green-100 text-green-600",
                              notification.type === "message" && "bg-blue-100 text-blue-600",
                              notification.type === "property" && "bg-purple-100 text-purple-600",
                              notification.type === "alert" && "bg-amber-100 text-amber-600"
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "text-sm truncate",
                                  !notification.read && "font-medium"
                                )}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-2 border-t border-border">
                  <Button variant="ghost" className="w-full text-sm" asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                    FA
                  </div>
                  <span className="hidden md:inline font-medium">Faizan</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-48">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={() => {
                    toast.success("Logged out successfully");
                    window.location.href = "/auth/login";
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      {/* AI Chatbot */}
      <AIChatbot isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />

      {/* Floating AI Button (visible when sidebar collapsed or on mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setAiChatOpen(true)}
        className={cn(
          "fixed bottom-20 lg:bottom-6 z-40 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-primary-foreground",
          isRtl ? "left-4 lg:left-6" : "right-4 lg:right-6",
          !sidebarCollapsed && "lg:hidden"
        )}
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden z-30">
        <nav className="flex items-center justify-around h-16">
          {sidebarLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
