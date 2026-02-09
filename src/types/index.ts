export interface Channel {
  id: string;
  channelId: string;
  name: string;
  thumbnail: string;
  lastVideoId?: string;
}

export interface Video {
  id: string;
  videoId: string;
  title: string;
  channelName: string;
  channelId: string;
  thumbnail: string;
  publishedAt: string;
}

export interface RSSFeedEntry {
  'yt:videoId': string;
  'yt:channelId': string;
  title: string;
  author: {
    name: string;
  };
  published: string;
  'media:group': {
    'media:thumbnail': {
      '@_url': string;
    };
  };
}

export interface RSSFeed {
  feed: {
    title: string;
    'yt:channelId': string;
    entry: RSSFeedEntry | RSSFeedEntry[];
  };
}
