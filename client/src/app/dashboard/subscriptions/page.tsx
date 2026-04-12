// src/app/dashboard/subscriptions/page.tsx
"use client"

import { useState } from 'react'
import { 
  Mail, 
  Send, 
  Users, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  name: string
  subscribedAt: string
  status: 'active' | 'unsubscribed' | 'bounced'
  source: string
  lastOpened?: string
  clickCount: number
}

interface EmailCampaign {
  id: string
  subject: string
  content: string
  sentAt: string
  recipients: number
  opened: number
  clicked: number
  status: 'draft' | 'sent' | 'scheduled'
}

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'send-email' | 'campaigns'>('subscribers')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [sendTo, setSendTo] = useState<'all' | 'selected' | 'active'>('all')
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock data
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      subscribedAt: '2024-01-15T10:30:00Z',
      status: 'active',
      source: 'Website Footer',
      lastOpened: '2024-03-20T14:25:00Z',
      clickCount: 12
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      subscribedAt: '2024-02-01T09:15:00Z',
      status: 'active',
      source: 'Checkout Page',
      lastOpened: '2024-03-19T11:20:00Z',
      clickCount: 8
    },
    {
      id: '3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      subscribedAt: '2024-01-20T14:45:00Z',
      status: 'unsubscribed',
      source: 'Newsletter Popup',
      lastOpened: '2024-02-15T09:30:00Z',
      clickCount: 3
    },
    {
      id: '4',
      email: 'sarah.wilson@example.com',
      name: 'Sarah Wilson',
      subscribedAt: '2024-03-01T11:00:00Z',
      status: 'active',
      source: 'Product Page',
      lastOpened: '2024-03-21T16:45:00Z',
      clickCount: 5
    },
    {
      id: '5',
      email: 'robert.brown@example.com',
      name: 'Robert Brown',
      subscribedAt: '2024-02-15T08:20:00Z',
      status: 'active',
      source: 'Blog Post',
      lastOpened: '2024-03-18T10:15:00Z',
      clickCount: 15
    }
  ])

  const [campaigns] = useState<EmailCampaign[]>([
    {
      id: '1',
      subject: 'Welcome to our newsletter!',
      content: 'Thank you for subscribing...',
      sentAt: '2024-03-15T10:00:00Z',
      recipients: 150,
      opened: 98,
      clicked: 45,
      status: 'sent'
    },
    {
      id: '2',
      subject: 'New Products Just Arrived',
      content: 'Check out our latest collection...',
      sentAt: '2024-03-10T14:30:00Z',
      recipients: 148,
      opened: 112,
      clicked: 67,
      status: 'sent'
    }
  ])

  const stats = {
    total: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    openRate: '68%',
    clickRate: '42%'
  }

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendEmail = () => {
    // Here you would call your API to send emails
    console.log('Sending email:', {
      to: sendTo,
      subject: emailSubject,
      content: emailContent,
      template: selectedTemplate,
      recipients: sendTo === 'all' ? subscribers : 
                  sendTo === 'selected' ? selectedSubscribers : 
                  subscribers.filter(s => s.status === 'active')
    })
    
    setShowComposeModal(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    
    // Reset form
    setEmailSubject('')
    setEmailContent('')
    setSelectedTemplate('default')
    setSendTo('all')
  }

  const handleExportCSV = () => {
    const csv = subscribers.map(sub => ({
      Email: sub.email,
      Name: sub.name,
      'Subscribed Date': new Date(sub.subscribedAt).toLocaleDateString(),
      Status: sub.status,
      Source: sub.source,
      'Last Opened': sub.lastOpened ? new Date(sub.lastOpened).toLocaleDateString() : 'Never',
      'Click Count': sub.clickCount
    }))
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csv[0]).join(",") + "\n" +
      csv.map(row => Object.values(row).join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "subscribers.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteSubscriber = (id: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      setSubscribers(subscribers.filter(s => s.id !== id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([])
    } else {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-slide-down">
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Email campaign sent successfully!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600" />
            Newsletter Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your subscribers and send email campaigns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscribers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unsubscribed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unsubscribed}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openRate}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.clickRate}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'subscribers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab('send-email')}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'send-email'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Send Email
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'campaigns'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Campaign History
            </button>
          </nav>
        </div>

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div>
            {/* Search and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search subscribers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => setShowComposeModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Newsletter
                    </button>
                  </div>
                </div>
              </div>

              {/* Subscribers Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subscriber
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subscribed Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Engagement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.includes(subscriber.id)}
                            onChange={() => handleToggleSelect(subscriber.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{subscriber.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{subscriber.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscriber.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {subscriber.source}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900 dark:text-white">{subscriber.clickCount} clicks</p>
                            {subscriber.lastOpened && (
                              <p className="text-xs text-gray-500">
                                Last opened: {new Date(subscriber.lastOpened).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSubscribers.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No subscribers found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send Email Tab */}
        {activeTab === 'send-email' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Compose Newsletter
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create and send email campaigns to your subscribers
              </p>
            </div>

            <div className="space-y-6">
              {/* Send To Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send To
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="all"
                      checked={sendTo === 'all'}
                      onChange={(e) => setSendTo(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span>All Subscribers ({subscribers.length})</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="active"
                      checked={sendTo === 'active'}
                      onChange={(e) => setSendTo(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span>Active Only ({stats.total})</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="selected"
                      checked={sendTo === 'selected'}
                      onChange={(e) => setSendTo(e.target.value as any)}
                      className="text-blue-600"
                      disabled={selectedSubscribers.length === 0}
                    />
                    <span>Selected ({selectedSubscribers.length})</span>
                  </label>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="default">Default Template</option>
                  <option value="promotional">Promotional</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Email Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Content
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={12}
                  placeholder="Write your email content here..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>

              {/* Preview */}
              {emailContent && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: emailContent }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendEmail}
                  disabled={!emailSubject || !emailContent}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Campaign
                </button>
                <button
                  onClick={() => {
                    setEmailSubject('')
                    setEmailContent('')
                  }}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaign History Tab */}
        {activeTab === 'campaigns' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Email Campaign History
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {campaign.subject}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sent on {new Date(campaign.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'sent' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recipients</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{campaign.recipients}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Opened</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {campaign.opened} ({Math.round((campaign.opened / campaign.recipients) * 100)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Clicked</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {campaign.clicked} ({Math.round((campaign.clicked / campaign.recipients) * 100)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Newsletter</h2>
              <button onClick={() => setShowComposeModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Modal content same as send email tab */}
              <div>
                <label className="block text-sm font-medium mb-1">Send To</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>All Subscribers</option>
                  <option>Active Only</option>
                  <option>Selected ({selectedSubscribers.length})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea rows={8} className="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
              <button onClick={() => setShowComposeModal(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}