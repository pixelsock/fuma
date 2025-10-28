'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

interface UACVideo {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  url: string;
  category: string;
  slides: string | null;
}

// Helper function to convert YouTube URL to embed format
function getYouTubeEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com/watch?v=VIDEO_ID format
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle youtu.be/VIDEO_ID format
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // If already in embed format or unknown format, return as is
    return url;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return url;
  }
}

export function LatestUACVideo() {
  const [latestVideo, setLatestVideo] = useState<UACVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestVideo() {
      try {
        setLoading(true);
        const response = await fetch('/api/uac-meetings');
        if (!response.ok) {
          throw new Error('Failed to fetch UAC meeting videos');
        }
        const data: UACVideo[] = await response.json();
        
        // Sort by date (most recent first) and get the first one
        const sortedVideos = data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        
        if (sortedVideos.length > 0) {
          setLatestVideo(sortedVideos[0]);
        }
      } catch (error) {
        console.error('Error fetching latest UAC video:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestVideo();
  }, []);

  if (loading) {
    return (
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Latest UAC Meeting
          </CardTitle>
          <CardDescription className="mb-4">
            Loading latest video...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg overflow-hidden bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!latestVideo) {
    return null;
  }

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {latestVideo.title}
          <Badge variant="default" className="ml-auto">Latest</Badge>
        </CardTitle>
        <CardDescription className="mb-4">
          {latestVideo.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <iframe
            width="100%"
            height="100%"
            src={getYouTubeEmbedUrl(latestVideo.url)}
            title={latestVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
