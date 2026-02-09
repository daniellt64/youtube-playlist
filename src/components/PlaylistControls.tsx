import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PlaylistControlsProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function PlaylistControls({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: PlaylistControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canGoPrevious && styles.buttonDisabled]}
        onPress={onPrevious}
        disabled={!canGoPrevious}
      >
        <Text style={[styles.buttonText, !canGoPrevious && styles.buttonTextDisabled]}>
          ← Previous
        </Text>
      </TouchableOpacity>

      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {totalCount}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !canGoNext && styles.buttonDisabled]}
        onPress={onNext}
        disabled={!canGoNext}
      >
        <Text style={[styles.buttonText, !canGoNext && styles.buttonTextDisabled]}>
          Next →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#666',
  },
  counter: {
    paddingHorizontal: 16,
  },
  counterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
