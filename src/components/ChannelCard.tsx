import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  index: number;
  totalCount: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function ChannelCard({ channel, index, totalCount, onRemove, onMoveUp, onMoveDown }: ChannelCardProps) {
  const handleRemove = () => {
    Alert.alert(
      'Remove Channel',
      `Are you sure you want to remove "${channel.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(channel.id),
        },
      ]
    );
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

  return (
    <View style={styles.container}>
      <View style={styles.orderButtons}>
        <TouchableOpacity
          style={[styles.orderButton, !canMoveUp && styles.orderButtonDisabled]}
          onPress={() => canMoveUp && onMoveUp(index)}
          disabled={!canMoveUp}
        >
          <Text style={[styles.orderButtonText, !canMoveUp && styles.orderButtonTextDisabled]}>▲</Text>
        </TouchableOpacity>
        <Text style={styles.orderIndex}>{index + 1}</Text>
        <TouchableOpacity
          style={[styles.orderButton, !canMoveDown && styles.orderButtonDisabled]}
          onPress={() => canMoveDown && onMoveDown(index)}
          disabled={!canMoveDown}
        >
          <Text style={[styles.orderButtonText, !canMoveDown && styles.orderButtonTextDisabled]}>▼</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={{ uri: channel.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {channel.name}
        </Text>
        <Text style={styles.channelId} numberOfLines={1}>
          {channel.channelId}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  orderButtons: {
    alignItems: 'center',
    marginRight: 10,
  },
  orderButton: {
    padding: 4,
  },
  orderButtonDisabled: {
    opacity: 0.3,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  orderButtonTextDisabled: {
    color: '#666',
  },
  orderIndex: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 2,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  channelId: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
