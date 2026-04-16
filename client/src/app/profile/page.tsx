'use client'

import { useProfile, useChangePassword, useDeleteProfile, useUserOrders } from '@/lib/profile'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import React from 'react'
import { 
  Loader2, User, Mail, Phone, Lock, Trash2, Package, MapPin, 
  Activity, Calendar, DollarSign, Edit2, Save, X, Check, 
  ShoppingBag, Heart, Star, Clock, CreditCard, Shield, 
  Bell, Globe, Smartphone, LogOut, AlertTriangle, Home,
  ChevronRight, ChevronDown, Copy, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Order } from '@/types/order'
import { format } from 'date-fns'

// Enhanced UI Components with Dark Mode Support
const Button = ({ children, className = '', variant = 'default', size = 'default', disabled, onClick, type = 'button' }: any) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl gap-2';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    success: 'bg-success text-success-foreground hover:bg-success/90',
  }
  
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-10 px-4',
    lg: 'h-11 px-8 text-lg',
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '', hover = false }: any) => (
  <div className={`bg-card text-card-foreground rounded-2xl border border-border shadow-lg ${hover ? 'hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/30 transition-all duration-300' : 'shadow-md'} backdrop-blur-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }: any) => <div className={`p-6 pb-3 ${className}`}>{children}</div>
const CardContent = ({ children, className = '' }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>
const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent ${className}`}>{children}</h3>
)
const CardDescription = ({ children, className = '' }: any) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
)

const Input = ({ 
  id, value, onChange, type = 'text', placeholder, required, 
  className = '', minLength, icon: Icon, error 
}: any) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    )}
    <input
      id={id}
      className={`w-full rounded-xl border ${error ? 'border-destructive' : 'border-input'} bg-background/80 backdrop-blur-sm px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-input transition-all duration-200 ${Icon ? 'pl-10' : ''} ${className}`}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
)

const Label = ({ htmlFor, children, required }: any) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-foreground mb-2 block">
    {children}
    {required && <span className="text-destructive ml-1">*</span>}
  </label>
)

const Tabs = ({ defaultValue, className, children }: any) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-b border-gray-800">
        <div className="flex flex-wrap gap-1">
          {React.Children.map(children, child => 
            React.isValidElement(child) && child.type === TabsTrigger 
              ? React.cloneElement(child as React.ReactElement<any>, { 
                  active: value === (child as any).props.value,
                  onClick: () => setValue((child as any).props.value)
                })
              : null
          )}
        </div>
      </div>
      {React.Children.map(children, child => 
        React.isValidElement(child) && child.type === TabsContent && (child as any).props.value === value
          ? child
          : null
      )}
    </div>
  )
}

const TabsTrigger = ({ value, children, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative ${
      active 
        ? 'text-primary border-b-2 border-primary' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`}
  >
    {children}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
    )}
  </button>
)

const TabsContent = ({ value, className, children }: any) => (
  <div className={`animate-fadeIn ${className}`}>
    {children}
  </div>
)

const Table = ({ children }: any) => (
  <div className="w-full overflow-auto rounded-xl border border-border">
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
)

const TableHeader = ({ children }: any) => <thead className="bg-gray-900/50 border-b border-gray-800">{children}</thead>
const TableBody = ({ children }: any) => <tbody>{children}</tbody>

const TableHead = ({ children, className }: any) => (
  <th className={`h-12 px-4 text-left align-middle font-semibold text-gray-300 ${className}`}>
    {children}
  </th>
)

const TableRow = ({ children, className = '' }: any) => (
  <tr className={`border-b border-gray-800 transition-colors hover:bg-gray-800/30 ${className}`}>
    {children}
  </tr>
)

const TableCell = ({ children, className }: any) => (
  <td className={`p-4 align-middle text-gray-300 ${className}`}>
    {children}
  </td>
)

const Avatar = ({ className, children }: any) => (
  <div className={`relative inline-flex overflow-hidden rounded-full ring-4 ring-gray-800 shadow-2xl ${className}`}>
    {children}
  </div>
)

const AvatarImage = ({ src, alt }: any) => src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : null

const AvatarFallback = ({ className, children }: any) => (
  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold ${className}`}>
    {children}
  </div>
)

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white',
    info: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white',
  }
  return (
<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </span>
  )
}

const StatCard = ({ icon: Icon, label, value, trend }: any) => (
  <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-all duration-300">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-blue-600/20 rounded-lg">
        <Icon className="h-5 w-5 text-blue-500" />
      </div>
      {trend && (
        <Badge variant={trend > 0 ? 'success' : 'danger'} className="text-xs">
          {trend > 0 ? '+' : ''}{trend}%
        </Badge>
      )}
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
)

interface Address {
  id: string
  fullName: string
  address1: string
  city: string
  phone: string
  isDefault: boolean
}

export default function ProfilePage() {
  const { profile, update, refetch, isLoading: profileLoading } = useProfile()
  const changePasswordMutation = useChangePassword()
  const deleteProfileMutation = useDeleteProfile()
  const { data: ordersData, isLoading: ordersLoading } = useUserOrders(1, 5)

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({ current: '', new: '', confirm: '' })

  const [addresses, setAddresses] = useState<Address[]>([])
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    address1: '',
    city: '',
    phone: ''
  })
  const [addingAddress, setAddingAddress] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        avatar: profile.avatar || ''
      })
    }
  }, [profile])

  useEffect(() => {
    const saved = localStorage.getItem('profileAddresses')
    if (saved) {
      setAddresses(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('profileAddresses', JSON.stringify(addresses))
  }, [addresses])

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        avatar: editForm.avatar || undefined
      }
      await update.mutateAsync(payload)
      setIsEditing(false)
      toast.success('Profile updated successfully! 🎉')
      refetch()
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const validatePassword = () => {
    const errors = { current: '', new: '', confirm: '' }
    if (!currentPassword) errors.current = 'Current password is required'
    if (newPassword.length < 6) errors.new = 'Password must be at least 6 characters'
    if (newPassword !== confirmPassword) errors.confirm = 'Passwords do not match'
    setPasswordErrors(errors)
    return !Object.values(errors).some(error => error)
  }

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    }, {
      onSuccess: () => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        toast.success('Password changed successfully! 🔒')
      },
      onError: () => {
        toast.error('Current password is incorrect')
      }
    })
  }

  const handleDeleteAccount = () => {
    if (confirm('⚠️ WARNING: This action is irreversible! Are you absolutely sure you want to delete your account?')) {
      deleteProfileMutation.mutate()
    }
  }

  const addAddress = (e: FormEvent) => {
    e.preventDefault()
    const address: Address = {
      id: Date.now().toString(),
      fullName: newAddress.fullName,
      address1: newAddress.address1,
      city: newAddress.city,
      phone: newAddress.phone,
      isDefault: !addresses.length
    }
    setAddresses([address, ...addresses])
    setNewAddress({ fullName: '', address1: '', city: '', phone: '' })
    setShowAddressForm(false)
    toast.success('Address added successfully! 📍')
  }

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
    toast.success('Default address updated! 🏠')
  }

  const deleteAddress = (id: string) => {
    if (confirm('Delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id))
      toast.success('Address deleted')
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 rounded-full p-6 inline-block mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <p className="text-xl font-semibold text-white mb-2">Profile not found</p>
          <p className="text-gray-400 mb-6">Please login to access your profile</p>
          <Link href="/auth/login">
            <Button variant="default">
              Go to Login
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders', value: ordersData?.total || 0 },
    { icon: DollarSign, label: 'Total Spent', value: `KSh ${(ordersData?.orders?.reduce((sum: number, order: Order) => sum + order.total, 0) || 0).toLocaleString()}` },
    { icon: Star, label: 'Reviews', value: '0' },
    { icon: Heart, label: 'Wishlist', value: '0' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32 mx-auto mb-6">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-4xl">
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-0 bg-green-500 rounded-full p-1 border-4 border-gray-900">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary dark:from-white dark:via-blue-400 dark:to-purple-500 bg-clip-text text-transparent mb-3">
              {profile.name}
            </h1>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="info">{profile.role.toUpperCase()}</Badge>
              <Badge variant="default">{profile.provider.toUpperCase()} Account</Badge>
            </div>
            
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Joined {format(new Date(profile.createdAt || 0), 'MMMM yyyy')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="mr-2 h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card hover className="overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Manage your personal details</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" required>Full Name</Label>
                        <Input 
                          id="name" 
                          value={editForm.name}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, name: e.target.value})}
                          required 
                          disabled={!isEditing}
                          icon={User}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" required>Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={editForm.email}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, email: e.target.value})}
                          required 
                          disabled={!isEditing}
                          icon={Mail}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={editForm.phone}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, phone: e.target.value})}
                          disabled={!isEditing}
                          icon={Smartphone}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input 
                          id="avatar" 
                          type="url" 
                          placeholder="https://example.com/avatar.jpg"
                          value={editForm.avatar}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, avatar: e.target.value})}
                          disabled={!isEditing}
                          icon={Globe}
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => {
                          setIsEditing(false)
                          if (profile) {
                            setEditForm({
                              name: profile.name,
                              email: profile.email,
                              phone: profile.phone || '',
                              avatar: profile.avatar || ''
                            })
                          }
                        }}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updating}>
                          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Save className="h-4 w-4 mr-2" />
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card hover>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>{ordersData?.total || 0} total orders placed</CardDescription>
                    </div>
                    <Link href="/orders">
                      <Button variant="outline" size="sm">
                        View All Orders
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map((i) => (
                        <div key={i} className="flex items-center p-4 rounded-xl border border-gray-800 animate-pulse">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg" />
                          <div className="flex-1 space-y-2 ml-4">
                            <div className="h-4 bg-gray-800 rounded w-3/4" />
                            <div className="h-3 bg-gray-800 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : ordersData?.orders?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordersData.orders.map((order: Order) => (
                          <TableRow key={order._id}>
                            <TableCell className="font-mono text-sm">#{order.orderNumber}</TableCell>
                            <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                            <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                            <TableCell>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</TableCell>
                            <TableCell className="text-right font-semibold text-white">
                              KSh {order.total.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-gray-800/30 rounded-full p-6 inline-block mb-4">
                        <Package className="h-12 w-12 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                      <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
                      <Link href="/products">
                        <Button variant="default">
                          Start Shopping
                          <ShoppingBag className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Saved Addresses</CardTitle>
                      <CardDescription>Manage your delivery locations</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                      {showAddressForm ? <X className="h-4 w-4" /> : <MapPin className="h-4 w-4 mr-2" />}
                      {showAddressForm ? 'Cancel' : 'Add Address'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {showAddressForm && (
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 p-6 animate-fadeIn">
                      <h3 className="text-lg font-semibold text-white mb-4">New Address</h3>
                      <form onSubmit={addAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" required>Full Name</Label>
                          <Input 
                            id="fullName"
                            value={newAddress.fullName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, fullName: e.target.value})}
                            required
                            icon={User}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" required>Phone</Label>
                          <Input 
                            id="phone"
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, phone: e.target.value})}
                            required
                            icon={Phone}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address1" required>Address</Label>
                          <Input 
                            id="address1"
                            value={newAddress.address1}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, address1: e.target.value})}
                            placeholder="Street address"
                            required
                            icon={Home}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="city" required>City</Label>
                          <Input 
                            id="city"
                            value={newAddress.city}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, city: e.target.value})}
                            required
                            icon={MapPin}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Button type="submit" className="w-full" disabled={addingAddress}>
                            <Check className="h-4 w-4 mr-2" />
                            Save Address
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {addresses.length ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="font-semibold text-white text-lg">{address.fullName}</span>
                                {address.isDefault && (
                                  <Badge variant="success">Default Address</Badge>
                                )}
                              </div>
                              <p className="text-gray-300 mb-1">{address.address1}</p>
                              <p className="text-gray-300 mb-3">{address.city}</p>
                              <p className="text-gray-400 text-sm flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {address.phone}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!address.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDefaultAddress(address.id)}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAddress(address.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-gray-800/30 rounded-full p-6 inline-block mb-4">
                        <MapPin className="h-12 w-12 text-gray-500" />
                      </div>
                      <p className="text-gray-400">No addresses saved yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="password">
              <Card hover>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" required>Current Password</Label>
                      <Input 
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                        required
                        icon={Lock}
                        error={passwordErrors.current}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" required>New Password</Label>
                      <Input 
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        minLength={6}
                        required
                        icon={Shield}
                        error={passwordErrors.new}
                      />
                      <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" required>Confirm New Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        required
                        icon={Check}
                        error={passwordErrors.confirm}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
                      {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-500/20 bg-gradient-to-br from-red-950/20 to-red-900/10 mt-6">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-red-500">Danger Zone</CardTitle>
                      <CardDescription className="text-red-400/80">
                        Permanently delete your account and all associated data
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-red-400 mb-2">This action will permanently delete:</p>
                    <ul className="text-sm text-red-400/80 space-y-1 list-disc list-inside">
                      <li>Your profile and personal information</li>
                      <li>All order history and records</li>
                      <li>Saved addresses and payment methods</li>
                      <li>Reviews and feedback</li>
                      <li>Account cannot be recovered</li>
                    </ul>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="lg"
                    className="w-full"
                    onClick={handleDeleteAccount}
                    disabled={deleteProfileMutation.isPending}
                  >
                    {deleteProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Permanently Delete Account
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card hover>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest account activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-800/20 to-gray-900/20 border border-gray-800">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Profile Updated</p>
                        <p className="text-sm text-gray-400">You updated your profile information</p>
                      </div>
                      <Badge variant="info">2 hours ago</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-800/20 to-gray-900/20 border border-gray-800">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Package className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Order Delivered</p>
                        <p className="text-sm text-gray-400">Order #ORD123 was delivered successfully</p>
                      </div>
                      <Badge variant="success">Yesterday</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-800/20 to-gray-900/20 border border-gray-800">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Lock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">Login from new device</p>
                        <p className="text-sm text-gray-400">Chrome on Windows - IP: 192.168.1.1</p>
                      </div>
                      <Badge variant="warning">3 days ago</Badge>
                    </div>
                    
                    <div className="text-center pt-6">
                      <Link href="/dashboard">
                        <Button variant="outline">
                          View Full Activity History
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}