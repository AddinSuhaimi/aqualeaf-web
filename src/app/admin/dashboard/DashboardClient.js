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

  const [speciesAction, setSpeciesAction] = useState('add')
  const [speciesList, setSpeciesList] = useState([])
  const [speciesId, setSpeciesId] = useState('')
  const [speciesName, setSpeciesName] = useState('')
  const [phylum, setPhylum] = useState('Red Seaweed')

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

  useEffect(() => {
    fetch('/api/seaweed-species')
      .then(res => res.json())
      .then(data => setSpeciesList(data.rows || []))
      .catch(err => console.error('Failed to fetch species rows', err))
  }, []) // always use []

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

  const handleSpeciesAction = async () => {
  try {
    const payload = {}

    if (speciesAction === 'add') {
      if (!speciesName.trim()) {
        alert('Please enter a species name.')
        return
      }
      payload.action = 'add'
      payload.name = speciesName
      payload.phylum = phylum

    } else if (speciesAction === 'edit') {
      if (!speciesId || !speciesName.trim()) {
        alert('Please select a species and enter a new name.')
        return
      }
      payload.action = 'edit'
      payload.id = speciesId
      payload.name = speciesName
      payload.phylum = phylum

    } else if (speciesAction === 'delete') {
      if (!speciesId) {
        alert('Please select a species to delete.')
        return
      }
      payload.action = 'delete'
      payload.id = speciesId
    }

    const res = await fetch('/api/seaweed-species', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await res.json()
    if (res.ok) {
      alert('Changes applied successfully.')
      setSpeciesId('')
      setSpeciesName('')
      // Refresh updated list
      const updated = await fetch('/api/seaweed-species').then((r) => r.json())
      setSpeciesList(updated.rows || [])
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (err) {
    console.error('Failed to update species:', err)
    alert('Unexpected error occurred.')
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
            

        <div className="bg-white shadow-md rounded-lg p-6 w-full lg:w-1/2">
          <h2 className="text-xl text-charcoal font-semibold mb-4">Manage Seaweed Species</h2>
            <label htmlFor="speciesAction" className="block text-charcoal font-medium mt-4">Action</label>
            <select
              id="speciesAction"
              value={speciesAction}
              onChange={(e) => {
                setSpeciesAction(e.target.value)
                setSpeciesId('')
                setSpeciesName('')
              }}
              className="w-full mt-1 border rounded p-2 text-charcoal"
            >
              <option value="add">Add Row</option>
              <option value="edit">Edit Row</option>
              <option value="delete">Delete Row</option>
            </select>

            {/* ADD ROW */}
            {speciesAction === 'add' && (
              <>
                <label className="block text-charcoal font-medium mt-4">Species Name</label>
                <input
                  type="text"
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  className="w-full text-charcoal mt-1 border rounded p-2"
                  placeholder="e.g., Eucheuma cottonii"
                />

                <label className="block text-charcoal font-medium mt-4">Phylum</label>
                <select
                  value={phylum}
                  onChange={(e) => setPhylum(e.target.value)}
                  className="w-full text-charcoal mt-1 border rounded p-2"
                >
                  <option value="Red Seaweed">Red Seaweed</option>
                  <option value="Brown Seaweed">Brown Seaweed</option>
                  <option value="Green Seaweed">Green Seaweed</option>
                </select>
              </>
            )}

            {/* EDIT ROW */}
            {speciesAction === 'edit' && (
              <>
                <label className="block text-charcoal font-medium mt-4">Select Species ID to Edit</label>
                <select
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                  className="w-full text-charcoal mt-1 border rounded p-2"
                >
                  <option value="">-- Select ID --</option>
                  {speciesList.map((row) => (
                    <option key={row.species_id} value={row.species_id}>
                      ID {row.species_id} – {row.species_name}
                    </option>
                  ))}
                </select>

                <label className="block text-charcoal font-medium mt-4">New Species Name</label>
                <input
                  type="text"
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  className="w-full text-charcoal mt-1 border rounded p-2"
                  placeholder="e.g., Kappaphycus alvarezii"
                />

                <label className="block text-charcoal font-medium mt-4">Phylum</label>
                <select
                  value={phylum}
                  onChange={(e) => setPhylum(e.target.value)}
                  className="w-full text-charcoal mt-1 border rounded p-2"
                >
                  <option value="Red Seaweed">Red Seaweed</option>
                  <option value="Brown Seaweed">Brown Seaweed</option>
                  <option value="Green Seaweed">Green Seaweed</option>
                </select>
              </>
            )}

            {/* DELETE ROW */}
            {speciesAction === 'delete' && (
              <>
                <label className="block text-charcoal font-medium mt-4">Select Species ID to Delete</label>
                <select
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                  className="w-full text-charcoal mt-1 border rounded p-2"
                >
                  <option value="">-- Select ID --</option>
                  {speciesList.map((row) => (
                    <option key={row.species_id} value={row.species_id}>
                      ID {row.species_id} – {row.species_name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* BUTTONS */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleSpeciesAction}
                className="cursor-pointer bg-leaf text-white py-2 px-4 rounded w-1/2 mr-2"
              >
                Apply Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeciesId('')
                  setSpeciesName('')
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