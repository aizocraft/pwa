// src/app/dashboard/submissions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import type { ContactStatus } from '@/types/contact'
import toast from 'react-hot-toast'
import {
  getContactMessages,
  getContactMessage,
  updateContactStatus,
  deleteContact,
  getContactStats,
  getFeedbacks,
  getFeedbackStats,
  updateFeedbackStatus,
  deleteFeedback
} from '@/lib/api'
import { 
  Star, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Reply,
  Trash2,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  Check,
  AlertCircle,
  Package,
  Users,
  TrendingUp,
  ThumbsUp,
  Meh,
  Frown,
  Smile,
  Angry
} from 'lucide-react'

type Submission = {
  _id: string
  type: 'feedback' | 'contact'
  name: string
  email?: string
  phone?: string
  rating?: number
  category?: string
  feedback?: string
  subject?: string
  message?: string
  status: string
  createdAt: string
  isPublic?: boolean
  notes?: string
}

type SubmissionStats = {
  total: number
  pending: number
  resolved: number
  replied: number
  feedbackCount: number
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState('')

  useEffect(() => {
    fetchData()
  }, [filters])

const fetchData = async () => {
  setLoading(true)
  try {
    const contactParams = {
      page: filters.page,
      limit: Math.floor(filters.limit / 2),
      status: filters.status === '' ? undefined : filters.status,
      search: filters.search
    }
    const feedbackParams = {
      page: filters.page,
      limit: Math.floor(filters.limit / 2),
      status: filters.status,
      search: filters.search,
      rating: undefined
    }

    const [contactsRes, feedbackRes, contactStatsRes, feedbackStatsRes] = await Promise.all([
      filters.type !== 'feedback' ? getContactMessages(contactParams) : Promise.resolve({ data: [], pagination: { total: 0 } } as any),
      filters.type !== 'contact' ? getFeedbacks(feedbackParams) : Promise.resolve({ data: [], pagination: { total: 0 } } as any),
      getContactStats(),
      getFeedbackStats()
    ])

    // Merge submissions
    const allContacts: Submission[] = contactsRes.data.map((c: any) => ({
      _id: c._id,
      type: 'contact' as const,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt,
      notes: c.notes
    }))

    const allFeedback: Submission[] = feedbackRes.data.map((f: any) => ({
      _id: f._id,
      type: 'feedback' as const,
      name: f.name,
      email: f.email,
      rating: f.rating,
      category: f.category,
      feedback: f.feedback,
      status: f.status,
      createdAt: f.createdAt,
      isPublic: f.isPublic
    }))

    // Sort by createdAt desc
    const mergedSubmissions = [...allContacts, ...allFeedback].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, filters.limit)

    const total = contactsRes.pagination.total + feedbackRes.pagination.total

    setSubmissions(mergedSubmissions)
    setPagination({
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit)
    })

    // Merge stats
    setStats({
      total,
      pending: contactStatsRes.data.pending + (feedbackStatsRes.data as any).pending || 0,
      resolved: contactStatsRes.data.resolved + (feedbackStatsRes.data as any).resolved || 0,
      replied: contactStatsRes.data.replied + 0,
      feedbackCount: feedbackRes.pagination.total
    } as SubmissionStats)
  } catch (error) {
    console.error('Failed to fetch data:', error)
    toast.error('Failed to load submissions')
  } finally {
    setLoading(false)
  }
}

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const submission = submissions.find(s => s._id === id)
      if (submission?.type === 'contact') {
        await updateContactStatus(id, status as any)
      } else {
        await updateFeedbackStatus(id, status)
      }
      toast.success('Status updated successfully')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status')
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        const submission = submissions.find(s => s._id === id)
        if (submission?.type === 'contact') {
          await deleteContact(id)
        } else {
          await deleteFeedback(id)
        }
        toast.success('Submission deleted')
        fetchData()
        setSelectedSubmissions(selectedSubmissions.filter(sid => sid !== id))
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete submission')
        console.error('Failed to delete:', error)
      }
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubmissions.length === 0) return
    
    if (confirm(`Apply ${bulkAction} to ${selectedSubmissions.length} submissions?`)) {
      try {
        await Promise.all(selectedSubmissions.map(async (id) => {
          const submission = submissions.find(s => s._id === id)
          if (submission?.type === 'contact') {
            await updateContactStatus(id, bulkAction as ContactStatus)
          } else {
            await updateFeedbackStatus(id, bulkAction)
          }
        }))
        toast.success(`Updated ${selectedSubmissions.length} submissions`)
        setSelectedSubmissions([])
        setBulkAction('')
        fetchData()
      } catch (error: any) {
        toast.error('Bulk action failed')
        console.error('Bulk action failed:', error)
      }
    }
  }

  const handleExport = async () => {
    if (submissions.length === 0) {
      toast.error('No data to export')
      return
    }

    const csvContent = [
      ['ID', 'Type', 'Name', 'Email', 'Phone', 'Rating', 'Category', 'Status', 'Created'],
      ...submissions.map(s => [
        s._id,
        s.type,
        s.name,
        s.email || '',
        s.phone || '',
        s.rating?.toString() || '',
        s.category || '',
        s.status,
        new Date(s.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `submissions-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Exported successfully')
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      read: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Eye },
     
      replied: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Reply },
      spam: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle }
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getRatingIcon = (rating: number) => {
    const icons: Record<number, any> = {
      1: Angry,
      2: Frown,
      3: Meh,
      4: Smile,
      5: ThumbsUp
    }
    const Icon = icons[rating] || Star
    return <Icon className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submissions Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage feedback and contact messages</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved + stats.replied}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved/Replied</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.feedbackCount}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Feedback</h3>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value, page: 1})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            >
              <option value="">All Types</option>
              <option value="feedback">Feedback</option>
              <option value="contact">Contact</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="read">Read</option>
        
              <option value="replied">Replied</option>
              <option value="spam">Spam</option>
            </select>
            
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSubmissions.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {selectedSubmissions.length} submission(s) selected
            </span>
            <div className="flex gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 border border-blue-300 dark:border-blue-700 rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="">Bulk Action</option>
                <option value="read">Mark as Read</option>
            
                <option value="replied">Mark as Replied</option>
                <option value="spam">Mark as Spam</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubmissions(submissions.map(s => s._id))
                        } else {
                          setSelectedSubmissions([])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Name/Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Content</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubmissions([...selectedSubmissions, submission._id])
                          } else {
                            setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission._id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                        submission.type === 'feedback' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {submission.type === 'feedback' ? <Star className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                        {submission.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{submission.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{submission.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md">
                        <div className="text-sm text-gray-900 dark:text-white font-medium truncate">
                          {submission.type === 'feedback' ? submission.feedback : submission.subject}
                        </div>
                        {submission.type === 'contact' && submission.message && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {submission.message.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {submission.type === 'feedback' && submission.rating ? (
                        <div className="flex items-center gap-1">
                          {getRatingIcon(submission.rating)}
                          <span className="text-sm font-medium">{submission.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={submission.status}
                        onChange={(e) => handleStatusUpdate(submission._id, e.target.value)}
                        className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="read">Read</option>
                  
                        <option value="replied">Replied</option>
                        <option value="spam">Spam</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setModalOpen(true)
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(submission._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={filters.page === 1}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={filters.page === pagination.pages}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {modalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submission Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white">{selectedSubmission.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{selectedSubmission.email}</p>
              </div>
              {selectedSubmission.type === 'feedback' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getRatingIcon(selectedSubmission.rating || 0)}
                      <span>{selectedSubmission.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                    <p className="text-gray-900 dark:text-white">{selectedSubmission.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</label>
                    <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Public Display</label>
                    <p className="text-gray-900 dark:text-white">{selectedSubmission.isPublic ? 'Yes' : 'No'}</p>
                  </div>
                </>
              )}
              {selectedSubmission.type === 'contact' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</label>
                    <p className="text-gray-900 dark:text-white">{selectedSubmission.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
                    <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </>
              )}
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-6 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}