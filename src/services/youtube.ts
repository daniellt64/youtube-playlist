import { Platform } from 'react-native';
import { XMLParser } from 'fast-xml-parser';
import { Video, RSSFeed, RSSFeedEntry } from '../types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

// CORS proxies for web platform (fallback chain)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors.eu.org/',
];

function proxyUrl(url: string, proxyIndex = 0): string {
  if (Platform.OS === 'web') {
    const proxy = CORS_PROXIES[proxyIndex] || CORS_PROXIES[0];
    return proxy + encodeURIComponent(url);
  }
  return url;
}

async function fetchWithProxy(url: string): Promise<Response> {
  if (Platform.OS !== 'web') {
    return fetch(url);
  }

  // Try each proxy until one works
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(url);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.log(`Proxy ${i} failed, trying next...`);
    }
  }
  throw new Error('All proxies failed');
}

/**
 * Fetches the RSS feed for a YouTube channel and returns parsed video data
 */
export async function fetchChannelFeed(channelId: string): Promise<Video[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetchWithProxy(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }

    const xml = await response.text();
    const parsed: RSSFeed = parser.parse(xml);

    if (!parsed.feed || !parsed.feed.entry) {
      return [];
    }

    const entries = Array.isArray(parsed.feed.entry)
      ? parsed.feed.entry
      : [parsed.feed.entry];

    return entries.map((entry: RSSFeedEntry) => ({
      id: entry['yt:videoId'],
      videoId: entry['yt:videoId'],
      title: entry.title,
      channelName: entry.author?.name || 'Unknown',
      channelId: entry['yt:channelId'],
      thumbnail: entry['media:group']?.['media:thumbnail']?.['@_url'] ||
        `https://i.ytimg.com/vi/${entry['yt:videoId']}/hqdefault.jpg`,
      publishedAt: entry.published,
    }));
  } catch (error) {
    console.error(`Error fetching channel ${channelId}:`, error);
    throw error;
  }
}

/**
 * Gets the latest video from a channel
 */
export async function getLatestVideo(channelId: string): Promise<Video | null> {
  const videos = await fetchChannelFeed(channelId);
  return videos.length > 0 ? videos[0] : null;
}

/**
 * Extracts channel ID from various YouTube URL formats
 */
export function extractChannelId(input: string): string | null {
  const trimmed = input.trim();

  // Direct channel ID (starts with UC)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return trimmed;
  }

  // Direct handle (starts with @)
  if (/^@[\w.-]+$/.test(trimmed)) {
    return trimmed;
  }

  // URL patterns
  const patterns = [
    // youtube.com/channel/UCxxxx
    /youtube\.com\/channel\/(UC[\w-]{22})/,
    // youtube.com/@handle - need to resolve this differently
    /youtube\.com\/@([\w.-]+)/,
    // youtube.com/c/channelname or youtube.com/user/username
    /youtube\.com\/(?:c|user)\/([\w.-]+)/,
    // youtu.be/channel/UCxxxx
    /youtu\.be\/channel\/(UC[\w-]{22})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      // If it's a channel ID, return it directly
      if (match[1].startsWith('UC') && match[1].length === 24) {
        return match[1];
      }
      // Otherwise it's a handle/username, prefix with @
      return `@${match[1]}`;
    }
  }

  return null;
}

/**
 * Resolves a YouTube handle to a channel ID
 */
export async function resolveHandleToChannelId(handle: string): Promise<string | null> {
  try {
    // Try fetching the channel page to extract the channel ID
    const url = `https://www.youtube.com/${handle}`;

    let html: string;

    if (Platform.OS === 'web') {
      // On web, try using a proxy
      const response = await fetchWithProxy(url);
      html = await response.text();
    } else {
      const response = await fetch(url);
      html = await response.text();
    }

    // Look for channel ID in the page source - try multiple patterns
    const patterns = [
      /\"channelId\":\"(UC[\w-]{22})\"/,
      /\"externalId\":\"(UC[\w-]{22})\"/,
      /channel_id=(UC[\w-]{22})/,
      /youtube\.com\/channel\/(UC[\w-]{22})/,
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})">/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        console.log('Found channel ID:', match[1]);
        return match[1];
      }
    }

    console.log('Could not find channel ID in page');
    return null;
  } catch (error) {
    console.error('Error resolving handle:', error);
    // On web, if proxy fails, throw special error
    if (Platform.OS === 'web') {
      throw new Error('HANDLE_NOT_SUPPORTED_WEB');
    }
    return null;
  }
}

/**
 * Gets channel info from the RSS feed
 */
export async function getChannelInfo(channelId: string): Promise<{ name: string; thumbnail: string } | null> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetchWithProxy(url);
    if (!response.ok) {
      return null;
    }

    const xml = await response.text();
    const parsed: RSSFeed = parser.parse(xml);

    if (!parsed.feed) {
      return null;
    }

    const entries = Array.isArray(parsed.feed.entry)
      ? parsed.feed.entry
      : parsed.feed.entry ? [parsed.feed.entry] : [];

    const firstEntry = entries[0];

    return {
      name: parsed.feed.title?.replace(' - YouTube', '') ||
            firstEntry?.author?.name ||
            'Unknown Channel',
      thumbnail: firstEntry?.['media:group']?.['media:thumbnail']?.['@_url'] ||
        `https://i.ytimg.com/vi/${firstEntry?.['yt:videoId'] || ''}/hqdefault.jpg`,
    };
  } catch (error) {
    console.error('Error getting channel info:', error);
    return null;
  }
}
