'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Database } from '@/types/database.types'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
    } else {
      setBookmarks(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null


    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel('bookmarks-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookmarks',
          },
          (payload) => {
            // Refetch bookmarks when changes occur
            fetchBookmarks()
          }
        )
        .on(
          'postgres_changes',
          { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'bookmarks' 
          },
          (payload) => {
            fetchBookmarks();
          }
        )
        .subscribe()
    }

    fetchBookmarks()
    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark')
    }
    fetchBookmarks()
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading bookmarks...</div>
  }

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <p className="text-gray-600">No bookmarks yet. Add your first bookmark above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Bookmarks</h2>
      <div className="space-y-3">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
              >
                {bookmark.title}
              </a>
              <p className="text-sm text-gray-500 truncate mt-1">{bookmark.url}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(bookmark.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(bookmark.id)}
              className="ml-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
