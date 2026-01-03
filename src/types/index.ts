export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  timestamp: Date;
  user?: User; // Enriched user data from API
}

export interface Group {
  id: string;
  name: string;
  userIds: string[];
  createdBy?: string;
}

export interface Friendship {
  userId: string;
  friendId: string;
}

