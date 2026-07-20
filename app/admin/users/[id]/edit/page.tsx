'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { User } from '@/types'
import { UserForm } from '@/app/components/UserForm'
import Link from 'next/link'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getUser(userId) as any
      setUser(response.data?.user)
    } catch (err: any) {
      setError(err.message || 'Failed to load user')
      console.error('[v0] Error loading user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      await apiClient.updateUser(userId, data)
      
      setSubmitSuccess('User updated successfully!')
      setTimeout(() => {
        router.push(`/admin/users/${userId}`)
      }, 1500)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update user')
      console.error('[v0] Error updating user:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">{error}</p>
          <Link
            href="/admin/users"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">Update {user.name}&apos;s information</p>
        </div>
        <Link
          href={`/admin/users/${userId}`}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
        >
          Back to Details
        </Link>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{submitError}</p>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{submitSuccess}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <UserForm 
          user={user} 
          onSubmit={handleSubmit} 
          loading={isSubmitting}
          isCreating={false}
        />
      </div>
    </div>
  )
}
