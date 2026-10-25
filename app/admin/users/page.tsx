"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  Trash2,
  UserCheck,
  Shield,
  ShieldCheck,
  ShieldX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCog,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const users = [
  {
    id: 1,
    name: "Ali Hassan",
    email: "ali.hassan@gmail.com",
    phone: "+92 300 1234567",
    role: "tenant",
    status: "active",
    verified: true,
    trustScore: 92,
    joinedAt: "Jan 15, 2024",
    location: "Lahore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    properties: 0,
    transactions: 12,
  },
  {
    id: 2,
    name: "Ahmed Khan",
    email: "ahmed.khan@outlook.com",
    phone: "+92 321 9876543",
    role: "landlord",
    status: "active",
    verified: true,
    trustScore: 88,
    joinedAt: "Dec 10, 2023",
    location: "Karachi",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    properties: 12,
    transactions: 156,
  },
  {
    id: 3,
    name: "Fatima Sheikh",
    email: "fatima.sheikh@yahoo.com",
    phone: "+92 333 4567890",
    role: "tenant",
    status: "pending",
    verified: false,
    trustScore: null,
    joinedAt: "Mar 1, 2024",
    location: "Islamabad",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    properties: 0,
    transactions: 0,
  },
  {
    id: 4,
    name: "Usman Malik",
    email: "usman.malik@gmail.com",
    phone: "+92 345 6789012",
    role: "landlord",
    status: "suspended",
    verified: true,
    trustScore: 45,
    joinedAt: "Nov 20, 2023",
    location: "Lahore",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    properties: 5,
    transactions: 23,
  },
  {
    id: 5,
    name: "Sara Ahmed",
    email: "sara.ahmed@hotmail.com",
    phone: "+92 311 2345678",
    role: "tenant",
    status: "active",
    verified: true,
    trustScore: 95,
    joinedAt: "Feb 5, 2024",
    location: "Rawalpindi",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    properties: 0,
    transactions: 6,
  },
  {
    id: 6,
    name: "Mohammad Raza",
    email: "m.raza@gmail.com",
    phone: "+92 322 8765432",
    role: "admin",
    status: "active",
    verified: true,
    trustScore: 100,
    joinedAt: "Aug 1, 2023",
    location: "Lahore",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
    properties: 0,
    transactions: 0,
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [viewUserOpen, setViewUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    tenants: users.filter((u) => u.role === "tenant").length,
    landlords: users.filter((u) => u.role === "landlord").length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  const toggleSelect = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uid) => uid !== id))
    } else {
      setSelectedUsers([...selectedUsers, id])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all platform users
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <UserCheck className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.tenants}</p>
                <p className="text-sm text-muted-foreground">Tenants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Building2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.landlords}</p>
                <p className="text-sm text-muted-foreground">Landlords</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <UserCog className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="tenant">Tenants</SelectItem>
                  <SelectItem value="landlord">Landlords</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} selected
                </span>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-destructive">
                  <Ban className="h-4 w-4" />
                  Ban
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={
                        selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Trust Score
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Location
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th className="p-4 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleSelect(user.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{user.name}</p>
                              {user.verified && (
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={
                            user.role === "admin"
                              ? "border-purple-500/50 text-purple-600"
                              : user.role === "landlord"
                              ? "border-amber-500/50 text-amber-600"
                              : "border-blue-500/50 text-blue-600"
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : user.status === "pending"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-red-500/10 text-red-600"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.trustScore !== null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                user.trustScore >= 80
                                  ? "text-emerald-600"
                                  : user.trustScore >= 60
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {user.trustScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {user.location}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{user.joinedAt}</span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setViewUserOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "active" ? (
                              <DropdownMenuItem className="text-amber-600">
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-emerald-600">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="ghost" size="sm">
                2
              </Button>
              <Button variant="ghost" size="sm">
                3
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={viewUserOpen} onOpenChange={setViewUserOpen}>
        <DialogContent className="max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  View complete user information and activity
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* User Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback className="text-2xl">{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                      {selectedUser.verified && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedUser.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedUser.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {selectedUser.trustScore ?? "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedUser.properties}</p>
                    <p className="text-xs text-muted-foreground">Properties</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedUser.transactions}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <Badge
                      className={
                        selectedUser.status === "active"
                          ? "bg-emerald-500"
                          : selectedUser.status === "pending"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }
                    >
                      {selectedUser.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Status</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <p className="font-medium capitalize">{selectedUser.role}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{selectedUser.location}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Joined</p>
                    <p className="font-medium">{selectedUser.joinedAt}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Verification</p>
                    <p className="font-medium flex items-center gap-1">
                      {selectedUser.verified ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          CNIC Verified
                        </>
                      ) : (
                        <>
                          <ShieldX className="h-4 w-4 text-amber-500" />
                          Pending
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewUserOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit User
                </Button>
                {selectedUser.status === "active" ? (
                  <Button variant="destructive" className="gap-2">
                    <Ban className="h-4 w-4" />
                    Suspend User
                  </Button>
                ) : (
                  <Button className="gap-2">
                    <UserCheck className="h-4 w-4" />
                    Activate User
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
