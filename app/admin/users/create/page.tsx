'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { UserForm } from '@/app/components/UserForm'
import Link from 'next/link'

export default function CreateUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      
      await apiClient.post('/users/admin/create', data)
      
      setSuccessMessage('User created successfully!')
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
      console.error('[v0] Error creating user:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
        <Link
          href="/admin/users"
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
        >
          Back to Users
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <UserForm onSubmit={handleSubmit} loading={loading} isCreating={true} />
      </div>
    </div>
  )
}
