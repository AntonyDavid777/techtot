'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import CourseForm from '@/app/components/CourseForm'
import Link from 'next/link'

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true)
      setErrors({})
      setMessage(null)

      await apiClient.createCourse(data)
      
      setMessage({ type: 'success', text: 'Course created successfully' })
      setTimeout(() => {
        router.push('/admin/courses')
      }, 1500)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create course'
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setMessage({ type: 'error', text: errorMessage })
      }
      
      console.error('[v0] Error creating course:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/courses" className="text-primary hover:text-primary/80 text-sm mb-2 inline-block">
          ← Back to Courses
        </Link>
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-2">Fill in the course details below to create a new course</p>
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
          onSubmit={handleSubmit} 
          loading={loading} 
          errors={errors}
        />
      </div>
    </div>
  )
}
