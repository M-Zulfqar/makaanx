"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Camera,
  Check,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Building2,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LandlordSettingsPage() {
  const { language, setLanguage, isRtl } = useI18n();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newInquiries: true,
    paymentReceived: true,
    tenantMessages: true,
    marketing: false,
  });

  const themes = [
    { id: "light", label: "Light", color: "bg-white border-2 border-border" },
    { id: "dark", label: "Dark", color: "bg-zinc-900" },
    { id: "realestate", label: "Real Estate", color: "bg-amber-50" },
    { id: "midnight", label: "Midnight", color: "bg-slate-900" },
  ] as const;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold text-foreground",
          isRtl && "font-urdu text-right"
        )}>
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your landlord account settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-transparent p-0">
          {[
            { value: "profile", icon: User, label: "Profile" },
            { value: "business", icon: Building2, label: "Business" },
            { value: "notifications", icon: Bell, label: "Notifications" },
            { value: "security", icon: Shield, label: "Security" },
            { value: "payout", icon: Banknote, label: "Payout" },
            { value: "appearance", icon: Palette, label: "Appearance" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg border border-border data-[state=active]:border-primary"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200" />
                    <AvatarFallback>AK</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Verified landlords get more inquiries
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Ahmed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Khan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="ahmed.khan@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+92 321 9876543" />
                </div>
              </div>

              <Button onClick={() => toast.success("Profile updated successfully")}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Details shown to potential tenants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input id="businessName" placeholder="Your property management company" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio / Description</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell tenants about yourself..."
                    defaultValue="Experienced property owner with 10+ years in real estate. I take pride in maintaining high-quality properties and building lasting relationships with tenants."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseTime">Average Response Time</Label>
                  <Select defaultValue="1hour">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">Within 15 minutes</SelectItem>
                      <SelectItem value="1hour">Within 1 hour</SelectItem>
                      <SelectItem value="24hours">Within 24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsActive">Years in Business</Label>
                  <Input id="yearsActive" type="number" defaultValue="10" />
                </div>
              </div>

              <Button onClick={() => toast.success("Business info updated")}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Stay informed about your properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: "email", icon: Mail, label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "push", icon: Bell, label: "Push Notifications", desc: "Receive push notifications" },
                  { key: "sms", icon: Smartphone, label: "SMS Notifications", desc: "Get SMS for urgent matters" },
                  { key: "newInquiries", icon: Bell, label: "New Inquiries", desc: "When tenants inquire about your properties" },
                  { key: "paymentReceived", icon: Banknote, label: "Payment Received", desc: "When rent payments are received" },
                  { key: "tenantMessages", icon: Mail, label: "Tenant Messages", desc: "Messages from your tenants" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>

              <Button onClick={() => toast.success("Preferences saved")}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm password" />
                </div>
              </div>
              <Button onClick={() => toast.success("Password updated")}>
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Protect your landlord account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Protect your earnings</p>
                  </div>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Tab */}
        <TabsContent value="payout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account</CardTitle>
              <CardDescription>Where your rental income is deposited</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    HBL
                  </div>
                  <div>
                    <p className="font-medium">HBL Account ****7890</p>
                    <p className="text-sm text-muted-foreground">Primary payout method</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>

              <Button variant="outline" className="w-full">
                <Banknote className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Schedule</CardTitle>
              <CardDescription>When you receive your earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Payout Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Next payout: April 15, 2026 - Estimated PKR 255,000
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as "light" | "dark" | "realestate" | "midnight")}
                    className={cn(
                      "relative p-4 rounded-xl flex flex-col items-center gap-2 transition-all",
                      t.color,
                      theme === t.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:ring-1 hover:ring-border"
                    )}
                  >
                    {theme === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className={cn(
                      "w-8 h-8 rounded-full",
                      t.id === "light" && "bg-zinc-200",
                      t.id === "dark" && "bg-zinc-700",
                      t.id === "realestate" && "bg-amber-200",
                      t.id === "midnight" && "bg-slate-700"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      (t.id === "dark" || t.id === "midnight") && "text-white"
                    )}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "p-4 rounded-xl flex items-center gap-3 transition-all border",
                    language === "en"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">English</span>
                  {language === "en" && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
                <button
                  onClick={() => setLanguage("ur")}
                  className={cn(
                    "p-4 rounded-xl flex items-center gap-3 transition-all border",
                    language === "ur"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium font-urdu">اردو</span>
                  {language === "ur" && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
