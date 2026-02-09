import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video } from '../types';
import { WebYouTubePlayer } from '../components/WebYouTubePlayer';

type RootStackParamList = {
  Home: undefined;
  AddChannel: undefined;
  Player: { playlist: Video[] };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Smaller player for web, larger for mobile
const PLAYER_WIDTH = isWeb ? Math.min(480, SCREEN_WIDTH - 32) : SCREEN_WIDTH;
const PLAYER_HEIGHT = (PLAYER_WIDTH * 9) / 16;

export function PlayerScreen({ route }: Props) {
  const { playlist } = route.params;
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  // Use ref to always have current index in callback
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const currentVideo = currentIndex !== null ? playlist[currentIndex] : null;

  const handleVideoEnded = useCallback(() => {
    console.log('Video ended, Index:', currentIndexRef.current);
    if (currentIndexRef.current !== null && currentIndexRef.current < playlist.length - 1) {
      const nextIndex = currentIndexRef.current + 1;
      console.log('Advancing to video:', nextIndex);
      setCurrentIndex(nextIndex);
      setPlaying(true);
    } else {
      console.log('Playlist ended');
      setPlaying(false);
    }
  }, [playlist.length]);

  // For native platforms
  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      handleVideoEnded();
    }
  }, [handleVideoEnded]);

  const handleSelectVideo = (index: number) => {
    setCurrentIndex(index);
    setPlaying(true);
  };

  return (
    <View style={styles.container}>
      {/* Player Section - only shows when a video is selected */}
      {currentVideo && (
        <View style={styles.playerSection}>
          <View style={styles.playerWrapper}>
            {isWeb ? (
              <WebYouTubePlayer
                key={currentVideo.videoId}
                height={PLAYER_HEIGHT}
                width={PLAYER_WIDTH}
                play={playing}
                videoId={currentVideo.videoId}
                onEnded={handleVideoEnded}
              />
            ) : (
              <YoutubePlayer
                key={currentVideo.videoId}
                height={PLAYER_HEIGHT}
                width={PLAYER_WIDTH}
                play={playing}
                videoId={currentVideo.videoId}
                onChangeState={onStateChange}
              />
            )}
          </View>
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingTitle} numberOfLines={2}>
              {currentVideo.title}
            </Text>
            <Text style={styles.nowPlayingChannel}>{currentVideo.channelName}</Text>
          </View>
        </View>
      )}

      {/* Playlist Header */}
      <View style={styles.playlistHeader}>
        <Text style={styles.playlistTitle}>
          Playlist ({playlist.length} videos)
        </Text>
        {currentIndex !== null && (
          <Text style={styles.playlistProgress}>
            Playing {currentIndex + 1} of {playlist.length}
          </Text>
        )}
      </View>

      {/* Video List */}
      <ScrollView style={styles.playlist} contentContainerStyle={styles.playlistContent}>
        {playlist.map((video, index) => (
          <TouchableOpacity
            key={video.id}
            style={[
              styles.videoCard,
              currentIndex === index && styles.videoCardActive,
            ]}
            onPress={() => handleSelectVideo(index)}
            activeOpacity={0.7}
          >
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: video.thumbnail }}
                style={styles.thumbnail}
              />
              {currentIndex === index && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingBadgeText}>▶ NOW</Text>
                </View>
              )}
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text
                style={[
                  styles.videoTitle,
                  currentIndex === index && styles.videoTitleActive,
                ]}
                numberOfLines={2}
              >
                {video.title}
              </Text>
              <Text style={styles.channelName}>{video.channelName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Instructions when no video selected */}
      {currentIndex === null && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Tap any video to start playing
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  playerSection: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  playerWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  nowPlayingInfo: {
    width: '100%',
    maxWidth: 480,
    marginTop: 12,
  },
  nowPlayingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nowPlayingChannel: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playlistProgress: {
    color: '#ff0000',
    fontSize: 13,
    fontWeight: '500',
  },
  playlist: {
    flex: 1,
  },
  playlistContent: {
    padding: 12,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  videoCardActive: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 120,
    height: 68,
    backgroundColor: '#333',
  },
  playingBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#ff0000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  indexBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  indexText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  videoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  videoTitle: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  videoTitleActive: {
    color: '#fff',
  },
  channelName: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  instructions: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#666',
    fontSize: 16,
  },
});
