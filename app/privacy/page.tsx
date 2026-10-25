"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: April 11, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
          >
            <div className="space-y-8">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  MakaanX (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our platform, including our
                  website and mobile applications (collectively, the &quot;Service&quot;).
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By using our Service, you agree to the collection and use of
                  information in accordance with this policy. If you do not agree with
                  our policies and practices, please do not use our Service.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. Information We Collect
                </h2>
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                  2.1 Personal Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect personal information that you voluntarily provide when
                  registering on our platform, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Full name and contact information (email, phone number)</li>
                  <li>CNIC (Computerized National Identity Card) number</li>
                  <li>Profile photo and identification documents</li>
                  <li>Employment and income information (for verification purposes)</li>
                  <li>Payment and billing information</li>
                  <li>Property details (for landlords)</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
                  2.2 Automatically Collected Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you access our Service, we automatically collect certain
                  information, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Device information (type, operating system, browser)</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and preferences</li>
                  <li>Search queries and viewed properties</li>
                </ul>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use the collected information for various purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>To provide and maintain our Service</li>
                  <li>To verify user identity and prevent fraud</li>
                  <li>To calculate AI Trust Scores</li>
                  <li>To facilitate property matching and roommate matching</li>
                  <li>To process payments and generate receipts</li>
                  <li>To communicate with you about updates and promotions</li>
                  <li>To improve our Service and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. AI Trust Score System
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI Trust Score system uses the following data points to generate
                  trust scores:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>CNIC verification status</li>
                  <li>Payment history and timeliness</li>
                  <li>Reviews from previous landlords or tenants</li>
                  <li>Employment verification status</li>
                  <li>Platform activity and behavioral patterns</li>
                  <li>Dispute history and resolution outcomes</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Trust Scores are calculated using machine learning algorithms and are
                  updated regularly. You can request a review of your Trust Score by
                  contacting our support team.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  5. Data Security
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement robust security measures to protect your data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>AES-256 encryption for data at rest and in transit</li>
                  <li>Secure data centers located in Pakistan</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Multi-factor authentication for account access</li>
                  <li>Role-based access controls for our staff</li>
                </ul>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. Data Sharing and Disclosure
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>
                    With landlords/tenants when you express interest in a property or
                    roommate
                  </li>
                  <li>With payment processors to facilitate transactions</li>
                  <li>With verification partners (NADRA, employers) for identity checks</li>
                  <li>With law enforcement when required by law</li>
                  <li>With service providers who assist in operating our platform</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We never sell your personal information to third parties for marketing
                  purposes.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  7. Your Rights
                </h2>
                <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Access and download your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a review of your AI Trust Score</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, please contact us at privacy@makaanx.pk.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  8. Data Retention
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as your account is
                  active or as needed to provide our services. After account deletion,
                  we may retain certain information for up to 7 years to comply with
                  legal obligations and resolve disputes.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  9. Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact
                  us:
                </p>
                <ul className="list-none text-muted-foreground mt-4 space-y-2">
                  <li>Email: privacy@makaanx.pk</li>
                  <li>Phone: +92 300 1234567</li>
                  <li>
                    Address: Floor 3, Arfa Software Technology Park, Ferozepur Road,
                    Lahore, Pakistan
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
