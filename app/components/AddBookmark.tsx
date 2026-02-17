'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function AddBookmark() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !title.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        url: url.trim(),
        title: title.trim(),
      })

    if (error) {
      console.error('Error adding bookmark:', error)
    } else {
      setUrl('')
      setTitle('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg bg-white p-6 shadow-md">
      <h2 className="text-xl font-semibold text-gray-900">Add New Bookmark</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bookmark title"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Bookmark'}
        </button>
      </div>
    </form>
  )
}
