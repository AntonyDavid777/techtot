'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { Course } from '@/types'
import { UserRole } from '@/types'

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeStudents: 0,
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.TEACHER)) {
      router.push('/dashboard')
      return
    }

    if (user?.role === UserRole.TEACHER) {
      loadTeacherData()
    }
  }, [user, isLoading, router])

  const loadTeacherData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?._id) return

      // Fetch teacher's courses
      const response = await apiClient.getTeacherCourses(user._id, 1, 20) as any
      const teacherCourses = response.data || []
      setCourses(teacherCourses)

      // Calculate stats
      let totalStudents = 0
      for (const course of teacherCourses) {
        totalStudents += course.enrolled_count || 0
      }

      setStats({
        totalCourses: teacherCourses.length,
        totalStudents,
        activeStudents: teacherCourses.filter(c => c.status === 'published').length,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
      console.error('[v0] Error loading teacher data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== UserRole.TEACHER) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Here's an overview of your teaching activities</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">My Courses</p>
          <p className="text-3xl font-bold">{stats.totalCourses}</p>
          <p className="text-xs text-muted-foreground">Total assigned courses</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Students</p>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
          <p className="text-xs text-muted-foreground">Across all courses</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
          <p className="text-3xl font-bold">{stats.activeStudents}</p>
          <p className="text-xs text-muted-foreground">Published courses</p>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">My Courses</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You have no courses assigned yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Contact an administrator to get courses assigned.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="flex items-start justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{course.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Level: <span className="font-medium capitalize">{course.level}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Students: <span className="font-medium">{course.enrolled_count || 0}</span>
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : course.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/courses/${course._id}`)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 whitespace-nowrap ml-4"
                >
                  View Course
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
