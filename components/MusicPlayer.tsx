import React, { useState, useRef, useEffect } from 'react';
import { Music, X, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import ElasticSlider from './ElasticSlider';
import { METING_CONFIG } from '../constants';

type Song = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  url?: string;
}

interface MusicPlayerProps {
  initialVisible?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ initialVisible = false }) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [isOpen, setIsOpen] = useState(initialVisible);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicPlaylist, setMusicPlaylist] = useState<Song[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSong = musicPlaylist[currentSongIndex];

  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Auto-show prompt after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !hasInteracted) {
        setShowPrompt(true);
      }
    }, 3000); // Show prompt after 3 seconds
    return () => clearTimeout(timer);
  }, [isOpen, hasInteracted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        // Need to handle autoplay restrictions
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongIndex, isMuted, volume]);

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % musicPlaylist.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentSongIndex((prev) => (prev - 1 + musicPlaylist.length) % musicPlaylist.length);
    setIsPlaying(true);
  };

  const handlePromptResponse = (accept: boolean) => {
    setShowPrompt(false);
    setHasInteracted(true);
    if (accept) {
      setIsOpen(true);
      setIsPlaying(true);
    }
  };

  const handleVolumeSliderChange = (newVal: number) => {
    const newVolume = newVal / 1000;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsSeeking(false);
    const target = e.currentTarget;
    const newTime = parseFloat(target.value);
    if (audioRef.current) {
        audioRef.current.currentTime = newTime;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setProgress(newTime);
  };

  // Fetch music playlist from Meting API
  useEffect(() => {
    const fetchMusicPlaylist = async () => {
      try {
        // Replace placeholders in API URL
        const apiUrl = METING_CONFIG.api
          .replace(':server', METING_CONFIG.server)
          .replace(':type', METING_CONFIG.type)
          .replace(':id', METING_CONFIG.id)
          .replace(':r', Math.random().toString());

        console.log('Fetching music from:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Transform API response to Song interface - Fixed field mapping
        const playlist: Song[] = data.map((song: any, index: number) => ({
          id: song.id || index,
          title: song.title || 'Unknown Title',
          artist: song.author || 'Unknown Artist',
          cover: song.pic || '',
          url: song.url
        }));

        setMusicPlaylist(playlist);
    
        // Ensure we start at the first song when playlist is loaded
        if (playlist.length > 0) {
          setCurrentSongIndex(0);
        }
      } catch (error) {
        console.error("Failed to fetch music playlist:", error);
        
        // Try fallback APIs if available
        if (METING_CONFIG.fallbackApis && METING_CONFIG.fallbackApis.length > 0) {
          for (const fallbackApi of METING_CONFIG.fallbackApis) {
            try {
              const apiUrl = fallbackApi
                .replace(':server', METING_CONFIG.server)
                .replace(':type', METING_CONFIG.type)
                .replace(':id', METING_CONFIG.id);

              console.log('Trying fallback API:', apiUrl);
              const response = await fetch(apiUrl);
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();

              // Transform API response to Song interface - Fixed field mapping
              const playlist: Song[] = data.map((song: any, index: number) => ({
                id: song.id || index,
                title: song.title || 'Unknown Title',
                artist: song.author || 'Unknown Artist',
                cover: song.pic || '',
                url: song.url
              }));

              setMusicPlaylist(playlist);
              // Ensure we start at the first song when playlist is loaded
              if (playlist.length > 0) {
                setCurrentSongIndex(0);
              }

              break; // Stop trying fallbacks if successful
            } catch (fallbackError) {
              console.error(`Failed to fetch from fallback API: ${fallbackApi}`, fallbackError);
            }
          }
        }
      }
    };

    fetchMusicPlaylist();
  }, []);

  // Ensure audio is properly disposed only when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Hidden Audio Element - Always mounted */}
      {currentSong && (
        <audio 
          ref={audioRef}
          src={currentSong.url || ''}
          crossOrigin="anonymous"
          onTimeUpdate={(e) => {
              if (!isSeeking) {
                  setProgress(e.currentTarget.currentTime);
              }
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={handleNext}
          onError={() => {
            console.error("Audio load failed for song:", currentSong.title);
            setIsPlaying(false);
          }}
        />
      )}

      {/* Floating Prompt Bubble */}
      {showPrompt && !isOpen && (
        <div className="pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 animate-bounce-subtle max-w-[200px]">
          <p className="text-sm font-medium mb-3 text-zinc-800 dark:text-zinc-200">
            👋 要不要来一首好听的歌？
          </p>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => handlePromptResponse(false)}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              不了
            </button>
            <button 
              onClick={() => handlePromptResponse(true)}
              className="px-3 py-1.5 text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              好呀
            </button>
          </div>
        </div>
      )}

      {/* Main Player or Floating Icon */}
      <div className="pointer-events-auto">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-700/50 rounded-full shadow-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:scale-110 transition-transform duration-200 group"
            title="Open Music Player"
          >
            <Music className={`w-5 h-5 ${isPlaying ? 'animate-spin-slow' : 'group-hover:animate-spin-slow'}`} />
          </button>
        ) : (
          <div className={`backdrop-blur-xl bg-white/70 dark:bg-black/60 border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-5 w-[300px] origin-bottom-right overflow-hidden ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
            
            {/* Ambient Background Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl -z-10 pointer-events-none translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-10 translate-y-10"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse"></span>
                <span className="text-[10px] font-bold text-zinc-500/80 dark:text-zinc-400/80 uppercase tracking-widest">Now Playing</span>
              </div>
              <button 
                onClick={handleClose}
                className="text-zinc-400/80 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cover & Info */}
            {currentSong && (
              <div className="flex gap-4 mb-5 relative z-10">
                <div className={`w-20 h-20 rounded-xl overflow-hidden shadow-lg shrink-0 border border-black/5 dark:border-white/5 ${isPlaying ? 'animate-pulse-slow' : ''}`}>
                  <img 
                    src={currentSong.cover} 
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.style.display = 'none';
                      const parent = imgElement.parentElement;
                      if (parent) {
                        parent.innerHTML = '<Music className="w-10 h-10 text-zinc-400 m-auto" />';
                        parent.style.display = 'flex';
                        parent.style.alignItems = 'center';
                        parent.style.justifyContent = 'center';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-white truncate leading-tight mb-1">
                    {currentSong.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate font-medium">
                    {currentSong.artist}
                  </p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-4 relative z-10">
              {/* Progress Bar */}
              <div className="relative group">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={handleSeek}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className="w-full h-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full appearance-none cursor-pointer focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, ${document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.9)' : 'rgba(24,24,27,0.8)'} ${(progress / (duration || 1)) * 100}%, transparent ${(progress / (duration || 1)) * 100}%)`
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <ElasticSlider 
                    leftIcon={
                      <button onClick={() => setIsMuted(!isMuted)} className="hover:text-zinc-800 dark:hover:text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    }
                    value={(isMuted ? 0 : volume) * 1000}
                    maxValue={1000}
                    isStepped
                    stepSize={10}
                    onChange={handleVolumeSliderChange}
                  />
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button onClick={handlePrev} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors hover:scale-110 transform">
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>
                  <button 
                    onClick={handlePlayPause}
                    className="w-12 h-12 bg-zinc-900/90 dark:bg-white/90 text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg backdrop-blur-sm"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <button onClick={handleNext} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors hover:scale-110 transform">
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-12 h-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-700/50 rounded-full shadow-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:scale-110 transition-transform duration-200 pointer-events-auto"
        title="Back to Top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Styles */}
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes scale-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        .animate-scale-out {
          animation: scale-out 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;