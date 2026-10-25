"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function TermsPage() {
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
              Terms of Service
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
            className="space-y-8"
          >
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using MakaanX (&quot;the Service&quot;), you agree to be bound
                by these Terms of Service (&quot;Terms&quot;). If you disagree with any part
                of these terms, you may not access the Service. These Terms apply to
                all visitors, users, landlords, tenants, and others who access or use
                the Service.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MakaanX is an AI-powered rental ecosystem that connects landlords and
                tenants in Pakistan. Our services include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Property listing and search</li>
                <li>AI-powered trust scoring system</li>
                <li>Identity verification (CNIC)</li>
                <li>Secure payment processing</li>
                <li>Digital contract management</li>
                <li>Roommate matching</li>
                <li>In-platform messaging</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. User Accounts
              </h2>
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                3.1 Account Creation
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                You must provide accurate, complete, and current information when
                creating an account. You are responsible for safeguarding your account
                credentials and for all activities that occur under your account.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
                3.2 CNIC Verification
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features, you must verify your identity using your
                CNIC. By submitting your CNIC, you authorize us to verify your identity
                through NADRA or other authorized verification services.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
                3.3 Account Types
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Users can register as Tenants (seeking rental properties) or Landlords
                (listing properties for rent). Each account type has different features
                and responsibilities as outlined in these Terms.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. Landlord Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed">As a landlord, you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Provide accurate property information and photos</li>
                <li>Verify your ownership or authorization to rent the property</li>
                <li>Maintain the property in habitable condition</li>
                <li>Respond to tenant inquiries within 48 hours</li>
                <li>Not discriminate against tenants based on religion, ethnicity, or gender</li>
                <li>Honor rental agreements made through the platform</li>
                <li>Report any maintenance issues promptly</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Tenant Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed">As a tenant, you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Provide accurate personal and employment information</li>
                <li>Pay rent on time as per the agreement</li>
                <li>Maintain the property in good condition</li>
                <li>Report any damages or issues to the landlord promptly</li>
                <li>Not sublet the property without landlord approval</li>
                <li>Follow community rules and respect neighbors</li>
                <li>Provide proper notice before vacating</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. AI Trust Score
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our AI Trust Score system evaluates users based on various factors
                including verification status, payment history, reviews, and platform
                behavior. By using the Service, you consent to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Having your Trust Score calculated and displayed to other users</li>
                <li>Receiving a Trust Score based on your activities and history</li>
                <li>Score adjustments based on your behavior on the platform</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Trust Scores are informational tools and do not guarantee user behavior.
                Users should exercise their own judgment when making rental decisions.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. Payments
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MakaanX facilitates payments between landlords and tenants but is not
                a party to rental agreements. Our payment terms include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>A 2.5% service fee on rent payments processed through the platform</li>
                <li>Funds are held for 24-48 hours before transfer to landlords</li>
                <li>Refunds are subject to our refund policy and dispute resolution</li>
                <li>All payments are processed in Pakistani Rupees (PKR)</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                8. Prohibited Conduct
              </h2>
              <p className="text-muted-foreground leading-relaxed">Users must not:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Post false, misleading, or fraudulent listings</li>
                <li>Harass, threaten, or discriminate against other users</li>
                <li>Use the platform for illegal activities</li>
                <li>Attempt to circumvent our payment system</li>
                <li>Create multiple accounts or impersonate others</li>
                <li>Scrape or collect data from the platform without permission</li>
                <li>Interfere with the platform&apos;s operation or security</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                9. Dispute Resolution
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In case of disputes between landlords and tenants:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Either party can file a dispute through the platform</li>
                <li>Our team will review all evidence within 7 days</li>
                <li>We may hold funds during the dispute resolution process</li>
                <li>Our decision is final for platform-related matters</li>
                <li>Legal matters outside our scope should be pursued through courts</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MakaanX provides a platform for connecting landlords and tenants. We
                are not liable for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Property conditions or landlord/tenant behavior</li>
                <li>Financial losses from rental arrangements</li>
                <li>Accuracy of user-provided information</li>
                <li>Service interruptions or technical issues</li>
                <li>Actions of third-party service providers</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                11. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify
                users of significant changes via email or platform notification.
                Continued use of the Service after changes constitutes acceptance of
                the new Terms.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                12. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please contact us:
              </p>
              <ul className="list-none text-muted-foreground mt-4 space-y-2">
                <li>Email: legal@makaanx.pk</li>
                <li>Phone: +92 300 1234567</li>
                <li>
                  Address: Floor 3, Arfa Software Technology Park, Ferozepur Road,
                  Lahore, Pakistan
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
