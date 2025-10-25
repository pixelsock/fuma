'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Play, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VideoEmbed {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  url: string;
  category: string;
  slides?: string;
}

interface InformationalSessionsProps {
  className?: string;
}

export function InformationalSessions({ className }: InformationalSessionsProps) {
  const [videos, setVideos] = useState<VideoEmbed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        const response = await fetch('/api/video-embeds');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchVideos();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/embed/')) {
      return url; // Already an embed URL
    }
    return url; // Return as-is if not a recognized YouTube URL
  };

  if (loading) {
    return (
      <div className={`py-20 bg-background ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading informational sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={`py-20 bg-background ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">No informational sessions available at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-20 bg-background ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">UDO Text Amendment Informational Sessions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch recorded sessions to learn more about previously adopted text amendments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <CardHeader>
                  {/* Icon and Badge Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white">
                      <Play className="w-6 h-6" />
                    </div>
                    <Badge variant="outline">Virtual Session</Badge>
                  </div>
                  
                  <CardTitle className="mb-1">{video.title}</CardTitle>
                  
                  {/* Date and Time */}
                  <div className="flex items-center gap-4">
                    {video.date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(video.date)}</span>
                      </div>
                    )}
                    {video.time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(video.time)}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                {/* Video Embed */}
                {video.url && (
                  <div className="aspect-video overflow-hidden bg-muted px-6 rounded-lg my-6">
                    <iframe
                      width="100%"
                      height="100%"
                      src={getEmbedUrl(video.url)}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
                
                <CardContent>
                  <CardDescription className="mb-4">
                    {video.description}
                  </CardDescription>
                  <div className="space-y-4">

                    {/* Slides Download */}
                    {video.slides && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={`/api/files/${video.slides}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 w-4 h-4" />
                          Download Slides
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
