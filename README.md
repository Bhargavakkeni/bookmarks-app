# Bookmarks App

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

1. In Supabase, go to **SQL Editor** Or use supabase cli db push command
2. Run the migration file `supabase/migrations/001_create_bookmarks_table.sql`:


### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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
- Ensured the `supabase_realtime` publication includes the bookmarks table
- Used proper cleanup in useEffect to unsubscribe when component unmounts
- Added proper listener events on channel to track the updates on db.

### Problem 2: OAuth Redirect Issues

**Issue**: After Google OAuth, users were redirected incorrectly to localhost after deployment

**Solution**:
- Created proper callback route handler at `/app/auth/callback/route.ts`
- Handled both local development and production environments
- Used `x-forwarded-host` header for proper redirects in production
- Added error handling for failed OAuth attempts

### Problem 3: Row Level Security (RLS) Policies

**Issue**: Users could see other users' bookmarks.

**Solution**:
- Created comprehensive RLS policies for SELECT, INSERT, and DELETE operations
- Used `auth.uid() = user_id` to ensure users can only access their own data



## Security Features

- **Row Level Security (RLS)**: Database-level security ensuring users can only access their own data
- **Server-side Authentication**: All authentication checks happen on the server
- **Secure Cookies**: Supabase handles secure cookie management
- **OAuth 2.0**: Industry-standard authentication flow

