'use client'

import { useProfile, useChangePassword, useDeleteProfile, useUserOrders, useUploadAvatar, useDeleteAvatar } from '@/lib/profile'
import { useAuth } from '@/lib/auth'
import { Avatar } from '@/components/Avatar'
import { useState, useEffect, ChangeEvent, FormEvent, DragEvent, useRef, useCallback } from 'react'
import React from 'react'
import { 
  Loader2, User, Mail, Phone, Lock, Trash2, Package, MapPin, 
  Calendar, DollarSign, Edit2, Save, X, Check, 
  ShoppingBag, Heart, Star, Clock, CreditCard, Shield, 
  AlertTriangle, Home, ArrowRight, CircleDot, Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Order } from '@/types/order'
import { format } from 'date-fns'

// ========== UI Components ==========
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost' | 'success'
type ButtonSize = 'sm' | 'default' | 'lg'

type ButtonProps = {
  children: React.ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
}



const Button = ({ children, className = '', variant = 'default', size = 'default', disabled, onClick, type = 'button' }: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 gap-2'
  
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow',
    destructive: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white',
    outline: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white',
  }
  
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 border-b border-gray-100 dark:border-gray-800 ${className}`}>{children}</div>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-base font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>
)

const Input = ({ id, value, onChange, type = 'text', placeholder, required, className = '', minLength, icon: Icon, error }: any) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
    <input
      id={id}
      className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${Icon ? 'pl-9' : ''} ${className}`}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

const Label = ({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) => (
  <label htmlFor={htmlFor} className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-4 hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
  </div>
)

const Tabs = ({ defaultValue, className, children }: any) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-800">
        {React.Children.map(children, child => 
          React.isValidElement(child) && child.type === TabsTrigger 
            ? React.cloneElement(child as React.ReactElement<any>, { 
                active: value === (child as any).props.value,
                onClick: () => setValue((child as any).props.value)
              })
            : null
        )}
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
    className={`px-4 py-2 text-sm font-medium transition-all relative -mb-px ${
      active 
        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
  >
    {children}
  </button>
)

const TabsContent = ({ value, className, children }: any) => (
  <div className={`animate-fadeIn ${className}`}>{children}</div>
)

// ========== Main Profile Component ==========
export default function ProfilePage() {
  const { profile, update, refetch, isLoading: profileLoading } = useProfile()
  const changePasswordMutation = useChangePassword()
  const deleteProfileMutation = useDeleteProfile()
  const { data: ordersData, isLoading: ordersLoading } = useUserOrders(1, 5)
  const uploadAvatarMutation = useUploadAvatar()
  const deleteAvatarMutation = useDeleteAvatar()
  const { user: authUser } = useAuth()

  const getUserId = useCallback(() => {
    return authUser?.id || authUser?._id || profile?.id || profile?._id || null;
  }, [authUser, profile]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
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
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({ current: '', new: '', confirm: '' })
  const [addresses, setAddresses] = useState<any[]>([])
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    address1: '',
    city: '',
    phone: ''
  })
  const [showAddressForm, setShowAddressForm] = useState(false)

  // Get avatar URL function
  const getAvatarUrl = (userId: string) => {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/users/${userId}/avatar`
  }

  // Clear preview on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  // Reset preview when profile avatar changes
  useEffect(() => {
    if (profile?.avatar && !avatarFile) {
      setAvatarPreview(null)
    }
  }, [profile?.avatar, avatarFile])

  // Avatar handlers
 // Avatar handlers
const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }
};

const handleAvatarDrop = (e: DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }
};

// NEW: Handle upload using React Query hook
const handleAvatarUploadWithHook = () => {
  if (!avatarFile) {
    toast.error('Please select an image first');
    return;
  }
  
  uploadAvatarMutation.mutate(avatarFile, {
    onSuccess: () => {
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      refetch();
    }
  });
};

// NEW: Handle remove using React Query hook
const handleAvatarRemoveWithHook = () => {
  if (!profile?.avatar) {
    toast.error('No profile picture to remove');
    return;
  }
  
  if (confirm('Are you sure you want to remove your profile picture?')) {
    deleteAvatarMutation.mutate(undefined, {
      onSuccess: () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        refetch();
      }
    });
  }
};

  // Removed unused displayAvatarUrl

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
      await update.mutateAsync({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        avatar: editForm.avatar || undefined
      })
      setIsEditing(false)
      refetch()
    } catch (error) {
      // Error handled in mutation
    } finally {
      setUpdating(false)
    }
  }

  const validatePassword = () => {
    const errors = { current: '', new: '', confirm: '' }
    if (!currentPassword) errors.current = 'Current password required'
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
      }
    })
  }

  const handleDeleteAccount = () => {
    if (confirm('⚠️ WARNING: This action is irreversible! Are you sure you want to delete your account?')) {
      deleteProfileMutation.mutate()
    }
  }

  const addAddress = (e: FormEvent) => {
    e.preventDefault()
    const address = {
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
    toast.success('Address added successfully')
  }

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
    toast.success('Default address updated')
  }

  const deleteAddress = (id: string) => {
    if (confirm('Delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id))
      toast.success('Address deleted')
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">Profile not found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please login to access your profile</p>
          <Link href="/auth/login">
            <Button size="sm">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: ShoppingBag, label: 'Orders', value: ordersData?.total || 0 },
    { icon: DollarSign, label: 'Spent', value: `KSh ${(ordersData?.orders?.reduce((sum: number, order: Order) => sum + order.total, 0) || 0).toLocaleString()}` },
    { icon: Star, label: 'Reviews', value: '0' },
    { icon: Heart, label: 'Wishlist', value: '0' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-3">
                <Avatar 
                  size="lg" 
                  previewUrl={avatarPreview || undefined} 
                  userId={getUserId() || undefined}
                  className="shadow-lg border-4 border-white dark:border-gray-900"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.name}
              </h1>
          
          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            <Badge variant="info">{profile?.role?.toUpperCase() || 'USER'}</Badge>
            <Badge>{profile?.provider?.toUpperCase() || 'EMAIL'}</Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              Joined {format(new Date(profile?.createdAt || Date.now()), 'MMM yyyy')}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
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
                    
                    <div>
                      <Label htmlFor="email" required>Email</Label>
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
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={editForm.phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm({...editForm, phone: e.target.value})}
                        disabled={!isEditing}
                        icon={Phone}
                      />
                    </div>
                    
<div>
  <Label>Profile Picture</Label>
  <div className="space-y-4">
    <div className="flex items-center gap-4">
<Avatar 
  size="lg" 
  previewUrl={avatarPreview || undefined}
  userId={authUser?.id || authUser?._id || profile?.id || profile?._id}
  className="border-2 border-gray-200"
/>

      
      {/* Upload Controls */}
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
          
          {avatarFile && (
            <Button
              type="button"
              size="sm"
              onClick={handleAvatarUploadWithHook}
              disabled={uploadAvatarMutation.isPending}
            >
              {uploadAvatarMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Upload
            </Button>
          )}
          
          {profile?.avatar && !avatarFile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAvatarRemoveWithHook}
              disabled={deleteAvatarMutation.isPending}
              className="text-red-500 hover:text-red-600"
            >
              {deleteAvatarMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Recommended: Square image, at least 200x200px. Max 5MB.
        </p>
      </div>
    </div>
  </div>
</div>



                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => {
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
                        <X className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={updating}>
                        {updating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>{ordersData?.total || 0} total orders</CardDescription>
                  </div>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : ordersData?.orders?.length ? (
                  <div className="space-y-2">
                    {ordersData.orders.map((order: Order) => (
                      <Link key={order._id} href={`/orders/${order._id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                          <div>
                            <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                          </div>
                          <div className="text-right">
                            <OrderStatusBadge status={order.status} />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                              KSh {order.total.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No orders yet</p>
                    <Link href="/products">
                      <Button size="sm" className="mt-3">Start Shopping</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>Manage your delivery locations</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                    {showAddressForm ? <X className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5 mr-1" />}
                    {showAddressForm ? 'Cancel' : 'Add Address'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddressForm && (
                  <form onSubmit={addAddress} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                    <Input
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, fullName: e.target.value})}
                      required
                      icon={User}
                    />
                    <Input
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, phone: e.target.value})}
                      required
                      icon={Phone}
                    />
                    <Input
                      placeholder="Street Address"
                      value={newAddress.address1}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, address1: e.target.value})}
                      required
                      icon={Home}
                    />
                    <Input
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAddress({...newAddress, city: e.target.value})}
                      required
                      icon={MapPin}
                    />
                    <Button type="submit" size="sm" className="w-full">Save Address</Button>
                  </form>
                )}

                {addresses.length ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div key={address.id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900 dark:text-white">{address.fullName}</span>
                              {address.isDefault && (
                                <Badge variant="success" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{address.address1}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{address.city}</p>
                            <p className="text-xs text-gray-500 mt-1">{address.phone}</p>
                          </div>
                          <div className="flex gap-1">
                            {!address.isDefault && (
                              <Button variant="ghost" size="sm" onClick={() => setDefaultAddress(address.id)}>
                                <CircleDot className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => deleteAddress(address.id)} className="text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No addresses saved</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword" required>Current Password</Label>
                    <Input 
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                      required
                      icon={Lock}
                      error={passwordErrors.current}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" required>New Password</Label>
                    <Input 
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                      icon={Shield}
                      error={passwordErrors.new}
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" required>Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      required
                      icon={Check}
                      error={passwordErrors.confirm}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showPassword"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="showPassword" className="text-xs text-gray-600 dark:text-gray-400">
                      Show passwords
                    </label>
                  </div>
                  
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="mt-4 border-red-200 dark:border-red-800/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-red-600 dark:text-red-400">Delete Account</CardTitle>
                    <CardDescription>Permanently delete your account and all data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    This action cannot be undone. All your orders, addresses, and personal data will be permanently deleted.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteProfileMutation.isPending}
                >
                  {deleteProfileMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}