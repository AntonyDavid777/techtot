'use client'

import { useState } from 'react'

export default function AdminBannedPage() {
  const [bannedUsers] = useState([
    { id: 1, name: 'User123', email: 'user123@example.com', reason: 'Inappropriate content', bannedAt: '2024-01-10' },
    { id: 2, name: 'TestUser', email: 'test@example.com', reason: 'Spamming', bannedAt: '2024-01-12' },
    { id: 3, name: 'BadActor', email: 'bad@example.com', reason: 'Harassment', bannedAt: '2024-01-14' },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Banned Users</h1>
        <p className="text-muted-foreground">Manage banned user accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Banned</p>
          <p className="text-3xl font-bold">{bannedUsers.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">This Month</p>
          <p className="text-3xl font-bold">2</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Appeal Pending</p>
          <p className="text-3xl font-bold">1</p>
        </div>
      </div>

      {/* Banned Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Username</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Reason</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Banned Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bannedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.reason}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(user.bannedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Details</button>
                    <button className="text-green-600 hover:text-green-800 font-medium">Unban</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban New User */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Ban New User</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">User Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <textarea
              placeholder="Reason for ban..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
            />
          </div>
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
            Ban User
          </button>
        </div>
      </div>
    </div>
  )
}
