'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Clock, Play, Download, Search, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function UACMeetings() {
  const [videos, setVideos] = useState<UACVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<UACVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<UACVideo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        const response = await fetch('/api/uac-meetings');
        if (!response.ok) {
          throw new Error('Failed to fetch UAC meeting videos');
        }
        const data = await response.json();
        setVideos(data);
        setFilteredVideos(data);
      } catch (error) {
        console.error('Error fetching UAC meeting videos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Filter videos based on search term and year
  useEffect(() => {
    let filtered = videos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by year
    if (yearFilter !== 'all') {
      filtered = filtered.filter(video => {
        const videoYear = new Date(video.date).getFullYear().toString();
        return videoYear === yearFilter;
      });
    }

    setFilteredVideos(filtered);
  }, [videos, searchTerm, yearFilter]);

  // Get unique years for filter dropdown
  const getAvailableYears = () => {
    const years = videos.map(video => new Date(video.date).getFullYear().toString());
    return [...new Set(years)].sort((a, b) => b.localeCompare(a)); // Sort newest first
  };

  // Handle video selection for dialog
  const handleVideoSelect = (video: UACVideo) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url; // Fallback
  };

  // Simplified Thumbnail Component
  const SimpleThumbnail = ({ video }: { video: UACVideo }) => {
    return (
      <div 
        className="w-full aspect-video flex flex-col items-center justify-center text-white relative p-6"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #1e3a8a 100%)',
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Content */}
        <div className="relative text-center space-y-3">
          <div>
            <h3 className="text-base font-bold mb-1 text-white">Charlotte UDO</h3>
            <p className="text-xs opacity-90 text-white">Advisory Committee Meeting</p>
          </div>
          
          <Badge variant="secondary" className="bg-white text-blue-700 font-semibold pointer-events-none">
            {formatDate(video.date)}
          </Badge>
          
          <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading UAC meetings...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No UAC meetings available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Archive - Thumbnail Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Meeting Archive</h3>
          </div>
          
          {/* Filter Controls */}
          <div>
            {/* Year Filter */}
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getAvailableYears().map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredVideos.length} of {videos.length} meetings
          </p>
        </div>
        
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No meetings found</h4>
            <p className="text-muted-foreground">
              Try selecting a different year from the filter above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleVideoSelect(video)}
              >
                <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-lg !pt-0">
                  <SimpleThumbnail video={video} />
                  
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2 leading-snug">
                      {video.title}
                    </h4>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white">
                <Play className="w-4 h-4" />
              </div>
              {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedVideo?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {selectedVideo.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedVideo.date)}</span>
                  </div>
                )}
                {selectedVideo.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(selectedVideo.time)}</span>
                  </div>
                )}
              </div>

              {/* Video Embed */}
              {selectedVideo.url && (
                <div className="aspect-video overflow-hidden bg-muted rounded-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(selectedVideo.url)}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Slides Download */}
              {selectedVideo.slides && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={`/api/files/${selectedVideo.slides}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Download Presentation Slides
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
