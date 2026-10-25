"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  ChevronDown,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Shield,
  Home,
  CreditCard,
  Users,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import Link from "next/link"

const categories = [
  {
    icon: Home,
    title: "Finding a Property",
    description: "Search, filter, and discover your perfect rental",
    articles: 12,
  },
  {
    icon: Shield,
    title: "Trust & Verification",
    description: "Understand our AI trust scores and verification process",
    articles: 8,
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Rent payments, receipts, and payment methods",
    articles: 15,
  },
  {
    icon: Users,
    title: "Roommate Matching",
    description: "Find compatible roommates with our AI matching",
    articles: 6,
  },
  {
    icon: FileText,
    title: "Contracts & Agreements",
    description: "Digital contracts and legal documentation",
    articles: 10,
  },
  {
    icon: HelpCircle,
    title: "Account & Settings",
    description: "Manage your profile, preferences, and security",
    articles: 9,
  },
]

const popularFAQs = [
  {
    question: "How does the AI Trust Score work?",
    answer:
      "Our AI Trust Score analyzes multiple factors including CNIC verification status, payment history, previous landlord reviews, employment verification, and behavioral patterns. The score ranges from 0-100, with higher scores indicating more trustworthy users. Properties and users with scores above 80 are considered highly reliable.",
  },
  {
    question: "How do I verify my CNIC?",
    answer:
      "During signup, you can verify your CNIC by uploading a clear photo of your National Identity Card. Our system uses OCR technology to extract information and verify it against NADRA records. Verification typically takes 24-48 hours. You can also visit one of our partner verification centers for instant verification.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept multiple payment methods including JazzCash, Easypaisa, bank transfers (all major Pakistani banks), debit/credit cards (Visa, Mastercard), and cash payments at authorized collection points. All digital payments are secured with bank-grade encryption.",
  },
  {
    question: "How does roommate matching work?",
    answer:
      "Our AI-powered roommate matching considers your lifestyle preferences, budget range, location preferences, cleanliness habits, work schedule, and social preferences. You can swipe through potential matches, and when both parties express interest, you can start chatting to discuss arrangements.",
  },
  {
    question: "What if I have a dispute with my landlord?",
    answer:
      "MakaanX provides a built-in dispute resolution system. You can file a complaint through your dashboard, and our team will mediate between you and your landlord. We review all evidence including chat history, payment records, and contract terms. Most disputes are resolved within 7-14 days.",
  },
  {
    question: "How do I list my property as a landlord?",
    answer:
      "Sign up or log in, select 'Landlord' as your role, and click 'Add Property' from your dashboard. You'll need to provide property details, upload photos, set rental terms, and verify your ownership documents. Properties are reviewed within 24 hours before going live.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes, we take security seriously. All data is encrypted using AES-256 encryption, stored on secure servers in Pakistan, and never shared with third parties without your consent. We comply with Pakistan's data protection regulations and follow international security standards.",
  },
  {
    question: "Can I schedule property visits?",
    answer:
      "Yes! Once you find a property you like, you can request a visit through the platform. The landlord will receive your request and can accept or suggest alternative times. You'll receive notifications about the visit status and reminders before the scheduled time.",
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Search our knowledge base or browse categories below
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Browse by Category
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {category.articles} articles
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular FAQs */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {popularFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 overflow-hidden"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-medium text-foreground">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Still need help?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our support team in real-time
              </p>
              <Button className="w-full">Start Chat</Button>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Available 9 AM - 9 PM (PKT)
              </p>
              <Button variant="outline" className="w-full">
                +92 300 1234567
              </Button>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We reply within 24 hours
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
