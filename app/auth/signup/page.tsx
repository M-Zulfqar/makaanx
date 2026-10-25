"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Upload,
  Home,
  Key,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import Confetti from "react-confetti";
import { createClient } from "@/lib/supabase/browser";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Personal Info", titleUrdu: "ذاتی معلومات" },
  { id: 2, title: "Select Role", titleUrdu: "کردار منتخب کریں" },
  { id: 3, title: "Upload CNIC", titleUrdu: "CNIC اپ لوڈ کریں" },
  { id: 4, title: "AI Verification", titleUrdu: "AI تصدیق" },
  { id: 5, title: "Success", titleUrdu: "کامیابی" },
];

export default function SignupPage() {
  const router = useRouter();
  const { t, language, isRtl } = useI18n();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [trustScore, setTrustScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    cnicImage: null as File | null,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (acceptedFiles[0].size > 10 * 1024 * 1024) { toast.error("Maximum CNIC image size is 10 MB."); return; }
      setFormData((prev) => ({ ...prev, cnicImage: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  });

  const nextStep = async () => {
    if (currentStep !== 3) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      return;
    }
    if (!formData.cnicImage || !["tenant", "landlord"].includes(formData.role)) return;
    if (formData.cnicImage.size > 10 * 1024 * 1024) {
      toast.error("CNIC image must be smaller than 10 MB.");
      return;
    }
    setIsVerifying(true);
    setCurrentStep(4);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            role: formData.role,
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Registration could not be completed.");
      // Email confirmation normally means no session exists yet.
      // CNIC upload is performed after sign-in, not with an anonymous token.
      if (data.session) {
        const path = `${data.user.id}/cnic-${crypto.randomUUID()}.${formData.cnicImage.type === "image/png" ? "png" : "jpg"}`;
        const upload = await supabase.storage.from("cnic-documents").upload(path, formData.cnicImage, {
          contentType: formData.cnicImage.type,
          upsert: false,
        });
        if (upload.error) {
          toast.warning("Account created. Upload your CNIC after signing in.");
        } else {
          const update = await supabase.rpc("makaanx_submit_cnic", { document_path: path });
          if (update.error) toast.warning("Account created. Please retry CNIC submission after signing in.");
        }
      }
      setTrustScore(0); // No AI verification has run. Never fabricate a score.
      setCurrentStep(5);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast.success(data.session ? "Account created. CNIC review is pending." : "Check your email to confirm your account, then submit your CNIC.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
      setCurrentStep(3);
    } finally {
      setIsVerifying(false);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.fullName &&
          formData.email &&
          formData.phone &&
          formData.password.length >= 8 &&
          formData.password === formData.confirmPassword
        );
      case 2:
        return formData.role !== "";
      case 3:
        return formData.cnicImage !== null;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 1920}
          height={typeof window !== "undefined" ? window.innerHeight : 1080}
          recycle={false}
          numberOfPieces={500}
        />
      )}

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
            Start Your
            <br />
            Rental Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-md"
          >
            Join thousands of verified users on Pakistan&apos;s most trusted rental platform.
          </motion.p>

          {/* Step Progress */}
          <div className="mt-12 space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-4",
                  currentStep >= step.id ? "opacity-100" : "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep > step.id
                      ? "bg-white text-primary"
                      : currentStep === step.id
                      ? "bg-white/30 text-white border-2 border-white"
                      : "bg-white/10 text-white/50"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-sm">
                  {language === "ur" ? step.titleUrdu : step.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MakaanX</span>
          </Link>

          {/* Mobile Step Indicator */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm font-medium text-foreground">
                {language === "ur" ? steps[currentStep - 1].titleUrdu : steps[currentStep - 1].title}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={cn(
                    "text-2xl md:text-3xl font-bold text-foreground mb-2",
                    isRtl && "font-urdu text-right"
                  )}>
                    {t.auth.signup}
                  </h2>
                  <p className={cn(
                    "text-muted-foreground",
                    isRtl && "font-urdu text-right"
                  )}>
                    {t.auth.hasAccount}{" "}
                    <Link href="/auth/login" className="text-primary hover:underline">
                      {t.auth.login}
                    </Link>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className={cn(isRtl && "font-urdu")}>{t.auth.fullName}</Label>
                    <div className="relative">
                      <User className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                        isRtl ? "right-3" : "left-3"
                      )} />
                      <Input
                        placeholder="Faizan Ahmed"
                        className={cn("h-12", isRtl ? "pr-10" : "pl-10")}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={cn(isRtl && "font-urdu")}>{t.auth.email}</Label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                        isRtl ? "right-3" : "left-3"
                      )} />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className={cn("h-12", isRtl ? "pr-10" : "pl-10")}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={cn(isRtl && "font-urdu")}>{t.auth.phone}</Label>
                    <div className="relative">
                      <Phone className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                        isRtl ? "right-3" : "left-3"
                      )} />
                      <Input
                        type="tel"
                        placeholder="+92 300 1234567"
                        className={cn("h-12", isRtl ? "pr-10" : "pl-10")}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={cn(isRtl && "font-urdu")}>{t.auth.password}</Label>
                      <div className="relative">
                        <Lock className={cn(
                          "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground",
                          isRtl ? "right-3" : "left-3"
                        )} />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={cn("h-12", isRtl ? "pr-10" : "pl-10")}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className={cn(isRtl && "font-urdu")}>{t.auth.confirmPassword}</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 pr-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Role Selection */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={cn(
                    "text-2xl md:text-3xl font-bold text-foreground mb-2",
                    isRtl && "font-urdu text-right"
                  )}>
                    {t.auth.selectRole}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, role: "tenant" })}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left transition-all",
                      formData.role === "tenant"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Key className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className={cn(
                      "text-lg font-semibold text-foreground mb-2",
                      isRtl && "font-urdu"
                    )}>
                      {t.auth.tenant}
                    </h3>
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isRtl && "font-urdu"
                    )}>
                      {t.auth.tenantDesc}
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, role: "landlord" })}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left transition-all",
                      formData.role === "landlord"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Home className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className={cn(
                      "text-lg font-semibold text-foreground mb-2",
                      isRtl && "font-urdu"
                    )}>
                      {t.auth.landlord}
                    </h3>
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      isRtl && "font-urdu"
                    )}>
                      {t.auth.landlordDesc}
                    </p>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: CNIC Upload */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={cn(
                    "text-2xl md:text-3xl font-bold text-foreground mb-2",
                    isRtl && "font-urdu text-right"
                  )}>
                    {t.auth.uploadCnic}
                  </h2>
                </div>

                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : formData.cnicImage
                      ? "border-success bg-success/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    {formData.cnicImage ? (
                      <>
                        <CheckCircle2 className="h-16 w-16 text-success mb-4" />
                        <p className="text-lg font-medium text-foreground mb-2">
                          {formData.cnicImage.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click or drag to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className={cn(
                          "text-lg font-medium text-foreground mb-2",
                          isRtl && "font-urdu"
                        )}>
                          {t.auth.dragDrop}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Why do we need your CNIC?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        We verify all users to ensure a safe and trusted rental experience for everyone.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: AI Verification */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8 text-center py-12"
              >
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="text-primary"
                      initial={{ strokeDasharray: "0 553" }}
                      animate={{ strokeDasharray: `${(trustScore / 100) * 553} 553` }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className="text-4xl font-bold text-foreground"
                      key={trustScore}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      {trustScore}%
                    </motion.span>
                    <span className="text-sm text-muted-foreground">Verification pending</span>
                  </div>
                </div>

                <div>
                  <h2 className={cn(
                    "text-2xl font-bold text-foreground mb-2",
                    isRtl && "font-urdu"
                  )}>
                    {isVerifying ? t.auth.trustScoreCalculating : "Registration submitted"}
                  </h2>
                  <p className="text-muted-foreground">
                    {isVerifying
                      ? "Creating your account securely..."
                      : "Identity verification requires document submission and admin review."}
                  </p>
                </div>

                {isVerifying && (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground animate-pulse">
                      Analyzing document authenticity...
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Success */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8 text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-24 h-24 rounded-full bg-success flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="h-12 w-12 text-success-foreground" />
                </motion.div>

                <div>
                  <h2 className={cn(
                    "text-2xl md:text-3xl font-bold text-foreground mb-2",
                    isRtl && "font-urdu"
                  )}>
                    {t.auth.success}
                  </h2>
                  <p className={cn(
                    "text-muted-foreground mb-4",
                    isRtl && "font-urdu"
                  )}>
                    Check your email to confirm your account. After signing in, upload your CNIC for admin review.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Verification pending admin review</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-12"
                  onClick={() => router.push("/auth/login")}
                >
                  Continue to Login
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={cn(currentStep === 1 && "invisible")}
              >
                <ArrowLeft className={cn("h-5 w-5 mr-2", isRtl && "rotate-180")} />
                {t.common.previous}
              </Button>
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="min-w-[120px]"
              >
                {t.common.next}
                <ArrowRight className={cn("h-5 w-5 ml-2", isRtl && "rotate-180")} />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
