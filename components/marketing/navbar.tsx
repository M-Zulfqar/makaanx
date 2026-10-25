"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Sun,
  Moon,
  Building2,
  Stars,
  Globe,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { language, setLanguage, t, isRtl } = useI18n();
  const { theme, setTheme, themes } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeIcons = {
    light: Sun,
    dark: Moon,
    realestate: Home,
    midnight: Stars,
  };

  const ThemeIcon = themeIcons[theme];

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/properties", label: t.nav.properties },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: t.nav.howItWorks },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "glass border-b border-border/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="relative h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary"
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className={cn(
                  "text-xl font-bold text-foreground",
                  isRtl && "font-urdu"
                )}>
                  MakaanX
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-foreground/80 hover:text-foreground hover:bg-primary/10",
                      isRtl && "font-urdu"
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/80 hover:text-foreground"
                  >
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRtl ? "start" : "end"}>
                  <DropdownMenuItem
                    onClick={() => setLanguage("en")}
                    className={cn(language === "en" && "bg-primary/10")}
                  >
                    <span className="mr-2">🇬🇧</span> English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage("ur")}
                    className={cn(
                      language === "ur" && "bg-primary/10",
                      "font-urdu"
                    )}
                  >
                    <span className="mr-2">🇵🇰</span> اردو
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/80 hover:text-foreground"
                  >
                    <ThemeIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRtl ? "start" : "end"}>
                  {themes.map((t) => {
                    const Icon = themeIcons[t.value];
                    return (
                      <DropdownMenuItem
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={cn(theme === t.value && "bg-primary/10")}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {t.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-foreground/80 hover:text-foreground",
                      isRtl && "font-urdu"
                    )}
                  >
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary",
                      isRtl && "font-urdu"
                    )}
                  >
                    {t.nav.signup}
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[72px] z-40 glass border-b border-border/50 lg:hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-foreground/80 hover:text-foreground",
                      isRtl && "font-urdu justify-end"
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="flex gap-2 mt-4">
                <Link href="/auth/login" className="flex-1">
                  <Button
                    variant="outline"
                    className={cn("w-full", isRtl && "font-urdu")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/auth/signup" className="flex-1">
                  <Button
                    className={cn("w-full", isRtl && "font-urdu")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.signup}
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
