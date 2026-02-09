import AsyncStorage from '@react-native-async-storage/async-storage';
import { Channel } from '../types';

const CHANNELS_KEY = '@youtube_playlist_channels';

/**
 * Get all saved channels
 */
export async function getChannels(): Promise<Channel[]> {
  try {
    const data = await AsyncStorage.getItem(CHANNELS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting channels:', error);
    return [];
  }
}

/**
 * Save a new channel
 */
export async function addChannel(channel: Channel): Promise<void> {
  try {
    const channels = await getChannels();

    // Check if channel already exists
    if (channels.some(c => c.channelId === channel.channelId)) {
      throw new Error('Channel already exists');
    }

    channels.push(channel);
    await AsyncStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  } catch (error) {
    console.error('Error adding channel:', error);
    throw error;
  }
}

/**
 * Remove a channel by ID
 */
export async function removeChannel(id: string): Promise<void> {
  try {
    const channels = await getChannels();
    const filtered = channels.filter(c => c.id !== id);
    await AsyncStorage.setItem(CHANNELS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing channel:', error);
    throw error;
  }
}

/**
 * Update a channel
 */
export async function updateChannel(id: string, updates: Partial<Channel>): Promise<void> {
  try {
    const channels = await getChannels();
    const index = channels.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error('Channel not found');
    }

    channels[index] = { ...channels[index], ...updates };
    await AsyncStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  } catch (error) {
    console.error('Error updating channel:', error);
    throw error;
  }
}

/**
 * Clear all channels (for debugging/reset)
 */
export async function clearAllChannels(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHANNELS_KEY);
  } catch (error) {
    console.error('Error clearing channels:', error);
    throw error;
  }
}

/**
 * Reorder channels
 */
export async function reorderChannels(fromIndex: number, toIndex: number): Promise<Channel[]> {
  try {
    const channels = await getChannels();
    const [movedChannel] = channels.splice(fromIndex, 1);
    channels.splice(toIndex, 0, movedChannel);
    await AsyncStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
    return channels;
  } catch (error) {
    console.error('Error reordering channels:', error);
    throw error;
  }
}
