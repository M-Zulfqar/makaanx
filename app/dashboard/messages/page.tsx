"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Image as ImageIcon,
  MapPin,
  ArrowLeft,
  Star,
  Shield,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  id: number
  senderId: number | "me"
  content: string
  timestamp: string
  status: "sent" | "delivered" | "read"
  type?: "text" | "location"
  locationData?: {
    address: string
    coordinates: { lat: number; lng: number }
  }
}

interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  role: string
  verified: boolean
  property: string
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Ahmed Khan",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    lastMessage: "The apartment is available for viewing tomorrow",
    timestamp: "2 min ago",
    unread: 3,
    online: true,
    role: "landlord",
    verified: true,
    property: "Modern Apartment, DHA Phase 5",
  },
  {
    id: 2,
    name: "Fatima Sheikh",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    lastMessage: "Thank you for the information!",
    timestamp: "15 min ago",
    unread: 0,
    online: true,
    role: "tenant",
    verified: true,
    property: "Looking for roommate",
  },
  {
    id: 3,
    name: "Usman Malik",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    lastMessage: "When can we schedule the visit?",
    timestamp: "1 hour ago",
    unread: 1,
    online: false,
    role: "landlord",
    verified: true,
    property: "Villa in Bahria Town",
  },
  {
    id: 4,
    name: "Sara Ahmed",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    lastMessage: "I have sent the documents",
    timestamp: "3 hours ago",
    unread: 0,
    online: false,
    role: "tenant",
    verified: false,
    property: "Roommate search",
  },
  {
    id: 5,
    name: "MakaanX Support",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
    lastMessage: "Your verification is complete!",
    timestamp: "Yesterday",
    unread: 0,
    online: true,
    role: "support",
    verified: true,
    property: "Support",
  },
]

const initialMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 1,
      content: "Hello! I saw your listing for the apartment in DHA Phase 5. Is it still available?",
      timestamp: "10:30 AM",
      status: "read",
    },
    {
      id: 2,
      senderId: "me",
      content: "Yes, it is still available! Would you like to schedule a viewing?",
      timestamp: "10:32 AM",
      status: "read",
    },
    {
      id: 3,
      senderId: 1,
      content: "That would be great! What times work for you?",
      timestamp: "10:35 AM",
      status: "read",
    },
    {
      id: 4,
      senderId: "me",
      content: "I am available tomorrow between 2 PM and 6 PM. Would any time in that window work for you?",
      timestamp: "10:38 AM",
      status: "read",
    },
    {
      id: 5,
      senderId: 1,
      content: "Perfect! How about 3 PM? Also, could you share the exact location?",
      timestamp: "10:40 AM",
      status: "read",
    },
    {
      id: 6,
      senderId: "me",
      content: "3 PM works great! Here is the location:",
      timestamp: "10:42 AM",
      status: "read",
      type: "location",
      locationData: {
        address: "House 45, Street 12, Block J, DHA Phase 5, Lahore",
        coordinates: { lat: 31.4697, lng: 74.4065 },
      },
    },
    {
      id: 7,
      senderId: 1,
      content: "The apartment is available for viewing tomorrow",
      timestamp: "10:45 AM",
      status: "delivered",
    },
  ],
  2: [
    {
      id: 1,
      senderId: 2,
      content: "Hi! I saw your roommate post. I am interested!",
      timestamp: "9:00 AM",
      status: "read",
    },
    {
      id: 2,
      senderId: "me",
      content: "Great! What area are you looking in?",
      timestamp: "9:05 AM",
      status: "read",
    },
    {
      id: 3,
      senderId: 2,
      content: "Thank you for the information!",
      timestamp: "9:10 AM",
      status: "read",
    },
  ],
  3: [
    {
      id: 1,
      senderId: 3,
      content: "Hello, I have a villa available in Bahria Town.",
      timestamp: "Yesterday",
      status: "read",
    },
    {
      id: 2,
      senderId: "me",
      content: "What is the monthly rent?",
      timestamp: "Yesterday",
      status: "read",
    },
    {
      id: 3,
      senderId: 3,
      content: "When can we schedule the visit?",
      timestamp: "1 hour ago",
      status: "delivered",
    },
  ],
  4: [
    {
      id: 1,
      senderId: "me",
      content: "Hi Sara, please send me the required documents.",
      timestamp: "Yesterday",
      status: "read",
    },
    {
      id: 2,
      senderId: 4,
      content: "I have sent the documents",
      timestamp: "3 hours ago",
      status: "read",
    },
  ],
  5: [
    {
      id: 1,
      senderId: 5,
      content: "Welcome to MakaanX! We are here to help you find your perfect home.",
      timestamp: "2 days ago",
      status: "read",
    },
    {
      id: 2,
      senderId: 5,
      content: "Your verification is complete!",
      timestamp: "Yesterday",
      status: "read",
    },
  ],
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(initialConversations[0])
  const [allMessages, setAllMessages] = useState<Record<number, Message[]>>(initialMessages)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentMessages = allMessages[selectedConversation.id] || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  useEffect(() => {
    // Clear unread when selecting conversation
    setConversations(prev => 
      prev.map(c => c.id === selectedConversation.id ? { ...c, unread: 0 } : c)
    )
  }, [selectedConversation.id])

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      senderId: "me",
      content: messageText.trim(),
      timestamp: getCurrentTime(),
      status: "sent",
      type: "text",
    }

    // Add message to current conversation
    setAllMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage]
    }))

    // Update conversation preview
    setConversations(prev => 
      prev.map(c => c.id === selectedConversation.id 
        ? { ...c, lastMessage: messageText.trim(), timestamp: "Just now" } 
        : c
      )
    )

    setMessageText("")
    toast.success("Message sent")

    // Simulate message delivered status after 1 second
    setTimeout(() => {
      setAllMessages(prev => ({
        ...prev,
        [selectedConversation.id]: prev[selectedConversation.id].map(m => 
          m.id === newMessage.id ? { ...m, status: "delivered" } : m
        )
      }))
    }, 1000)

    // Simulate typing indicator and reply for non-support conversations
    if (selectedConversation.role !== "support") {
      setTimeout(() => {
        setIsTyping(true)
      }, 1500)

      setTimeout(() => {
        setIsTyping(false)
        
        // Simulate reply
        const replies = [
          "Thank you for your message! I will get back to you shortly.",
          "Got it! Let me check and confirm.",
          "Sure, that works for me.",
          "Thanks for letting me know!",
          "I appreciate your quick response.",
        ]
        const randomReply = replies[Math.floor(Math.random() * replies.length)]

        const replyMessage: Message = {
          id: Date.now(),
          senderId: selectedConversation.id,
          content: randomReply,
          timestamp: getCurrentTime(),
          status: "read",
          type: "text",
        }

        setAllMessages(prev => ({
          ...prev,
          [selectedConversation.id]: [...(prev[selectedConversation.id] || []), replyMessage]
        }))

        setConversations(prev => 
          prev.map(c => c.id === selectedConversation.id 
            ? { ...c, lastMessage: randomReply, timestamp: "Just now" } 
            : c
          )
        )

        // Mark our message as read
        setAllMessages(prev => ({
          ...prev,
          [selectedConversation.id]: prev[selectedConversation.id].map(m => 
            m.senderId === "me" ? { ...m, status: "read" } : m
          )
        }))
      }, 3000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border border-border overflow-hidden bg-card">
      {/* Conversations List */}
      <div
        className={cn(
          "w-full md:w-96 border-r border-border flex flex-col",
          showMobileChat ? "hidden" : "flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setSelectedConversation(conversation)
                  setShowMobileChat(true)
                }}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors",
                  selectedConversation.id === conversation.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground truncate">
                        {conversation.name}
                      </span>
                      {conversation.verified && (
                        <Shield className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {conversation.property}
                    </Badge>
                    {conversation.unread > 0 && (
                      <Badge className="h-5 min-w-[20px] px-1.5 text-xs bg-primary">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          showMobileChat ? "flex" : "hidden md:flex"
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileChat(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.avatar} />
              <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {selectedConversation.name}
                </h3>
                {selectedConversation.verified && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] px-1.5 py-0 gap-0.5">
                    <Shield className="h-2.5 w-2.5" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isTyping ? (
                  <span className="text-primary">typing...</span>
                ) : selectedConversation.online ? (
                  <span className="text-emerald-500">Online</span>
                ) : (
                  "Last seen 2 hours ago"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => toast.info("Voice call feature coming soon!")}>
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast.info("Video call feature coming soon!")}>
              <Video className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Profile view coming soon!")}>
                  <Info className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Conversation marked as important!")}>
                  <Star className="h-4 w-4 mr-2" />
                  Mark as Important
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => toast.error("User blocked")}>
                  <X className="h-4 w-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  Today
                </span>
              </div>

              {currentMessages.map((message) => {
                const isMe = message.senderId === "me"
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}
                  >
                    {/* Avatar for received messages */}
                    {!isMe && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1">
                        <AvatarImage src={selectedConversation.avatar} />
                        <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}
                    >
                      {message.type === "location" ? (
                        <div className="space-y-2">
                          <p className={isMe ? "text-primary-foreground" : "text-foreground"}>
                            {message.content}
                          </p>
                          <div
                            className={cn(
                              "p-3 rounded-xl",
                              isMe ? "bg-primary-foreground/10" : "bg-background"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium">Location Shared</p>
                                <p className="text-xs opacity-70">
                                  {message.locationData?.address}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        <span className="text-[10px]">{message.timestamp}</span>
                        {isMe && (
                          <>
                            {message.status === "read" ? (
                              <CheckCheck className="h-3 w-3 text-blue-400" />
                            ) : message.status === "delivered" ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => toast.info("File attachment coming soon!")}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast.info("Image sharing coming soon!")}>
              <ImageIcon className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => toast.info("Emoji picker coming soon!")}
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <Button 
              size="icon" 
              onClick={handleSendMessage} 
              disabled={!messageText.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
