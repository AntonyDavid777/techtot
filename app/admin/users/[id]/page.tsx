'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { User } from '@/types'
import Link from 'next/link'

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)

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

  const handleToggleActive = async () => {
    try {
      await apiClient.updateUser(userId, { is_active: !user?.is_active })
      setUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null)
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
      console.error('[v0] Error updating user:', err)
    }
  }

  const handleResetPassword = async () => {
    try {
      if (!newPassword) {
        setPasswordError('Password is required')
        return
      }
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters')
        return
      }
      
      setResetting(true)
      await apiClient.post(`/users/${userId}/reset-password`, { new_password: newPassword })
      setNewPassword('')
      setShowResetModal(false)
      setError(null)
      // Show success message (can be improved with toast notification)
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to reset password')
      console.error('[v0] Error resetting password:', err)
    } finally {
      setResetting(false)
    }
  }

  const handleChangeRole = async () => {
    const newRole = window.prompt('Enter new role (student/teacher/admin):', user?.role)
    if (newRole && ['student', 'teacher', 'admin'].includes(newRole)) {
      try {
        await apiClient.updateUser(userId, { role: newRole })
        setUser(prev => prev ? { ...prev, role: newRole } : null)
      } catch (err: any) {
        setError(err.message || 'Failed to update role')
        console.error('[v0] Error updating role:', err)
      }
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
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Information Card */}
        <div className="md:col-span-2 bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-base">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-base">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                <dd className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                  <button
                    onClick={handleChangeRole}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Change
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={handleToggleActive}
                    className={`text-xs font-medium px-2 py-1 rounded hover:opacity-80 ${
                      user.is_active
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Joined</dt>
                <dd className="text-base">{new Date(user.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-base">{new Date(user.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm"
            >
              Reset Password
            </button>
            <Link
              href={`/admin/users/${userId}/edit`}
              className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted font-medium text-sm text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold">Reset Password</h3>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setPasswordError(null)
                }}
                placeholder="Enter new password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  passwordError ? 'border-red-500' : 'border-border'
                }`}
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResetModal(false)
                  setNewPassword('')
                  setPasswordError(null)
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {resetting ? 'Processing...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
