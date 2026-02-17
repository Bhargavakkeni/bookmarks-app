# Smart Bookmarks App

A simple bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time updates, and private bookmarks per user.

## Features

- 🔐 **Google OAuth Authentication** - Sign in with your Google account (no email/password required)
- 📑 **Bookmark Management** - Add bookmarks with URL and title
- 🔒 **Private Bookmarks** - Each user can only see their own bookmarks
- ⚡ **Real-time Updates** - Bookmarks sync across multiple tabs/windows instantly
- 🗑️ **Delete Bookmarks** - Remove bookmarks you no longer need

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Authentication, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript**

## Prerequisites

Before you begin, ensure you have:

1. Node.js 20+ installed
2. A Supabase account (free tier works)
3. A Google Cloud project with OAuth credentials (for Google sign-in)
4. A GitHub account (for deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bookmarks-app
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**

### 3. Configure Google OAuth in Supabase

1. In your Supabase project, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need to create OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Set application type to **Web application**
   - Add authorized redirect URIs:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
   - Copy the **Client ID** and **Client Secret**
4. Paste these into Supabase Google provider settings
5. Save the configuration

### 4. Set Up Database

1. In Supabase, go to **SQL Editor**
2. Run the migration file `supabase/migrations/001_create_bookmarks_table.sql`:

```sql
-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime for bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure environment variables:
   - Add `NEXT_PUBLIC_SUPABASE_URL` with your Supabase project URL
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Supabase anon key
5. Click **Deploy**

### Step 3: Update Google OAuth Redirect URI

After deployment, you need to add your Vercel URL to Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client ID credentials
3. Add your Vercel URL to authorized redirect URIs:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - `https://<your-vercel-app>.vercel.app/auth/callback`

### Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. Add a bookmark
5. Open the app in another tab/window to verify real-time updates

## Project Structure

```
bookmarks-app/
├── app/
│   ├── auth/
│   │   └── callback/          # OAuth callback handler
│   ├── components/
│   │   ├── AddBookmark.tsx    # Form to add new bookmarks
│   │   ├── BookmarkList.tsx   # List of bookmarks with real-time updates
│   │   └── LogoutButton.tsx   # Logout functionality
│   ├── login/
│   │   └── page.tsx           # Login page with Google OAuth
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page (bookmarks dashboard)
├── lib/
│   └── supabase/
│       ├── client.ts          # Browser Supabase client
│       ├── server.ts          # Server Supabase client
│       └── middleware.ts     # Middleware for auth
├── supabase/
│   └── migrations/
│       └── 001_create_bookmarks_table.sql
├── types/
│   └── database.types.ts      # TypeScript types for database
└── middleware.ts              # Next.js middleware
```

## Problems Encountered and Solutions

### Problem 1: Real-time Updates Not Working

**Issue**: Bookmarks weren't updating in real-time across tabs.

**Solution**: 
- Added proper filter to the real-time subscription using `filter: \`user_id=eq.${user.id}\`` to only listen to changes for the current user
- Ensured the `supabase_realtime` publication includes the bookmarks table
- Used proper cleanup in useEffect to unsubscribe when component unmounts

### Problem 2: OAuth Redirect Issues

**Issue**: After Google OAuth, users were redirected incorrectly or got errors.

**Solution**:
- Created proper callback route handler at `/app/auth/callback/route.ts`
- Handled both local development and production environments
- Used `x-forwarded-host` header for proper redirects in production
- Added error handling for failed OAuth attempts

### Problem 3: Row Level Security (RLS) Policies

**Issue**: Users could see other users' bookmarks or couldn't insert/delete their own.

**Solution**:
- Created comprehensive RLS policies for SELECT, INSERT, and DELETE operations
- Used `auth.uid() = user_id` to ensure users can only access their own data
- Tested policies thoroughly in Supabase dashboard

### Problem 4: Middleware Redirect Loop

**Issue**: Users were stuck in redirect loops between login and home pages.

**Solution**:
- Updated middleware to exclude `/login` and `/auth` routes from authentication checks
- Properly handled the case when user is not authenticated
- Ensured middleware doesn't interfere with OAuth callback flow

### Problem 5: TypeScript Type Errors

**Issue**: Type errors when accessing Supabase database types.

**Solution**:
- Created `types/database.types.ts` with proper TypeScript interfaces
- Used Supabase's generated types for type safety
- Properly typed all database operations

### Problem 6: Real-time Subscription Cleanup

**Issue**: Memory leaks from not properly cleaning up real-time subscriptions.

**Solution**:
- Added proper cleanup function in useEffect return
- Stored channel reference to ensure proper unsubscription
- Used conditional check before removing channel

## Testing Real-time Updates

To test real-time updates:

1. Open the app in two different browser tabs
2. Sign in with the same Google account in both tabs
3. Add a bookmark in one tab
4. The bookmark should appear instantly in the other tab without refreshing
5. Delete a bookmark in one tab
6. It should disappear from the other tab immediately

## Security Features

- **Row Level Security (RLS)**: Database-level security ensuring users can only access their own data
- **Server-side Authentication**: All authentication checks happen on the server
- **Secure Cookies**: Supabase handles secure cookie management
- **OAuth 2.0**: Industry-standard authentication flow

## Future Enhancements

- [ ] Edit bookmark functionality
- [ ] Bookmark categories/tags
- [ ] Search functionality
- [ ] Bookmark favicons
- [ ] Export bookmarks
- [ ] Dark mode toggle

## License

MIT

## Support

If you encounter any issues, please check:
1. Environment variables are set correctly
2. Supabase project is active
3. Google OAuth credentials are configured
4. Database migration has been run
5. Realtime is enabled for the bookmarks table
