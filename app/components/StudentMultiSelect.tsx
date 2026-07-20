'use client'

import { useEffect, useState } from 'react'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'

interface StudentMultiSelectProps {
  onStudentsSelect: (studentIds: string[]) => void
  selectedStudentIds?: string[]
  excludeStudentIds?: string[]
  maxHeight?: string
}

export default function StudentMultiSelect({
  onStudentsSelect,
  selectedStudentIds = [],
  excludeStudentIds = [],
  maxHeight = '300px',
}: StudentMultiSelectProps) {
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedStudentIds))
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    setSelected(new Set(selectedStudentIds))
  }, [selectedStudentIds])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.listUsers(1, 100, 'student') as any
      const filteredStudents = (response.data || []).filter(
        (s: User) => !excludeStudentIds.includes(s._id)
      )
      setStudents(filteredStudents)
    } catch (err: any) {
      setError(err.message || 'Failed to load students')
      console.error('[v0] Error loading students:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelected(newSelected)
    onStudentsSelect(Array.from(newSelected))
  }

  const toggleSelectAll = () => {
    if (selected.size === students.length && students.length > 0) {
      setSelected(new Set())
      onStudentsSelect([])
    } else {
      const allIds = new Set(students.map(s => s._id))
      setSelected(allIds)
      onStudentsSelect(Array.from(allIds))
    }
  }

  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading students...
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-2 border-b border-border focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Select All */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2 hover:bg-muted">
        <input
          type="checkbox"
          id="select-all"
          checked={selected.size === students.length && students.length > 0}
          onChange={toggleSelectAll}
          className="w-4 h-4"
        />
        <label htmlFor="select-all" className="flex-1 text-sm font-medium cursor-pointer">
          Select All
        </label>
        <span className="text-xs text-muted-foreground">
          {selected.size} / {students.length}
        </span>
      </div>

      {/* Student List */}
      <div style={{ maxHeight }} className="overflow-y-auto">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
        )}
        {filteredStudents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {students.length === 0 ? 'No students available' : 'No matching students'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="px-4 py-3 flex items-center gap-2 hover:bg-muted cursor-pointer"
                onClick={() => toggleStudent(student._id)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(student._id)}
                  onChange={() => toggleStudent(student._id)}
                  className="w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
