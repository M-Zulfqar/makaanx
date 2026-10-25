"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Settings,
  Shield,
  Bell,
  Database,
  Globe,
  Lock,
  Server,
  Mail,
  Zap,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    emailVerificationRequired: true,
    cnicVerificationRequired: true,
    autoApproveProperties: false,
    maxPropertiesPerLandlord: 50,
    platformFee: 5,
  });

  const [notifications, setNotifications] = useState({
    newUserAlerts: true,
    fraudAlerts: true,
    systemErrors: true,
    dailyReports: true,
    weeklyAnalytics: true,
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Platform Settings
        </h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
          {[
            { value: "general", icon: Settings, label: "General" },
            { value: "security", icon: Shield, label: "Security" },
            { value: "notifications", icon: Bell, label: "Alerts" },
            { value: "system", icon: Server, label: "System" },
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

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>Core platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: "maintenanceMode", label: "Maintenance Mode", desc: "Temporarily disable platform access", danger: true },
                  { key: "registrationOpen", label: "Open Registration", desc: "Allow new user registrations" },
                  { key: "emailVerificationRequired", label: "Email Verification", desc: "Require email verification for new accounts" },
                  { key: "cnicVerificationRequired", label: "CNIC Verification", desc: "Require CNIC verification for transactions" },
                  { key: "autoApproveProperties", label: "Auto-Approve Properties", desc: "Automatically approve new property listings" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl",
                      item.danger ? "bg-destructive/5 border border-destructive/20" : "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {item.danger && (
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={platformSettings[item.key as keyof typeof platformSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setPlatformSettings({ ...platformSettings, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Properties Per Landlord</Label>
                  <Input
                    type="number"
                    value={platformSettings.maxPropertiesPerLandlord}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        maxPropertiesPerLandlord: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platform Fee (%)</Label>
                  <Input
                    type="number"
                    value={platformSettings.platformFee}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        platformFee: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={() => toast.success("Settings saved")}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Platform security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Password Min Length</Label>
                  <Input type="number" defaultValue="8" />
                </div>
                <div className="space-y-2">
                  <Label>Account Lockout Duration (minutes)</Label>
                  <Input type="number" defaultValue="15" />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Require 2FA for Admins", desc: "Mandatory two-factor authentication" },
                  { label: "IP Whitelisting", desc: "Restrict admin access to specific IPs" },
                  { label: "Audit Logging", desc: "Log all admin actions" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>

              <Button onClick={() => toast.success("Security settings updated")}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Alerts</CardTitle>
              <CardDescription>Configure admin notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: "newUserAlerts", icon: Bell, label: "New User Alerts", desc: "When new users register" },
                  { key: "fraudAlerts", icon: AlertTriangle, label: "Fraud Alerts", desc: "Suspicious activity detected" },
                  { key: "systemErrors", icon: Zap, label: "System Errors", desc: "Critical system issues" },
                  { key: "dailyReports", icon: Mail, label: "Daily Reports", desc: "Daily summary emails" },
                  { key: "weeklyAnalytics", icon: Database, label: "Weekly Analytics", desc: "Weekly performance reports" },
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

              <div className="space-y-2">
                <Label>Alert Email Recipients</Label>
                <Textarea
                  placeholder="Enter email addresses, one per line"
                  defaultValue="admin@makaanx.pk\nsecurity@makaanx.pk"
                  rows={3}
                />
              </div>

              <Button onClick={() => toast.success("Alert settings saved")}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Platform health and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Platform Version", value: "2.4.1" },
                { label: "Database Status", value: "Healthy", status: "success" },
                { label: "Cache Status", value: "Active", status: "success" },
                { label: "API Response Time", value: "45ms", status: "success" },
                { label: "Storage Used", value: "234 GB / 500 GB" },
                { label: "Last Backup", value: "Apr 11, 2026 03:00 AM" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.status === "success" && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                    <span className="font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Actions</CardTitle>
              <CardDescription>System maintenance operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" onClick={() => toast.success("Cache cleared")}>
                  <Database className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline" onClick={() => toast.success("Backup started")}>
                  <Server className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button variant="outline" onClick={() => toast.success("Index rebuild started")}>
                  <Zap className="h-4 w-4 mr-2" />
                  Rebuild Search Index
                </Button>
                <Button variant="outline" onClick={() => toast.info("Logs downloaded")}>
                  <Globe className="h-4 w-4 mr-2" />
                  Download Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
