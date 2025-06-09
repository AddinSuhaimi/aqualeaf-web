// app/dashboard/DashboardClient.js
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardClient({ admin }) {
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

  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.replace('/')
  }

  return (
  <div className="bg-gray-100 min-h-screen">
    <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-4">
        <Image src="/aqualeaf-logo.png" alt="Logo" width={32} height={32} />
        <div className="text-sm text-charcoal font-bold">LOGGED IN AS ADMINISTRATOR</div>
      </div>
      <button onClick={handleLogout} className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow">
        Sign Out
      </button>
    </header>

    <div className="p-6">
      <h1 className="text-2xl text-charcoal font-semibold mb-6">
        Welcome back, {admin.username}!
      </h1>

      <div className="flex flex-col lg:flex-row justify-around gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 w-full lg:w-1/2">
          <h2 className="text-xl text-charcoal font-semibold mb-4">Configure Table Parameters</h2>

          <label htmlFor="table" className="block text-charcoal font-medium mt-4">Select Table</label>
          <select id="table" className="w-full text-charcoal mt-1 border rounded p-2">
            <option>Scan Reports</option>
          </select>

          <label htmlFor="action" className="block text-charcoal font-medium mt-4">Action</label>
          <select id="action" className="w-full text-charcoal mt-1 border rounded p-2">
            <option>Add Parameters</option>
          </select>

          <label htmlFor="column-name" className="block text-charcoal font-medium mt-4">Column Name</label>
          <input type="text" id="column-name" placeholder="Value" className="w-full text-charcoal mt-1 border rounded p-2" />

          <label htmlFor="data-type" className="block text-charcoal font-medium mt-4">Data Type</label>
          <input type="text" id="data-type" placeholder="Value" className="w-full text-charcoal mt-1 border rounded p-2" />

          <button className="cursor-pointer w-full bg-ocean text-white mt-6 py-2 rounded">Preview</button>

          <div className="flex justify-between mt-6">
            <button className="cursor-pointer bg-leaf text-white py-2 px-4 rounded w-1/2 mr-2">Apply Changes</button>
            <button className="cursor-pointer bg-danger text-white py-2 px-4 rounded w-1/2 ml-2">Discard Changes</button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
            <h3 className="text-lg text-charcoal font-semibold mb-4">Preview Data</h3>
            <table className="w-full text-charcoal text-sm text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-2 border">Customer</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Rate</th>
                  <th className="p-2 border">Balance</th>
                  <th className="p-2 border">Deposit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border">
                  <td className="p-2 border">Ralph Edwards<br /><span className="text-xs text-gray-500">(405) 555-0128</span></td>
                  <td className="p-2 border"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Open</span></td>
                  <td className="p-2 border">$78.00 USD</td>
                  <td className="p-2 border">-$105.55 USD</td>
                  <td className="p-2 border">$293.01 USD</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">Floyd Miles<br /><span className="text-xs text-gray-500">(404) 555-0103</span></td>
                  <td className="p-2 border"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Paid</span></td>
                  <td className="p-2 border">$40.00 USD</td>
                  <td className="p-2 border">$273.43 USD</td>
                  <td className="p-2 border">$710.68 USD</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">Dorlese Robertson<br /><span className="text-xs text-gray-500">(808) 555-0111</span></td>
                  <td className="p-2 border"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Open</span></td>
                  <td className="p-2 border">$77.00 USD</td>
                  <td className="p-2 border">-$778.35 USD</td>
                  <td className="p-2 border">$169.43 USD</td>
                </tr>
                <tr className="border">
                  <td className="p-2 border">Albert Flores<br /><span className="text-xs text-gray-500">(318) 555-0116</span></td>
                  <td className="p-2 border"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Inactive</span></td>
                  <td className="p-2 border">$85.00 USD</td>
                  <td className="p-2 border">$924.41 USD</td>
                  <td className="p-2 border">$779.58 USD</td>
                </tr>
              </tbody>
            </table>
          
        </div>
      </div>
    </div>
  </div>
)
}