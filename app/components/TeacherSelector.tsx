'use client'

import { useEffect, useState } from 'react'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'

interface TeacherSelectorProps {
  onTeacherSelect: (teacherId: string, teacher: User | null) => void
  selectedTeacherId?: string
  disabled?: boolean
  placeholder?: string
}

export default function TeacherSelector({
  onTeacherSelect,
  selectedTeacherId,
  disabled = false,
  placeholder = 'Select a teacher...',
}: TeacherSelectorProps) {
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.listUsers(1, 100, 'teacher') as any
      setTeachers(response.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load teachers')
      console.error('[v0] Error loading teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (teacherId: string) => {
    const teacher = teachers.find(t => t._id === teacherId) || null
    onTeacherSelect(teacherId, teacher)
  }

  if (loading) {
    return (
      <select disabled className="w-full px-3 py-2 border border-border rounded-lg bg-muted">
        <option>Loading teachers...</option>
      </select>
    )
  }

  return (
    <div className="space-y-1">
      <select
        value={selectedTeacherId || ''}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled || teachers.length === 0}
        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {teachers.map((teacher) => (
          <option key={teacher._id} value={teacher._id}>
            {teacher.name} ({teacher.email})
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {teachers.length === 0 && !loading && (
        <p className="text-xs text-orange-600">No teachers available in the system</p>
      )}
    </div>
  )
}
