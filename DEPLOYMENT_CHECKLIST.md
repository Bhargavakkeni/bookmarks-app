# Deployment Checklist

Use this checklist to ensure everything is set up correctly before deploying.

## Pre-Deployment

- [ ] Supabase project created and active
- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Google OAuth configured in Supabase (Client ID and Secret added)
- [ ] Database migration run successfully (`001_create_bookmarks_table.sql`)
- [ ] Realtime enabled for bookmarks table (check Supabase Dashboard → Database → Replication)
- [ ] Environment variables documented in `.env.local.example`
- [ ] Code pushed to GitHub repository

## Vercel Deployment

- [ ] Vercel account connected to GitHub
- [ ] Project imported from GitHub repository
- [ ] Environment variables added in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deployment successful (check build logs)
- [ ] Vercel URL obtained

## Post-Deployment

- [ ] Google OAuth redirect URI updated:
  - [ ] Added `https://<your-vercel-app>.vercel.app/auth/callback` to authorized redirect URIs
- [ ] Test authentication flow:
  - [ ] Visit Vercel URL
  - [ ] Click "Sign in with Google"
  - [ ] Complete OAuth flow
  - [ ] Verify redirect back to app
- [ ] Test bookmark functionality:
  - [ ] Add a bookmark
  - [ ] Verify it appears in the list
  - [ ] Delete a bookmark
  - [ ] Verify it's removed
- [ ] Test real-time updates:
  - [ ] Open app in two browser tabs
  - [ ] Add bookmark in one tab
  - [ ] Verify it appears in the other tab without refresh
  - [ ] Delete bookmark in one tab
  - [ ] Verify it disappears in the other tab

## Troubleshooting

If authentication fails:
- Check Google OAuth redirect URIs include both Supabase callback and Vercel callback
- Verify environment variables are set correctly in Vercel
- Check Supabase logs for authentication errors

If real-time updates don't work:
- Verify Realtime is enabled in Supabase Dashboard → Database → Replication
- Check browser console for WebSocket connection errors
- Ensure RLS policies allow the user to see their own bookmarks

If bookmarks don't appear:
- Check Supabase logs for database errors
- Verify RLS policies are correctly configured
- Check browser console for API errors
