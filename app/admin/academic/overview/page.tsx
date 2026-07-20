'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Course, User } from '@/types'

export default function AcademicOverviewPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalTeachers: 0,
    avgStudentsPerCourse: 0,
    teacherUtilization: 0,
  })

  useEffect(() => {
    loadOverviewData()
  }, [])

  const loadOverviewData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all courses
      const coursesResponse = await apiClient.listCourses(1, 100, {}) as any
      const allCourses = coursesResponse.data || []
      setCourses(allCourses)

      // Fetch all teachers
      const teachersResponse = await apiClient.listUsers(1, 100, 'teacher') as any
      const allTeachers = teachersResponse.data || []
      setTeachers(allTeachers)

      // Calculate stats
      const totalCourses = allCourses.length
      const coursesWithTeachers = allCourses.filter(c => c.instructor_id).length
      const totalTeachers = allTeachers.length

      setStats({
        totalCourses,
        totalTeachers,
        avgStudentsPerCourse: totalCourses > 0 ? Math.round(allCourses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0) / totalCourses) : 0,
        teacherUtilization: totalTeachers > 0 ? Math.round((coursesWithTeachers / totalTeachers) * 100) : 0,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data')
      console.error('[v0] Error loading overview:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading overview data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Academic Overview</h1>
        <p className="text-muted-foreground">System-wide academic statistics and insights</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
          <p className="text-3xl font-bold">{stats.totalCourses}</p>
          <p className="text-xs text-muted-foreground">Across all statuses</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
          <p className="text-3xl font-bold">{stats.totalTeachers}</p>
          <p className="text-xs text-muted-foreground">Active instructors</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Avg Students/Course</p>
          <p className="text-3xl font-bold">{stats.avgStudentsPerCourse}</p>
          <p className="text-xs text-muted-foreground">Average enrollment</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Teacher Utilization</p>
          <p className="text-3xl font-bold">{stats.teacherUtilization}%</p>
          <p className="text-xs text-muted-foreground">With assigned courses</p>
        </div>
      </div>

      {/* Courses Without Teachers */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Courses Without Teachers ({courses.filter(c => !c.instructor_id).length})</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {courses.filter(c => !c.instructor_id).length === 0 ? (
            <p className="text-muted-foreground text-sm">All courses have teachers assigned.</p>
          ) : (
            courses
              .filter(c => !c.instructor_id)
              .map(course => (
                <div key={course._id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">{course.level}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Teacher Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Teacher Course Distribution</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {teachers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No teachers in system.</p>
          ) : (
            teachers.map(teacher => {
              const teacherCourses = courses.filter(c => c.instructor_id === teacher._id)
              return (
                <div key={teacher._id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <p className="text-sm font-semibold">{teacherCourses.length} course(s)</p>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
