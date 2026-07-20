'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { Course } from '@/types'
import { UserRole } from '@/types'

export default function StudentDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    progressPercentage: 0,
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.STUDENT)) {
      router.push('/dashboard')
      return
    }

    if (user?.role === UserRole.STUDENT) {
      loadStudentData()
    }
  }, [user, isLoading, router])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?._id) return

      // Fetch enrolled courses
      const response = await apiClient.getStudentCourses(user._id) as any
      const enrolled = response.data || []
      setEnrolledCourses(enrolled)

      // Fetch all courses to show available ones
      const allCoursesResponse = await apiClient.listCourses(1, 50, { status: 'published' }) as any
      const all = allCoursesResponse.data || []
      const enrolledIds = new Set(enrolled.map((c: Course) => c._id))
      const available = all.filter((c: Course) => !enrolledIds.has(c._id))
      setAvailableCourses(available)

      // Calculate stats
      setStats({
        enrolledCourses: enrolled.length,
        completedCourses: 0,
        progressPercentage: 0,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
      console.error('[v0] Error loading student data:', err)
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

  if (!user || user.role !== UserRole.STUDENT) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Manage your learning journey</p>
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
          <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
          <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
          <p className="text-xs text-muted-foreground">Courses you're taking</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold">{stats.completedCourses}</p>
          <p className="text-xs text-muted-foreground">Finished courses</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
          <p className="text-3xl font-bold">{stats.progressPercentage}%</p>
          <p className="text-xs text-muted-foreground">Completion rate</p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">My Enrolled Courses</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You're not enrolled in any courses yet.</p>
            {availableCourses.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Check out the available courses below and enroll to get started!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div
                key={course._id}
                className="flex items-start justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{course.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Instructor: <span className="font-medium">{course.instructor_id || 'TBA'}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Level: <span className="font-medium capitalize">{course.level}</span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 bg-background rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/courses/${course._id}`)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 whitespace-nowrap ml-4"
                >
                  Continue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Available Courses</h2>
          <div className="space-y-4">
            {availableCourses.slice(0, 5).map((course) => (
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
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/courses/${course._id}`)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 whitespace-nowrap ml-4"
                >
                  View
                </button>
              </div>
            ))}
          </div>
          {availableCourses.length > 5 && (
            <button
              onClick={() => router.push('/courses')}
              className="w-full mt-4 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10"
            >
              View All Courses
            </button>
          )}
        </div>
      )}
    </div>
  )
}
