'use client'

import { useState } from 'react'

export default function AdminReviewsPage() {
  const [reviews] = useState([
    { id: 1, course: 'React Basics', user: 'John Doe', rating: 5, status: 'approved' },
    { id: 2, course: 'JavaScript Advanced', user: 'Jane Smith', rating: 4, status: 'pending' },
    { id: 3, course: 'Web Design', user: 'Bob Wilson', rating: 3, status: 'flagged' },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Reviews</h1>
        <p className="text-muted-foreground">Moderate and approve user content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending Reviews</p>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Approved</p>
          <p className="text-3xl font-bold">234</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Flagged</p>
          <p className="text-3xl font-bold">5</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Rejected</p>
          <p className="text-3xl font-bold">8</p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Course</th>
                <th className="px-6 py-3 text-left text-sm font-medium">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{review.course}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{review.user}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      review.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : review.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    } capitalize`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-primary hover:text-primary/80 font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
