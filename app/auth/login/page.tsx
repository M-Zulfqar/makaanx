"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Key, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "tenant" as "tenant" | "landlord" | "admin",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error || !data.user) { toast.error("Invalid email or password, or account not confirmed."); return; }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profileError || !profile) { await supabase.auth.signOut(); toast.error("Your account profile is missing. Contact support."); return; }
      if (profile.role !== formData.role) { await supabase.auth.signOut(); toast.error("The selected role does not match this account."); return; }
      toast.success("Login successful!");
      router.replace(profile.role === "admin" ? "/admin" : profile.role === "landlord" ? "/landlord" : "/dashboard");
      router.refresh();
    } catch { toast.error("Login service is unavailable. Check configuration."); }
    finally { setIsLoading(false); }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) toast.error(error.message);
    } catch { toast.error("Google login is not configured yet."); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">MakaanX</span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
          >
            Welcome Back to
            <br />
            Your Rental Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-md"
          >
            Access your dashboard, manage properties, and connect with verified tenants and landlords.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MakaanX</span>
          </Link>

          <h2 className={cn(
            "text-2xl md:text-3xl font-bold text-foreground mb-2",
            isRtl && "font-urdu text-right"
          )}>
            {t.auth.login}
          </h2>
          <p className={cn(
            "text-muted-foreground mb-8",
            isRtl && "font-urdu text-right"
          )}>
            {t.auth.noAccount}{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              {t.auth.signup}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className={cn(isRtl && "font-urdu")}>
                {t.auth.email}
              </Label>
              <div className="relative">
                <Mail className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                  isRtl ? "right-3" : "left-3"
                )} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={cn("h-12", isRtl ? "pr-10" : "pl-10")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={cn(isRtl && "font-urdu")}>
                {t.auth.password}
              </Label>
              <div className="relative">
                <Lock className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                  isRtl ? "right-3" : "left-3"
                )} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn("h-12", isRtl ? "pr-10 pl-10" : "pl-10 pr-10")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                    isRtl ? "left-3" : "right-3"
                  )}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className={cn(isRtl && "font-urdu")}>Login as</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "tenant", label: "Tenant", icon: Key },
                  { value: "landlord", label: "Landlord", icon: Home },
                  { value: "admin", label: "Admin", icon: Building2 },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value as "tenant" | "landlord" | "admin" })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      formData.role === role.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <role.icon className={cn(
                      "h-5 w-5",
                      formData.role === role.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      formData.role === role.value ? "text-primary" : "text-muted-foreground"
                    )}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                {t.auth.forgotPassword}
              </Link>
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full h-12 text-base",
                isRtl && "font-urdu"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>{t.common.loading}</span>
                </div>
              ) : (
                <>
                  {t.auth.login}
                  <ArrowRight className={cn("h-5 w-5 ml-2", isRtl && "rotate-180 mr-2 ml-0")} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button type="button" onClick={signInWithGoogle} variant="outline" className="h-12">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button type="button" disabled title="GitHub login is not enabled" variant="outline" className="h-12">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
