'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Course, User } from '@/types'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [teachers, setTeachers] = useState<User[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false)

  useEffect(() => {
    loadCourses()
    loadTeachers()
  }, [page, search, statusFilter])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: Record<string, any> = {}
      if (statusFilter) filters.status = statusFilter
      if (search) filters.search = search
      
      const response = await apiClient.listCourses(page, 10, filters) as any
      setCourses(response.data || [])
      setTotal(response.pagination?.total || 0)
    } catch (err: any) {
      setError(err.message || 'Failed to load courses')
      console.error('[v0] Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTeachers = async () => {
    try {
      const response = await apiClient.listUsers(1, 100, 'teacher') as any
      setTeachers(response.data || [])
    } catch (err: any) {
      console.error('[v0] Error loading teachers:', err)
    }
  }

  const handleAssignTeacher = async () => {
    if (!selectedCourseId || !selectedTeacherId) return
    
    try {
      setIsAssigningTeacher(true)
      await apiClient.updateCourse(selectedCourseId, { instructor_id: selectedTeacherId })
      setSelectedCourseId(null)
      setSelectedTeacherId('')
      loadCourses()
    } catch (err: any) {
      console.error('[v0] Error assigning teacher:', err)
    } finally {
      setIsAssigningTeacher(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={loadCourses}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">Manage all courses in the system</p>
      </div>

      {/* Teacher Assignment Modal */}
      {selectedCourseId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-xl font-bold">Assign Teacher</h2>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedCourseId(null)}
                className="px-4 py-2 border border-border rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeacher}
                disabled={!selectedTeacherId || isAssigningTeacher}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isAssigningTeacher ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title or instructor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No courses found</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-32 flex items-center justify-center">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-primary text-4xl">📚</div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : course.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  } capitalize`}>
                    {course.status}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{course.level}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCourseId(course._id)}
                    className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Assign Teacher
                  </button>
                  <button className="flex-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          ))
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
            className="px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={courses.length < 10}
            className="px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
