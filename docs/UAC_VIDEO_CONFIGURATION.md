# UAC Video Configuration Guide

## Overview

The Advisory Committee page now supports easy video updates through environment variables. You can quickly update the latest UAC meeting video by simply editing your `.env.local` file—no code changes required!

## How to Update the Video

### Step 1: Get the YouTube Video ID

1. Go to the YouTube video you want to display
2. Copy the video ID from the URL
   - Example: From `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - The video ID is: `dQw4w9WgXcQ`

### Step 2: Update Environment Variables

Edit your `.env.local` file and update these three variables:

```env
# UAC Video Configuration
NEXT_PUBLIC_UAC_VIDEO_ID=dQw4w9WgXcQ
NEXT_PUBLIC_UAC_MEETING_DATE=March 15, 2025
NEXT_PUBLIC_UAC_SLIDES_URL=/downloads/uac-presentation-march-2025.pdf
```

### Step 3: Restart the Development Server

If you're running the development server, restart it to pick up the new values:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

For production deployments, the changes will be picked up automatically on the next build.

## Configuration Variables

### `NEXT_PUBLIC_UAC_VIDEO_ID`
- **Required**: Yes (for video to display)
- **Format**: YouTube video ID (11 characters)
- **Example**: `dQw4w9WgXcQ`
- **Default**: `XXXXXX` (shows placeholder)

### `NEXT_PUBLIC_UAC_MEETING_DATE`
- **Required**: No
- **Format**: Free text date string
- **Example**: `March 15, 2025` or `February 27, 2025`
- **Default**: `TBD`

### `NEXT_PUBLIC_UAC_SLIDES_URL`
- **Required**: No
- **Format**: URL path (relative or absolute)
- **Example**: `/downloads/uac-presentation-march-2025.pdf`
- **Default**: `/downloads/uac-presentation.pdf`

## Features

### When Video is Configured
- Embedded YouTube player displays the video directly on the page
- "Open in YouTube" button allows viewing in a new tab
- Meeting date is displayed in the card header
- Link to presentation slides

### When Video is Not Configured
- Placeholder message is shown
- Instructions to configure the environment variable
- Download slides link still available

## Example Configurations

### Production Configuration
```env
NEXT_PUBLIC_UAC_VIDEO_ID=abc123XYZ99
NEXT_PUBLIC_UAC_MEETING_DATE=April 18, 2025
NEXT_PUBLIC_UAC_SLIDES_URL=https://cdn.example.com/slides/uac-april-2025.pdf
```

### Development/Testing Configuration
```env
NEXT_PUBLIC_UAC_VIDEO_ID=XXXXXX
NEXT_PUBLIC_UAC_MEETING_DATE=TBD
NEXT_PUBLIC_UAC_SLIDES_URL=/downloads/uac-presentation.pdf
```

## Deployment

For Cloudflare deployments, ensure the environment variables are set in your Cloudflare dashboard or `wrangler.toml` file.

For other deployment platforms (Vercel, Netlify, etc.), add these variables to your platform's environment variable settings.

## Troubleshooting

### Video Not Displaying
- Check that `NEXT_PUBLIC_UAC_VIDEO_ID` is set correctly
- Verify the video ID is exactly 11 characters
- Ensure the YouTube video is public and embeddable
- Restart your development server after making changes

### Date Not Updating
- Verify `NEXT_PUBLIC_UAC_MEETING_DATE` is set
- Restart your development server to pick up changes
- Check for typos in the variable name

### Embedded Player Blocked
- Some browsers block embedded content
- Users can still access the video via the "Open in YouTube" button
- Consider checking YouTube video privacy settings

## Benefits

✅ **Easy Updates**: Change video without touching code  
✅ **No Deployment Required**: Update environment variables on your hosting platform  
✅ **Embedded Player**: Videos play directly on the page  
✅ **Fallback Support**: Graceful handling when no video is configured  
✅ **Professional Presentation**: Clean, modern interface  

## Future Enhancements

Potential future improvements could include:
- Automatic fetching from YouTube channel RSS feed
- Multiple video support (archive of past meetings)
- Video timestamps for jumping to specific topics
- Integration with Directus CMS for content management
