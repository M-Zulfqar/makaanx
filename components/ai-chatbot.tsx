"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Home,
  MapPin,
  DollarSign,
  Star,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface AIChatbotProps {
  isOpen: boolean
  onClose: () => void
}

const suggestedPrompts = [
  { icon: Home, text: "Find 2-bedroom apartments in DHA" },
  { icon: MapPin, text: "Show properties near Gulberg" },
  { icon: DollarSign, text: "Properties under PKR 50,000/month" },
  { icon: Star, text: "Top-rated landlords in Lahore" },
]

const aiResponses: Record<string, string> = {
  "2-bedroom": `I found several great 2-bedroom options for you in DHA:

**1. Modern Apartment in DHA Phase 5**
- 2 Beds, 2 Baths | 1,200 sqft
- PKR 65,000/month
- Trust Score: 92/100

**2. Furnished Flat in DHA Phase 6**
- 2 Beds, 2 Baths | 1,100 sqft
- PKR 55,000/month
- Trust Score: 88/100

**3. Luxury Apartment in DHA Phase 8**
- 2 Beds, 3 Baths | 1,400 sqft
- PKR 80,000/month
- Trust Score: 95/100

Would you like me to schedule viewings for any of these properties?`,

  "gulberg": `Here are properties near Gulberg:

**1. Executive Apartment - Gulberg III**
- 3 Beds, 2 Baths | 1,500 sqft
- PKR 85,000/month
- Walking distance to MM Alam Road

**2. Studio Apartment - Gulberg II**
- 1 Bed, 1 Bath | 600 sqft
- PKR 35,000/month
- Near Hussain Chowk

**3. Family Home - Gulberg V**
- 4 Beds, 3 Baths | 2,000 sqft
- PKR 120,000/month
- Quiet neighborhood

Would you like more details on any of these?`,

  "50000": `Budget-friendly options under PKR 50,000/month:

**1. Cozy 1-Bedroom in Johar Town**
- 1 Bed, 1 Bath | 700 sqft
- PKR 28,000/month
- Trust Score: 85/100

**2. Studio in Model Town**
- Studio, 1 Bath | 500 sqft
- PKR 22,000/month
- Utilities included

**3. 2-Bedroom in Township**
- 2 Beds, 1 Bath | 900 sqft
- PKR 45,000/month
- Trust Score: 90/100

These are all verified properties with trusted landlords!`,

  "landlord": `Here are top-rated landlords in Lahore:

**1. Ahmed Khan** - Trust Score: 98/100
- 15 properties listed
- Average response time: 2 hours
- 4.9 star rating (120 reviews)

**2. Fatima Malik** - Trust Score: 96/100
- 8 properties listed
- Average response time: 1 hour
- 4.8 star rating (85 reviews)

**3. Usman Ali** - Trust Score: 95/100
- 22 properties listed
- Average response time: 3 hours
- 4.7 star rating (200 reviews)

Would you like to see properties from any of these landlords?`,

  "default": `I am MakaanX AI, your personal rental assistant! I can help you with:

- **Finding Properties**: Tell me your preferences (location, budget, bedrooms)
- **Landlord Information**: Get trust scores and reviews
- **Scheduling Viewings**: Book property visits instantly
- **Rental Advice**: Tips for finding the perfect home in Pakistan
- **Document Help**: Guide you through rental agreements

What would you like help with today?`
}

export function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I am MakaanX AI, your personal rental assistant. How can I help you find your perfect home today?",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes("2-bedroom") || lowerMessage.includes("2 bedroom") || lowerMessage.includes("dha")) {
      return aiResponses["2-bedroom"]
    }
    if (lowerMessage.includes("gulberg") || lowerMessage.includes("near")) {
      return aiResponses["gulberg"]
    }
    if (lowerMessage.includes("50000") || lowerMessage.includes("50,000") || lowerMessage.includes("budget") || lowerMessage.includes("under")) {
      return aiResponses["50000"]
    }
    if (lowerMessage.includes("landlord") || lowerMessage.includes("rated") || lowerMessage.includes("top")) {
      return aiResponses["landlord"]
    }
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("help")) {
      return aiResponses["default"]
    }
    
    return `I understand you are looking for "${userMessage}". Let me search our database...

Based on your query, here are my recommendations:

1. **Check the Properties page** for listings matching your criteria
2. **Use filters** to narrow down by location, price, and bedrooms
3. **Contact landlords** directly through our messaging system

Would you like me to help you with something more specific? Try asking about:
- Specific locations (DHA, Gulberg, Bahria Town)
- Budget ranges
- Number of bedrooms
- Landlord ratings`
  }

  const handleSend = () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputText.trim(),
      timestamp: getCurrentTime(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    // Simulate AI thinking and responding
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: getAIResponse(userMessage.content),
        timestamp: getCurrentTime(),
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt)
    setTimeout(() => handleSend(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-[450px] h-[600px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">MakaanX AI</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Always here to help
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                      <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn(
                          message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {message.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      <prompt.icon className="h-3 w-3" />
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask me anything about rentals..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isTyping}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                AI responses are generated for demo purposes
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
