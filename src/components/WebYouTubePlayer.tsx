import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

interface WebYouTubePlayerProps {
  videoId: string;
  width: number;
  height: number;
  play: boolean;
  onEnded: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function WebYouTubePlayer({ videoId, width, height, play, onEnded }: WebYouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const onEndedRef = useRef(onEnded);

  // Keep onEnded ref updated
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (containerRef.current && window.YT && window.YT.Player) {
        // Clear container
        containerRef.current.innerHTML = '';

        // Create player div
        const playerDiv = document.createElement('div');
        playerDiv.id = `youtube-player-${videoId}`;
        containerRef.current.appendChild(playerDiv);

        playerRef.current = new window.YT.Player(playerDiv.id, {
          height: height,
          width: width,
          videoId: videoId,
          playerVars: {
            autoplay: play ? 1 : 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onStateChange: (event: any) => {
              // 0 = ended, 1 = playing
              if (event.data === 0) {
                console.log('Video ended, advancing...');
                onEndedRef.current();
              }
              // Set up Media Session for lock screen controls (limited iOS support)
              if (event.data === 1 && 'mediaSession' in navigator) {
                try {
                  navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'YouTube Playlist',
                    artist: 'Playing video',
                  });
                  navigator.mediaSession.setActionHandler('nexttrack', () => {
                    onEndedRef.current();
                  });
                } catch (e) {
                  console.log('Media Session not supported');
                }
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, width, height]);

  // Handle play/pause
  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo && playerRef.current.pauseVideo) {
      if (play) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [play]);

  return (
    <View style={[styles.container, { width, height }]}>
      <div ref={containerRef} style={{ width, height }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
});
