'use client'

import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { useUsersPage } from '@/lib/useUsers'
import { useAuth } from '@/lib/auth'
import { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import { useExportUsers } from '@/lib/useUsers'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Plus, Edit2, Trash2, UserCheck, UserX,
  Shield, ShieldCheck, User as UserIcon, Mail, Phone,
  X, RefreshCw, Filter, ChevronLeft, ChevronRight,
  Crown, Briefcase, Calendar, MoreVertical, Loader2,
  CheckCircle, AlertCircle, Eye, EyeOff, Key, AlertTriangle,
  Download, Upload, ShieldAlert, Copy, Check, Clock
} from 'lucide-react'

function UsersPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 animate-pulse lg:mb-12">
          <div className="h-9 w-56 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80" />
          <div className="mt-3 h-4 w-80 rounded-xl bg-gray-200/70 dark:bg-gray-800/70" />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl border border-gray-200/70 bg-white/80 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70" />
          ))}
        </div>

        <div className="mb-6 h-20 rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/70" />
        <div className="h-[420px] rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/70" />
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showRoleWarning, setShowRoleWarning] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showBulkAction, setShowBulkAction] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'sales' | 'admin',
    phone: ''
  })

  const {
    users,
    pagination,
    isLoading,
    isFetching,
    error,
    refetch,
    createUser,
    updateUser, 
    deleteUser,
    toggleUserStatus
  } = useUsersPage({
    search: deferredSearch || undefined,
    role: roleFilter || undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page,
    limit: 10
  })

  const exportUsersMutation = useExportUsers()

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin'
  const activeUsersCount = useMemo(() => users.filter((u) => u.isActive).length, [users])
  const salesUsersCount = useMemo(() => users.filter((u) => u.role === 'sales').length, [users])
  const adminUsersCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users])
  const inactiveUsersCount = useMemo(() => users.filter((u) => !u.isActive).length, [users])

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'user', phone: '' })
    setShowPassword(false)
    setShowRoleWarning(false)
  }

  const handleCloseResetModal = () => {
    setShowResetPasswordModal(false)
    setResetPasswordUser(null)
    setNewPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users')
      return
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    // Warn if creating/updating to admin role
    if (formData.role === 'admin' && (!editingUser || editingUser.role !== 'admin')) {
      if (!window.confirm('⚠️ Warning: You are about to grant ADMIN privileges. This user will have full system access. Are you sure?')) {
        return
      }
    }

    try {
      if (editingUser) {
        const updateData: UpdateUserRequest = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone
        }
        await updateUser.mutateAsync({ id: editingUser._id!, data: updateData })
        
      } else {
        const createData: CreateUserRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone
        }
        await createUser.mutateAsync(createData)
       
      }
      handleCloseModal()
    } catch (error) {
      // Error handled in mutation
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      const { resetUserPassword } = await import('@/lib/api')
      await resetUserPassword(resetPasswordUser._id!, newPassword)
   
      handleCloseResetModal()
    } catch (error) {
      // Error handled in API
    }
  }

  const handleDelete = async (user: User) => {
    if (user._id === currentUser?._id) {
      toast.error('Cannot delete your own account')
      return
    }
    if (confirm(`⚠️ Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      await deleteUser.mutateAsync(user._id!)
      
    }
  }

  const handleToggleStatus = async (user: User) => {
    if (user._id === currentUser?._id) {
      toast.error('Cannot change your own status')
      return
    }
    await toggleUserStatus.mutateAsync(user._id!)
  }

  const handleExportCSV = async () => {
    try {
      const blob = await exportUsersMutation.mutateAsync({
        role: roleFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    
    } catch (error) {
      // Error handled in mutation
    }
  }

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected')
      return
    }

    // Filter out current user
    const filteredUsers = selectedUsers.filter(id => id !== currentUser?._id)
    
    if (filteredUsers.length === 0) {
      toast.error('Cannot change your own status')
      return
    }

    if (confirm(`Are you sure you want to ${isActive ? 'activate' : 'deactivate'} ${filteredUsers.length} user(s)?`)) {
      try {
        const { bulkUpdateUserStatus } = await import('@/lib/api')
        await bulkUpdateUserStatus(filteredUsers, isActive)
      
        setSelectedUsers([])
        refetch()
      } catch (error) {
        // Error handled in API
      }
    }
  }

  const copyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId)
    setCopiedId(userId)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('User ID copied')
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-amber-500" />
      case 'sales': return <Briefcase className="w-4 h-4 text-blue-500" />
      default: return <UserIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      sales: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    }
    return styles[role as keyof typeof styles] || styles.user
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u._id!).filter(id => id !== currentUser?._id))
    }
  }

  if (isLoading || isFetching) {
    return <UsersPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage customers, sales representatives, and administrators
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportCSV}
                  disabled={exportUsersMutation.isPending}
                  className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {exportUsersMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  Export CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add User
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {pagination?.total || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {activeUsersCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sales Team</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {salesUsersCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {adminUsersCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {inactiveUsersCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {selectedUsers.length} user(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate(true)}
                className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <UserCheck className="w-4 h-4 inline mr-1" />
                Activate
              </button>
              <button
                onClick={() => handleBulkStatusUpdate(false)}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <UserX className="w-4 h-4 inline mr-1" />
                Deactivate
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="sales">Sales</option>
              <option value="user">Customer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Active Filters */}
          {(search || roleFilter || statusFilter) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                  Search: {search}
                  <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {roleFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg">
                  Role: {roleFilter}
                  <button onClick={() => setRoleFilter('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700">Clear all</button>
            </div>
          )}
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {search || roleFilter || statusFilter ? 'Try adjusting your filters' : 'Get started by adding your first user'}
              </p>
              {(search || roleFilter || statusFilter) && (
                <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-700 text-sm">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                      {isAdmin && (
                        <th className="px-4 py-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.filter(u => u._id !== currentUser?._id).length && users.length > 0}
                            onChange={selectAllUsers}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">User</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Contact</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Role</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Provider</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Created</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
                        className="transition-colors"
                      >
                        {isAdmin && (
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id!)}
                              onChange={() => toggleUserSelection(user._id!)}
                              disabled={user._id === currentUser?._id}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
</div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{user.name || 'Unnamed User'}</div>
                              <button
                                onClick={() => copyUserId(user._id!)}
                                className="text-xs text-gray-400 font-mono hover:text-blue-600 transition-colors flex items-center gap-1"
                              >
                                ID: {user._id?.slice(-8)}
                                {copiedId === user._id ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500">
                                <Phone className="w-3.5 h-3.5" />
                                <span className="text-sm">{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={!isAdmin || user._id === currentUser?._id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              user.isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                            } ${isAdmin && user._id !== currentUser?._id ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            user.provider === 'google' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {user.provider === 'google' ? 'Google' : 'Local'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setShowUserDetails(user)
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setResetPasswordUser(user)
                                    setShowResetPasswordModal(true)
                                  }}
                                  disabled={user.provider === 'google'}
                                  className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Reset password"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUser(user)
                                    setFormData({
                                      name: user.name,
                                      email: user.email,
                                      password: '',
                                      role: user.role,
                                      phone: user.phone || ''
                                    })
                                    setShowModal(true)
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                                  title="Edit user"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(user)}
                                  disabled={user._id === currentUser?._id}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/30">
                  <div className="text-sm text-gray-500">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum: number
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              page === pageNum
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      disabled={page === pagination.pages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUserDetails(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
                  <button onClick={() => setShowUserDetails(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  {showUserDetails.name ? showUserDetails.name.charAt(0).toUpperCase() : '?'}
                </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{showUserDetails.name || 'Unnamed User'}</h3>
                    <p className="text-sm text-gray-500">{showUserDetails.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">User ID</span>
                    <span className="font-mono text-sm">{showUserDetails._id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Role</span>
                    <span className="capitalize">{showUserDetails.role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Status</span>
                    <span className={showUserDetails.isActive ? 'text-green-600' : 'text-red-600'}>
                      {showUserDetails.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Provider</span>
                    <span>{showUserDetails.provider || 'local'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Phone</span>
                    <span>{showUserDetails.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Created</span>
                    <span>{new Date(showUserDetails.createdAt!).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPasswordModal && resetPasswordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseResetModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Reset password for <strong>{resetPasswordUser.name}</strong> ({resetPasswordUser.email})
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Minimum 6 characters"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleResetPassword}
                    disabled={!newPassword || newPassword.length < 6}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={handleCloseResetModal}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as 'user' | 'sales' | 'admin'
                      setFormData({ ...formData, role: newRole })
                      if (newRole === 'admin' && (!editingUser || editingUser.role !== 'admin')) {
                        setShowRoleWarning(true)
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="user">Customer</option>
                    <option value="sales">Sales Representative</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {showRoleWarning && formData.role === 'admin' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Admin users have full system access
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createUser.isPending || updateUser.isPending}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    {createUser.isPending || updateUser.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      editingUser ? 'Update User' : 'Create User'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}