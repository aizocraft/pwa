'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardSalesRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/sales')
  }, [router])
  
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to sales dashboard...</p>
      </div>
    </div>
  )
}