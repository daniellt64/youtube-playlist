import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  extractChannelId,
  resolveHandleToChannelId,
  getChannelInfo,
} from '../services/youtube';
import { addChannel } from '../services/storage';
import { Channel } from '../types';

type RootStackParamList = {
  Home: undefined;
  AddChannel: undefined;
  Player: { playlist: unknown[] };
};

type Props = NativeStackScreenProps<RootStackParamList, 'AddChannel'>;

export function AddChannelScreen({ navigation }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddChannel = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      Alert.alert('Error', 'Please enter a channel URL or ID');
      return;
    }

    setLoading(true);
    try {
      let channelId = extractChannelId(trimmedInput);

      if (!channelId) {
        Alert.alert('Error', 'Invalid YouTube channel URL or ID');
        setLoading(false);
        return;
      }

      // If it's a handle (@username), resolve it to channel ID
      if (channelId.startsWith('@')) {
        try {
          const resolvedId = await resolveHandleToChannelId(channelId);
          if (!resolvedId) {
            Alert.alert(
              'Channel not found',
              `Could not find channel "${channelId}". Please check the name is correct.`
            );
            setLoading(false);
            return;
          }
          channelId = resolvedId;
        } catch (error) {
          if (error instanceof Error && error.message === 'HANDLE_NOT_SUPPORTED_WEB') {
            Alert.alert(
              'Could not resolve channel',
              'The proxy service is currently unavailable.\n\n' +
              'Please try:\n' +
              '1. Use the channel ID (UCxxxx) instead\n' +
              '2. Or try again later\n\n' +
              'To find the channel ID, search:\n' +
              '"channelname youtube channel ID"'
            );
            setLoading(false);
            return;
          }
          throw error;
        }
      }

      // Get channel info from RSS feed
      const info = await getChannelInfo(channelId);
      if (!info) {
        Alert.alert('Error', 'Could not fetch channel information');
        setLoading(false);
        return;
      }

      const newChannel: Channel = {
        id: `channel_${Date.now()}`,
        channelId,
        name: info.name,
        thumbnail: info.thumbnail,
      };

      await addChannel(newChannel);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Channel already exists') {
        Alert.alert('Error', 'This channel is already in your list');
      } else {
        Alert.alert('Error', `Failed to add channel: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Add Channel</Text>
          <Text style={styles.subtitle}>
            Enter a YouTube channel URL or channel ID
          </Text>

          <TextInput
            style={styles.input}
            placeholder="@channelname or UCxxxx..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleAddChannel}
          />

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Supported formats:</Text>
            <Text style={styles.exampleText}>• @channelname (ej: @ernestomoralesnews)</Text>
            <Text style={styles.exampleText}>• youtube.com/@channelname</Text>
            <Text style={styles.exampleText}>• UCxxxx (channel ID)</Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddChannel}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add Channel</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  examples: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 12,
  },
  examplesTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    color: '#666',
    fontSize: 14,
    marginVertical: 2,
  },
  addButton: {
    backgroundColor: '#ff0000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  addButtonDisabled: {
    backgroundColor: '#660000',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
