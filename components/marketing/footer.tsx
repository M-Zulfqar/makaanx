"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Building2, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const { t, isRtl } = useI18n();

  const quickLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.properties, href: "/properties" },
    { label: t.nav.howItWorks, href: "/#how-it-works" },
    { label: t.nav.pricing, href: "/#pricing" },
  ];

  const supportLinks = [
    { label: t.footer.helpCenter, href: "/help" },
    { label: t.footer.contactUs, href: "/contact" },
  ];

  const legalLinks = [
    { label: t.footer.privacyPolicy, href: "/privacy" },
    { label: t.footer.termsOfService, href: "/terms" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className={cn(isRtl && "text-right")}>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">MakaanX</span>
            </Link>
            <p className={cn(
              "text-muted-foreground mb-6 leading-relaxed",
              isRtl && "font-urdu"
            )}>
              {t.footer.aboutDesc}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={cn(isRtl && "text-right")}>
            <h4 className={cn(
              "font-semibold text-foreground mb-4",
              isRtl && "font-urdu"
            )}>
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-muted-foreground hover:text-primary transition-colors",
                      isRtl && "font-urdu"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className={cn(isRtl && "text-right")}>
            <h4 className={cn(
              "font-semibold text-foreground mb-4",
              isRtl && "font-urdu"
            )}>
              {t.footer.support}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-muted-foreground hover:text-primary transition-colors",
                      isRtl && "font-urdu"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-muted-foreground hover:text-primary transition-colors",
                      isRtl && "font-urdu"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={cn(isRtl && "text-right")}>
            <h4 className={cn(
              "font-semibold text-foreground mb-4",
              isRtl && "font-urdu"
            )}>
              {t.footer.contactUs}
            </h4>
            <ul className="space-y-3">
              <li className={cn(
                "flex items-center gap-3 text-muted-foreground",
                isRtl && "flex-row-reverse"
              )}>
                <Mail className="h-5 w-5 text-primary" />
                <span>hello@makaanx.pk</span>
              </li>
              <li className={cn(
                "flex items-center gap-3 text-muted-foreground",
                isRtl && "flex-row-reverse"
              )}>
                <Phone className="h-5 w-5 text-primary" />
                <span dir="ltr">+92 300 1234567</span>
              </li>
              <li className={cn(
                "flex items-center gap-3 text-muted-foreground",
                isRtl && "flex-row-reverse"
              )}>
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Lahore, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={cn(
            "text-sm text-muted-foreground",
            isRtl && "font-urdu"
          )}>
            © {new Date().getFullYear()} MakaanX. {t.footer.copyright}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Made with AI in Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
