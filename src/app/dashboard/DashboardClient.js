'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardClient({ user }) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    species: '',
    quality: '',
  })

  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Image src="/aqualeaf-logo.png" alt="Logo" width={32} height={32} />
          <nav className="space-x-4 text-sm text-gray-700">
            <a href="#" className="hover:underline">Latest Updates</a>
            <a href="#" className="hover:underline">Seaweed Information</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
        <button onClick={handleLogout} className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow">
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Farm Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-semibold">{user.farm_name}</h2>
            <p className="text-gray-600">Kampung Laut, Jalan Percubaan, Malaysia</p>
            <details className="mt-2 border rounded p-3 bg-white shadow-sm">
              <summary className="font-medium cursor-pointer">Info</summary>
              <p className="text-sm mt-2">Brief information about the farm, seaweed types, etc. if needed.</p>
            </details>
          </div>
        </div>

        {/* Report Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Filters */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-1">Generate Report</h3>
            <p className="text-sm text-gray-500 mb-4">Data Filters</p>
            <div className="space-y-4">
              {/* Date Range Picker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Other dropdowns */}
              <label htmlFor="speciesDropdown">Filter by Seaweed Species</label>
                <select id="speciesDropdown" className="w-full border rounded px-3 py-2">
                  <option value="None">Do not filter</option>
                  <option value="Gracilaria">Gracilaria</option>
                  <option value="Eucheuma">Eucheuma</option>
                </select>
              <label htmlFor="qualityDropdown">Filter by Quality Status</label>
                <select id="qualityDropdown" className="w-full border rounded px-3 py-2">
                  <option value="None">Do not filter</option>
                  <option value="Good">Good</option>
                  <option value="Bad">Bad</option>
                </select>

              {/* Generate button */}
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
                Generate
              </button>

            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Preview Data</h3>
            <table className="w-full text-sm text-left">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="pb-2">Species</th>
                  <th className="pb-2">Quality</th>
                  <th className="pb-2">Impurity</th>
                  <th className="pb-2">Discoloration</th>
                  <th className="pb-2">Scan Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    species: 'Gracilaria',
                    phylum: 'Red Seaweed',
                    quality: 'Good',
                    impurity: '2',
                    discoloration: '11',
                    timestamp: '2025-06-03 14:01:54',
                  },
                  {
                    species: 'Gracilaria',
                    phylum: 'Red Seaweed',
                    quality: 'Good',
                    impurity: '5',
                    discoloration: '1',
                    timestamp: '2025-06-03 14:02:31',
                  },
                  {
                    species: 'Gracilaria',
                    phylum: 'Red Seaweed',
                    quality: 'Bad',
                    impurity: '14',
                    discoloration: '21',
                    timestamp: '2025-06-03 14:03:07',
                  },
                  {
                    species: 'Gracilaria',
                    phylum: 'Red Seaweed',
                    quality: 'Good',
                    impurity: '3',
                    discoloration: '13',
                    timestamp: '2025-06-03 14:03:50',
                  },
                ].map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">
                      <div className="font-medium">{item.species}</div>
                      <div className="text-gray-500 text-xs">{item.phylum}</div>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.quality === 'Good' ? 'bg-green-100 text-green-600' :
                        'bg-red-200 text-red-600'
                      }`}>
                        {item.quality}
                      </span>
                    </td>
                    <td className="py-2">{item.impurity}%</td>
                    <td className="py-2">{item.discoloration}%</td>
                    <td className="py-2">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
