// app/dashboard/DashboardClient.js
'use client'

import { useEffect } from 'react'

export default function DashboardClient({ user }) {
  useEffect(() => {
    function onPageShow(event) {
      // if page is coming from BFCache
      if (event.persisted) {
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Welcome back, {user.farm_name}!
      </h1>
      {/* …rest of dashboard… */}
    </div>
  )
}