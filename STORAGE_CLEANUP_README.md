# Video Storage Cleanup Integration

This integration automatically deletes video files from Supabase Storage when records are deleted from the `videos` table.

## Components

1. **Edge Function**: `delete-video-storage` - Handles the actual file deletion from storage
2. **Database Trigger**: Automatically calls the edge function when a video record is deleted
3. **Updated Delete API**: Now deletes both analysis and video records

## Setup Instructions

### 1. Deploy the Edge Function

```bash
# Navigate to your project root
cd supabase

# Deploy the delete-video-storage function
supabase functions deploy delete-video-storage --project-ref zcshkomjuqcfeepimxwq

# Verify deployment
supabase functions list --project-ref zcshkomjuqcfeepimxwq
```

### 2. Set Up Environment Variables

Make sure your edge function has access to these environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (needed for storage operations)

Set these in your Supabase dashboard under Settings > Edge Functions > Environment Variables.

### 3. Run the Database Migration

Copy the contents of `supabase/migrations/002_video_deletion_trigger_simple.sql` and run it in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Paste and run the migration SQL
4. Verify the trigger was created successfully

### 4. Test the Integration

1. Run the test queries in `supabase/test_video_deletion.sql`
2. Delete a video record and check:
   - Supabase Logs (should show the edge function being called)
   - Storage bucket (files should be removed)

## How It Works

1. **User deletes an analysis** → API route deletes analysis record
2. **API route deletes video record** → Database trigger fires
3. **Trigger calls edge function** → Function extracts file paths from URLs
4. **Edge function deletes files** → Files removed from storage bucket

## File Structure

```
supabase/
├── functions/
│   └── delete-video-storage/
│       ├── index.ts           # Edge function code
│       └── deno.json          # Deno configuration
├── migrations/
│   ├── 001_video_deletion_trigger.sql      # Alternative trigger setup
│   └── 002_video_deletion_trigger_simple.sql # Recommended trigger setup
└── test_video_deletion.sql    # Test queries
```

## API Changes

The delete API route (`/api/history/[id]`) now:
1. Deletes the analysis record
2. Deletes the associated video record (triggers storage cleanup)
3. Returns appropriate success/error messages

## Error Handling

- If storage cleanup fails, the deletion still succeeds but returns a warning
- Edge function logs all operations for debugging
- Database trigger has exception handling to prevent deletion failures

## Testing Locally

```bash
# Start Supabase locally
supabase start

# Deploy function locally
supabase functions deploy delete-video-storage --project-ref local

# Test with curl
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-video-storage' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"record":{"id":1,"video_url":"https://example.com/storage/v1/object/public/videos/test.mp4","thumbnail_url":"https://example.com/storage/v1/object/public/videos/thumb.jpg"}}'
```

## Monitoring

- Check Supabase Logs for edge function execution
- Monitor Storage usage in Supabase Dashboard
- Use the test SQL queries to verify trigger functionality

## Troubleshooting

1. **Edge function not being called**: Check trigger setup and database logs
2. **Files not being deleted**: Verify service role key permissions and storage bucket configuration
3. **Function errors**: Check edge function logs in Supabase dashboard

## Security Notes

- The edge function uses the service role key for storage operations
- Database trigger runs with SECURITY DEFINER to ensure proper permissions
- All operations are logged for audit purposes
