
// app/dashboard/notifications/page.tsx

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FiBell, FiX } from 'react-icons/fi'    

const NotificationsPage = () => {
    const router = useRouter()
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'New order received', read: false },
        { id: 2, message: 'Stock running low on item #123', read: false },
        { id: 3, message: 'New customer registered', read: true },
    ])

    const markNotificationAsRead = (notificationId: number) => {
        const updatedNotifications = notifications.map((notification) => {
            if (notification.id === notificationId) {
                return { ...notification, read: true }
            }
            return notification
        })
        setNotifications(updatedNotifications)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            {notifications.length === 0 ? (
                <p className="text-gray-500">No notifications found.</p>
            ) : (
                notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-4 mb-4 rounded-lg shadow-lg ${
                            notification.read ? 'bg-gray-100' : 'bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FiBell className="w-6 h-6 mr-2" /> {notification.message}
                            </div>
                            {!notification.read && (
                                <button
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    Mark as Read
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}       

export default NotificationsPage
