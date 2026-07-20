'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Course, User } from '@/types'

export default function TeacherAssignmentPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [page, search])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch courses
      const coursesResponse = await apiClient.listCourses(page, 10, { search: search || undefined }) as any
      setCourses(coursesResponse.data || [])
      setTotal(coursesResponse.pagination?.total || 0)

      // Fetch teachers
      const teachersResponse = await apiClient.listUsers(1, 100, 'teacher') as any
      setTeachers(teachersResponse.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('[v0] Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTeacher = async () => {
    if (!selectedCourseId || !selectedTeacherId) return

    try {
      setActionLoading(true)
      setError(null)
      await apiClient.updateCourse(selectedCourseId, { instructor_id: selectedTeacherId })
      setSuccess('Teacher assigned successfully')
      setSelectedCourseId(null)
      setSelectedTeacherId('')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to assign teacher: ' + err.message)
      console.error('[v0] Error assigning teacher:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveTeacher = async (courseId: string) => {
    if (!confirm('Remove teacher from this course?')) return

    try {
      setActionLoading(true)
      setError(null)
      await apiClient.updateCourse(courseId, { instructor_id: null })
      setSuccess('Teacher removed successfully')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to remove teacher: ' + err.message)
      console.error('[v0] Error removing teacher:', err)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Teacher Assignment</h1>
        <p className="text-muted-foreground">Manage teacher assignments to courses</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Teacher Assignment Modal */}
      {selectedCourseId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-xl font-bold">Assign Teacher</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Teacher</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select a teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedCourseId(null)}
                className="px-4 py-2 border border-border rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeacher}
                disabled={!selectedTeacherId || actionLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search courses by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Course</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Current Teacher</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No courses found
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.level}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.instructor_id ? (
                        <div>
                          <p className="text-sm font-medium">Assigned</p>
                          <p className="text-xs text-muted-foreground">{course.instructor_id}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-orange-600 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : course.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedCourseId(course._id)
                            setSelectedTeacherId('')
                          }}
                          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          Assign
                        </button>
                        {course.instructor_id && (
                          <button
                            onClick={() => handleRemoveTeacher(course._id)}
                            disabled={actionLoading}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {courses.length} of {total} courses
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={courses.length < 10}
            className="px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
