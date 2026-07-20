'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Course } from '@/types'
import CourseForm from '@/app/components/CourseForm'
import Link from 'next/link'

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadCourse()
  }, [params.id])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getCourse(params.id) as any
      setCourse(response.data || response)
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to load course' 
      })
      console.error('[v0] Error loading course:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      setSubmitLoading(true)
      setErrors({})
      setMessage(null)

      await apiClient.updateCourse(params.id, data)
      
      setMessage({ type: 'success', text: 'Course updated successfully' })
      setTimeout(() => {
        router.push(`/admin/courses/${params.id}`)
      }, 1500)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update course'
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setMessage({ type: 'error', text: errorMessage })
      }
      
      console.error('[v0] Error updating course:', err)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading course...</div>
  }

  if (!course) {
    return <div className="text-center py-8 text-red-500">Course not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href={`/admin/courses/${params.id}`} className="text-primary hover:text-primary/80 text-sm mb-2 inline-block">
          ← Back to Course
        </Link>
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground mt-2">Update the course details below</p>
      </div>

      {/* Success Message */}
      {message?.type === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {message.text}
        </div>
      )}

      {/* Error Message */}
      {message?.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {message.text}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <CourseForm 
          course={course}
          onSubmit={handleSubmit} 
          loading={submitLoading} 
          errors={errors}
        />
      </div>
    </div>
  )
}
