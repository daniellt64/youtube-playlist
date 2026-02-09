import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Channel, Video } from '../types';
import { getChannels, removeChannel, reorderChannels } from '../services/storage';
import { getLatestVideo } from '../services/youtube';
import { ChannelCard } from '../components/ChannelCard';

type RootStackParamList = {
  Home: undefined;
  AddChannel: undefined;
  Player: { playlist: Video[] };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadChannels = useCallback(async () => {
    try {
      const data = await getChannels();
      setChannels(data);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChannels();
    }, [loadChannels])
  );

  const handleRemoveChannel = async (id: string) => {
    try {
      await removeChannel(id);
      setChannels(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error removing channel:', error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      try {
        const newChannels = await reorderChannels(index, index - 1);
        setChannels(newChannels);
      } catch (error) {
        console.error('Error moving channel:', error);
      }
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index < channels.length - 1) {
      try {
        const newChannels = await reorderChannels(index, index + 1);
        setChannels(newChannels);
      } catch (error) {
        console.error('Error moving channel:', error);
      }
    }
  };

  const handleGeneratePlaylist = async () => {
    if (channels.length === 0) return;

    setGenerating(true);
    try {
      const videoPromises = channels.map(channel =>
        getLatestVideo(channel.channelId).catch(() => null)
      );

      const videos = await Promise.all(videoPromises);
      const validVideos = videos.filter((v): v is Video => v !== null);

      if (validVideos.length > 0) {
        navigation.navigate('Player', { playlist: validVideos });
      } else {
        alert('Could not fetch videos from any channel');
      }
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Error generating playlist');
    } finally {
      setGenerating(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChannels();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <ChannelCard
            channel={item}
            index={index}
            totalCount={channels.length}
            onRemove={handleRemoveChannel}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No channels added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your favorite YouTube channels
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff0000"
          />
        }
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddChannel')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.playlistButton,
            (channels.length === 0 || generating) && styles.playlistButtonDisabled,
          ]}
          onPress={handleGeneratePlaylist}
          disabled={channels.length === 0 || generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.playlistButtonText}>
              Generate Playlist ({channels.length})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  playlistButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistButtonDisabled: {
    backgroundColor: '#333',
  },
  playlistButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
