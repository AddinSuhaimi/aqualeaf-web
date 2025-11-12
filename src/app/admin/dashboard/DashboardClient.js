// app/dashboard/DashboardClient.js
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardClient({ admin }) {

  const [action, setAction] = useState('add')
  const [columnName, setColumnName] = useState('')
  const [dataType, setDataType] = useState('')
  const [constraints, setConstraints] = useState('')
  const [editType, setEditType] = useState('name') // 'name' or 'dataType'
  const [newValue, setNewValue] = useState('')
  const [availableColumns, setAvailableColumns] = useState([]) // loaded from /api/columns

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

  useEffect(() => {
    if (action !== 'add') {
      fetch('/api/columns?table=scan_report')
        .then((res) => res.json())
        .then((data) => {
          setAvailableColumns(data.columns || [])
        })
        .catch((err) => {
          console.error('Error fetching columns:', err)
        })
    }
  }, [action])

  const handleApplyChanges = async () => {
    try {
      // Base payload with action
      const payload = { action }

      // === ADD PARAMETER ===
      if (action === 'add') {
        if (!columnName || !dataType) {
          alert('Please enter a column name and select a data type.')
          return
        }

        payload.columnName = columnName
        payload.dataType = dataType
        if (constraints) payload.constraints = constraints

      // === EDIT PARAMETER ===
      } else if (action === 'edit') {
        if (!columnName || !editType || !newValue) {
          alert('Please complete all fields for editing.')
          return
        }

        payload.columnName = columnName
        payload.editType = editType
        payload.newValue = newValue

      // === DELETE PARAMETER ===
      } else if (action === 'delete') {
        if (!columnName) {
          alert('Please select a column to delete.')
          return
        }

        const protectedColumns = ['id', 'date_scanned', 'quality']
        if (protectedColumns.includes(columnName)) {
          alert(`"${columnName}" is a protected column and cannot be deleted.`)
          return
        }

        payload.columnName = columnName
      }

      // Send POST request to /api/configure
      const res = await fetch('/api/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (res.ok) {
        alert('Table updated successfully.')
        // Optional: reload column list after successful change
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (err) {
      console.error('Failed to apply changes:', err)
      alert('Unexpected error occurred while applying changes.')
    }
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

      <div className="flex flex-col lg:flex-row gap-6">
           
        <div className="bg-white shadow-md rounded-lg p-6 w-full lg:w-1/2">
          <h2 className="text-xl text-charcoal font-semibold mb-4">Configure Scan Report Parameters</h2>
          
          {/* SCAN REPORTS TABLE CONFIGURATION */}
          <label htmlFor="action" className="block text-charcoal font-medium mt-4">Action</label>
          <select
            id="action"
            value={action}
            onChange={(e) => {
              setAction(e.target.value)
              setColumnName('')
              setDataType('')
              setConstraints('')
              setEditType('name')
              setNewValue('')
            }}
            className="w-full mt-1 border rounded p-2 text-charcoal"
          >
            <option value="add">Add Parameter</option>
            <option value="edit">Edit Parameter</option>
            <option value="delete">Delete Parameter</option>
          </select>

          {/* ADD PARAMETER */}
          {action === 'add' && (
            <>
              <label className="block text-charcoal font-medium mt-4">Column Name</label>
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full text-charcoal mt-1 border rounded p-2"
                placeholder="e.g., new_column"
              />

              <label className="block text-charcoal font-medium mt-4">Data Type</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full text-charcoal mt-1 border rounded p-2"
              >
                <option value="">-- Select Data Type --</option>
                <option value="VARCHAR(255)">VARCHAR(255)</option>
                <option value="INT">INT</option>
                <option value="DATE">DATE</option>
                <option value="BOOLEAN">BOOLEAN</option>
              </select>

              <label className="block text-charcoal font-medium mt-4">Additional Constraints (optional)</label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="w-full text-charcoal mt-1 border rounded p-2"
                placeholder="e.g., NOT NULL, UNIQUE"
              />
            </>
          )}

          {/* EDIT PARAMETER */}
          {action === 'edit' && (
            <>
              <label className="block text-charcoal font-medium mt-4">Select Column to Edit</label>
              <select
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full text-charcoal mt-1 border rounded p-2"
              >
                <option value="">-- Select Column --</option>
                {availableColumns.map((col) => (
                  <option key={col.COLUMN_NAME} value={col.COLUMN_NAME}>
                    {col.COLUMN_NAME}
                  </option>
                ))}
              </select>

              <label className="block text-charcoal font-medium mt-4">Edit Type</label>
              <select
                value={editType}
                onChange={(e) => {
                  setEditType(e.target.value)
                  setNewValue('')
                }}
                className="w-full text-charcoal mt-1 border rounded p-2"
              >
                <option value="name">Rename Column</option>
                <option value="dataType">Change Data Type</option>
              </select>

              {editType === 'name' && (
                <>
                  <label className="block text-charcoal font-medium mt-4">New Column Name</label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full text-charcoal mt-1 border rounded p-2"
                    placeholder="e.g., renamed_column"
                  />
                </>
              )}

              {editType === 'dataType' && (
                <>
                  <label className="block text-charcoal font-medium mt-4">New Data Type</label>
                  <select
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full text-charcoal mt-1 border rounded p-2"
                  >
                    <option value="">-- Select New Data Type --</option>
                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                    <option value="INT">INT</option>
                    <option value="DATE">DATE</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                  </select>
                </>
              )}
            </>
          )}

          {/* DELETE PARAMETER */}
          {action === 'delete' && (
            <>
              <label className="block text-charcoal font-medium mt-4">Select Column to Delete</label>
              <select
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full text-charcoal mt-1 border rounded p-2"
              >
                <option value="">-- Select Column --</option>
                {availableColumns.map((col) => (
                  <option key={col.COLUMN_NAME} value={col.COLUMN_NAME}>
                    {col.COLUMN_NAME}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* === FORM ACTION BUTTONS === */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleApplyChanges}
              className="cursor-pointer bg-leaf text-white py-2 px-4 rounded w-1/2 mr-2"
            >
              Apply Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setColumnName('')
                setDataType('')
                setConstraints('')
                setEditType('name')
                setNewValue('')
              }}
              className="cursor-pointer bg-danger text-white py-2 px-4 rounded w-1/2 ml-2"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}