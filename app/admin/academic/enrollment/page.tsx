'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Course, User } from '@/types'

export default function StudentEnrollmentPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [enrolledStudents, setEnrolledStudents] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch courses
      const coursesResponse = await apiClient.listCourses(1, 50, {}) as any
      setCourses(coursesResponse.data || [])

      // Fetch students
      const studentsResponse = await apiClient.listUsers(1, 100, 'student') as any
      setStudents(studentsResponse.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('[v0] Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadEnrolledStudents = async (courseId: string) => {
    try {
      const response = await apiClient.getCourseEnrolledStudents(courseId, 1, 100) as any
      const enrolledIds = (response.data || []).map((s: any) => s.user_id || s._id)
      setEnrolledStudents(enrolledIds)
    } catch (err: any) {
      console.error('[v0] Error loading enrolled students:', err)
    }
  }

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    setSelectedStudentIds(new Set())
    if (courseId) {
      loadEnrolledStudents(courseId)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudentIds)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudentIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === students.length && students.length > 0) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(students.map(s => s._id)))
    }
  }

  const handleBulkEnroll = async () => {
    if (!selectedCourseId || selectedStudentIds.size === 0) return

    try {
      setActionLoading(true)
      setError(null)
      const studentIds = Array.from(selectedStudentIds)
      
      for (const studentId of studentIds) {
        try {
          await apiClient.enrollStudent(selectedCourseId, studentId)
        } catch (err: any) {
          // Continue with next student even if one fails
          console.error(`[v0] Failed to enroll student ${studentId}:`, err)
        }
      }

      setSuccess(`Enrolled ${studentIds.length} student(s)`)
      setSelectedStudentIds(new Set())
      loadEnrolledStudents(selectedCourseId)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to enroll students: ' + err.message)
      console.error('[v0] Error enrolling students:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnenroll = async (studentId: string) => {
    if (!selectedCourseId) return
    if (!confirm('Remove student from this course?')) return

    try {
      setActionLoading(true)
      setError(null)
      await apiClient.unenrollStudent(selectedCourseId, studentId)
      setSuccess('Student unenrolled successfully')
      loadEnrolledStudents(selectedCourseId)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to unenroll student: ' + err.message)
      console.error('[v0] Error unenrolling student:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Student Enrollment</h1>
        <p className="text-muted-foreground">Manage student enrollment in courses</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Selector */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Select Course</h2>
          <div className="space-y-2">
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            {selectedCourseId && (
              <div className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                <p>Enrolled: {enrolledStudents.length} student(s)</p>
              </div>
            )}
          </div>
        </div>

        {/* Enrollment List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedCourseId ? 'Enroll Students' : 'Select a course to manage enrollments'}
          </h2>

          {selectedCourseId ? (
            <div className="space-y-4">
              {/* Bulk Enroll */}
              {selectedStudentIds.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedStudentIds.size} student(s) selected</span>
                  <button
                    onClick={handleBulkEnroll}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {actionLoading ? 'Enrolling...' : 'Enroll Selected'}
                  </button>
                </div>
              )}

              {/* Student Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.size === students.length && students.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium flex-1">Select All</label>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No students available</p>
                  ) : (
                    students.map((student) => {
                      const isEnrolled = enrolledStudents.includes(student._id)
                      return (
                        <div
                          key={student._id}
                          className={`flex items-center justify-between p-3 rounded border ${
                            isEnrolled ? 'bg-green-50 border-green-200' : 'bg-muted border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.has(student._id)}
                              onChange={() => toggleStudentSelection(student._id)}
                              disabled={isEnrolled}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                          {isEnrolled && (
                            <div className="flex gap-2">
                              <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">
                                Enrolled
                              </span>
                              <button
                                onClick={() => handleUnenroll(student._id)}
                                disabled={actionLoading}
                                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No course selected</p>
          )}
        </div>
      </div>
    </div>
  )
}
