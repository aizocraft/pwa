'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/lib/auth';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  previewUrl?: string | null;
  userId?: string;
  refreshKey?: number;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-20 h-20 text-xl',
  xl: 'w-32 h-32 text-2xl',
};

const colorPalette = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500'
];

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

export const Avatar = memo(function Avatar({ 
  size = 'md', 
  className = '', 
  previewUrl, 
  userId: propUserId,
  refreshKey = 0
}: AvatarProps) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const userId = propUserId || user?.id || user?._id;
  const userName = user?.name ||  '';
  
  const imageUrl = useCallback(() => {
    if (previewUrl) return previewUrl;
    if (!userId || imageError) return null;
    
    const timestamp = refreshKey || Date.now();
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/users/${userId}/avatar?t=${timestamp}`;
  }, [previewUrl, userId, imageError, refreshKey])();
  
  // Reset when previewUrl changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [previewUrl, userId, refreshKey]);
  
  const initials = getInitials(userName);
  const bgColor = getColorFromName(userName);
  const showImage = imageUrl && !imageError;
  
  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {/* Initials placeholder - always visible until image loads */}
      <div
        className={`absolute inset-0 rounded-full ${bgColor} flex items-center justify-center text-white font-bold shadow-sm transition-opacity duration-300 ${
          !imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {initials}
      </div>
      
      {/* Image - fades in when loaded */}
      {showImage && (
        <img
          src={imageUrl}
          alt={userName || 'Avatar'}
          className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
          loading="eager"
        />
      )}
    </div>
  );
});

export default Avatar;