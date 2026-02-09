# YouTube Playlist App

Mobile app (React Native + Expo) that generates playlists from your favorite YouTube channels' latest videos.

## Features

- Add YouTube channels by URL or channel ID
- Auto-fetches channel info from RSS feeds
- Generate playlist with the latest video from each channel
- Built-in YouTube player with prev/next controls
- Auto-advances to next video
- Offline storage of favorite channels

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on device/simulator:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

## Usage

1. **Add Channels**: Tap the + button and enter a YouTube channel URL
   - Supports: `youtube.com/@channelname`, `youtube.com/channel/UCxxxx`, or direct channel ID

2. **Generate Playlist**: Tap "Generate Playlist" to fetch the latest video from each saved channel

3. **Play Videos**: Videos play automatically in sequence. Use prev/next controls or tap any video in the playlist.

## Tech Stack

- **Frontend**: React Native + Expo (TypeScript)
- **Data**: YouTube RSS Feeds (no API key required)
- **Storage**: AsyncStorage (local)
- **Player**: react-native-youtube-iframe

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx      # Channel list + generate button
│   ├── AddChannelScreen.tsx # Add new channel
│   └── PlayerScreen.tsx     # YouTube player + playlist
├── services/
│   ├── youtube.ts          # RSS feed fetching
│   └── storage.ts          # AsyncStorage wrapper
├── components/
│   ├── ChannelCard.tsx     # Channel display card
│   └── PlaylistControls.tsx # Player navigation
├── types/
│   └── index.ts            # TypeScript interfaces
└── navigation/
    └── AppNavigator.tsx    # React Navigation setup
```
