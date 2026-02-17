import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddBookmark from './components/AddBookmark'
import BookmarkList from './components/BookmarkList'
import LogoutButton from './components/LogoutButton'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Smart Bookmarks</h1>
          <LogoutButton />
        </div>
        <AddBookmark />
        <BookmarkList />
      </div>
    </div>
  )
}
