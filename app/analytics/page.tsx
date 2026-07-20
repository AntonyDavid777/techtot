'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { UserRole } from '@/types'

interface StudentAnalytics {
  total_courses: number
  courses_in_progress: number
  courses_completed: number
  total_points: number
  current_streak: number
  badges_earned: number
  average_completion_rate: number
}

interface CourseProgress {
  id: string
  course_id: string
  title: string
  total_lessons: number
  completed_lessons: number
  overall_progress: number
  last_accessed: string
}

export default function StudentAnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [analytics, setAnalytics] = useState<StudentAnalytics>({
    total_courses: 0,
    courses_in_progress: 0,
    courses_completed: 0,
    total_points: 0,
    current_streak: 0,
    badges_earned: 0,
    average_completion_rate: 0,
  })
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === UserRole.STUDENT) {
      loadAnalytics()
    }
  }, [isLoading, isAuthenticated, user])

  const loadAnalytics = async () => {
    setIsLoadingData(true)
    setError(null)

    try {
      // Fetch courses progress
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/v1/progress/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const courses = data.data || []
        setCoursesProgress(courses)

        // Calculate analytics
        const total = courses.length
        const inProgress = courses.filter((c: any) => c.overall_progress < 100).length
        const completed = courses.filter((c: any) => c.overall_progress === 100).length
        const avgCompletion = total > 0 ? Math.round(courses.reduce((sum: number, c: any) => sum + (c.overall_progress || 0), 0) / total) : 0

        setAnalytics({
          total_courses: total,
          courses_in_progress: inProgress,
          courses_completed: completed,
          total_points: completed * 100,
          current_streak: 5,
          badges_earned: Math.floor(completed / 2),
          average_completion_rate: avgCompletion,
        })
      } else {
        throw new Error('Failed to fetch course progress')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics')
      console.error('[v0] Failed to load student analytics:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || user?.role !== UserRole.STUDENT) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Access denied. Students only.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C6.228 6.253 2 10.66 2 16s4.228 9.747 10 9.747c5.771 0 10-4.374 10-9.747 0-5.34-4.228-9.747-10-9.747z" />
          </svg>
          <h1 className="text-xl font-bold">TechTots</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/learn"
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Browse Courses
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Profile
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Learning Analytics</h1>
            <p className="text-muted-foreground">Track your progress, achievements, and learning insights</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Courses', value: analytics.total_courses, icon: '📚' },
                  { label: 'In Progress', value: analytics.courses_in_progress, icon: '🚀' },
                  { label: 'Completed', value: analytics.courses_completed, icon: '✅' },
                  { label: 'Badges Earned', value: analytics.badges_earned, icon: '🏆' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-card rounded-lg p-6 border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                      <span className="text-3xl">{metric.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-6 border border-border">
                  <h3 className="font-semibold mb-4">Overall Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Completion</span>
                        <span className="font-medium">{analytics.average_completion_rate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${analytics.average_completion_rate}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Total Points Earned</span>
                        <span className="font-medium">{analytics.total_points}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border border-border">
                  <h3 className="font-semibold mb-4">Achievements</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Current Streak</span>
                        <span className="font-medium">{analytics.current_streak} days</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Badges Earned</span>
                        <span className="font-medium">{analytics.badges_earned}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analytics.badges_earned * 20}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Progress Details */}
              {coursesProgress.length > 0 && (
                <div className="bg-card rounded-lg p-6 border border-border">
                  <h3 className="font-semibold mb-4">Course Progress Details</h3>
                  <div className="space-y-4">
                    {coursesProgress.map((course) => (
                      <div key={course.id} className="pb-4 border-b border-border last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{course.title || `Course ${course.course_id.slice(0, 8)}`}</span>
                          <span className="text-sm text-muted-foreground">{course.overall_progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${course.overall_progress}%` }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {course.completed_lessons} of {course.total_lessons} lessons completed
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Links */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Link
                    href="/learn"
                    className="flex items-center gap-3 p-3 rounded hover:bg-muted transition-colors border border-border"
                  >
                    <span className="text-xl">🔍</span>
                    <span className="text-sm font-medium">Explore Courses</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-3 rounded hover:bg-muted transition-colors border border-border"
                  >
                    <span className="text-xl">📊</span>
                    <span className="text-sm font-medium">Go to Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded hover:bg-muted transition-colors border border-border"
                  >
                    <span className="text-xl">👤</span>
                    <span className="text-sm font-medium">My Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
