// app/notifications/page.tsx
"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/lib/auth';
import {
  useUnreadCount,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllRead,
} from '@/lib/notifications';
import { Notification } from '@/types/notification';

import { Bell, CheckCheck, Loader2, Trash2, ChevronRight, BellRing } from 'lucide-react';

const roleNotificationTypeFilter = (opts: { isAdmin: boolean; isSales: boolean }): Notification['type'][] => {
  const { isAdmin, isSales } = opts;

  // Reasonable default mapping based on the backend's Notification['type'] union.
  // Note: we currently fetch without type filter because backend query supports single `type`.
  // This mapping is reserved for future enhancement.
  if (isAdmin) return ['system', 'order', 'payment', 'shipping', 'stock', 'review', 'user'];
  if (isSales) return ['order', 'payment', 'shipping', 'stock', 'review', 'user'];
  return ['user', 'review', 'order', 'payment', 'shipping'];
};

export default function NotificationsPage() {
  const { isLoggedIn, isAdmin, isSales } = useAuth();

  const [page, setPage] = useState(1);
  const limit = 10;

  // Keep mapping for role-based UX (future: pass type param to backend)
  const types = useMemo(
    () => roleNotificationTypeFilter({ isAdmin: !!isAdmin, isSales: !!isSales }),
    [isAdmin, isSales]
  );
  void types;

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data, isLoading, isError, refetch } = useNotifications({ read: undefined, page, limit });
  const unreadQuery = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const { mutateAsync: markAllAsRead, isPending: isMarkAllPending } = useMarkAllAsRead();
  const { mutateAsync: deleteAllRead, isPending: isDeleteAllPending } = useDeleteAllRead();

  const notifications = data?.data?.notifications ?? [];
  const totalCount = data?.data?.pagination?.total ?? 0;
  const unreadCount = unreadQuery.data?.data?.unreadCount ?? 0;
  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      return true;
    }),
    [filter, notifications]
  );

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      await refetch();
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      await refetch();
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Notifications
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Sign in to view your notifications.
          </p>
          <div className="mt-5">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#000063] text-white hover:bg-[#0043b3] transition"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Bell className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Notifications
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {unreadQuery.data?.data?.unreadCount ?? 0} unread
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="inline-flex overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            {['all', 'unread', 'read'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setFilter(tab as 'all' | 'unread' | 'read');
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium transition ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isMarkAllPending || isLoading}
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isMarkAllPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Mark all as read
          </button>

          <button
            type="button"
            disabled={isDeleteAllPending || isLoading}
            onClick={() => deleteAllRead()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition border border-gray-200 dark:border-gray-700"
          >
            {isDeleteAllPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clear read
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading && (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {!isLoading && isError && (
          <div className="p-8">
            <p className="text-red-600 dark:text-red-400">Failed to load notifications.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-200">
                  <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <p>{notifications.length === 0 ? 'No notifications yet.' : 'No notifications match this filter.'}</p>
                </div>
              </div>
            ) : (
              filteredNotifications.map((n) => <NotificationRow key={n._id} n={n} onMarkAsRead={handleMarkAsRead} onDelete={handleDeleteNotification} />)
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">Page {page}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={
              isLoading ||
              (data?.data?.pagination?.pages ? page >= data.data.pagination.pages : false)
            }
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationRow({ n, onMarkAsRead, onDelete }: { n: Notification; onMarkAsRead: (id: string) => void; onDelete: (id: string) => void }) {
  const isUnread = !n.read;
  const actionUrl = n.actionUrl;

  const accent =
    n.type === 'system'
      ? 'from-blue-600 to-cyan-600'
      : n.type === 'payment'
        ? 'from-green-600 to-emerald-600'
        : 'from-blue-600 to-cyan-600';

  return (
    <div
      className={`p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
        isUnread ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${accent}`} />
            <h3
              className={`font-semibold ${
                isUnread
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-800 dark:text-gray-200'
              } truncate`}
            >
              {n.title}
            </h3>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">{n.message}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              {n.type}
            </span>
            <span className="px-2 py-1 rounded-lg bg-transparent text-gray-500 dark:text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </span>

            {n.read ? (
              <span className="px-2 py-1 rounded-lg bg-transparent text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Read
              </span>
            ) : (
              <span className="px-2 py-1 rounded-lg bg-[#0043b3]/10 text-[#0043b3] dark:text-[#009dff] border border-[#0043b3]/20 dark:border-[#009dff]/20 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0043b3] dark:bg-[#009dff]" /> Unread
              </span>
            )}
          </div>
        </div>

        {actionUrl ? (
          <div className="flex items-center gap-2">
            <Link
              href={actionUrl}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              View
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {!n.read && (
              <button
                type="button"
                onClick={() => onMarkAsRead(n._id)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
              >
                <CheckCheck className="w-4 h-4" />
                Mark read
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(n._id)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

