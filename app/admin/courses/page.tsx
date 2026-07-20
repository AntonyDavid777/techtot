'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Course, User } from '@/types'
import CourseTable from '@/app/components/CourseTable'
import Link from 'next/link'

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [teachers, setTeachers] = useState<User[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false)

  useEffect(() => {
    loadCourses()
    loadTeachers()
  }, [page, search, statusFilter, levelFilter])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: Record<string, any> = {}
      if (statusFilter) filters.status = statusFilter
      if (levelFilter) filters.level = levelFilter
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

  const toggleCourseSelection = (courseId: string) => {
    const newSelected = new Set(selectedCourses)
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId)
    } else {
      newSelected.add(courseId)
    }
    setSelectedCourses(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedCourses.size === courses.length && courses.length > 0) {
      setSelectedCourses(new Set())
    } else {
      setSelectedCourses(new Set(courses.map(c => c._id)))
    }
  }

  const handleBulkPublish = async () => {
    try {
      setActionLoading(true)
      const courseIds = Array.from(selectedCourses)
      for (const courseId of courseIds) {
        await apiClient.publishCourse(courseId)
      }
      setSuccess(`Published ${courseIds.length} course(s)`)
      setSelectedCourses(new Set())
      loadCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to publish courses: ' + err.message)
      console.error('[v0] Error publishing courses:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkArchive = async () => {
    try {
      setActionLoading(true)
      const courseIds = Array.from(selectedCourses)
      for (const courseId of courseIds) {
        await apiClient.archiveCourse(courseId)
      }
      setSuccess(`Archived ${courseIds.length} course(s)`)
      setSelectedCourses(new Set())
      loadCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to archive courses: ' + err.message)
      console.error('[v0] Error archiving courses:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssignTeacher = async () => {
    if (!selectedCourseId || !selectedTeacherId) return
    
    try {
      setIsAssigningTeacher(true)
      await apiClient.updateCourse(selectedCourseId, { instructor_id: selectedTeacherId })
      setSelectedCourseId(null)
      setSelectedTeacherId('')
      setSuccess('Teacher assigned successfully')
      loadCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to assign teacher: ' + err.message)
      console.error('[v0] Error assigning teacher:', err)
    } finally {
      setIsAssigningTeacher(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    try {
      setActionLoading(true)
      await apiClient.deleteCourse(courseId)
      setSuccess('Course deleted successfully')
      loadCourses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to delete course: ' + err.message)
      console.error('[v0] Error deleting course:', err)
    } finally {
      setActionLoading(false)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Manage all courses in the system</p>
        </div>
        <Link
          href="/admin/courses/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          Create Course
        </Link>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCourses.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="font-medium text-blue-900">{selectedCourses.size} course(s) selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkPublish}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Processing...' : 'Publish'}
            </button>
            <button
              onClick={handleBulkArchive}
              disabled={actionLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Processing...' : 'Archive'}
            </button>
          </div>
        </div>
      )}

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
          <div className="bg-card rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title..."
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
          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <CourseTable
            courses={courses}
            selectedCourses={selectedCourses}
            onSelectCourse={toggleCourseSelection}
            onSelectAll={toggleSelectAll}
            onView={(courseId) => router.push(`/admin/courses/${courseId}`)}
            onEdit={(courseId) => router.push(`/admin/courses/${courseId}/edit`)}
            onDelete={handleDeleteCourse}
            loading={actionLoading}
          />
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
