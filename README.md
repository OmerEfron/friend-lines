# Friendlines

A minimal social network app with a news aesthetic. Share newsflashes with friends in a clean, headline-focused interface.

## Features

- **Main Feed**: View newsflashes from all your friends, sorted by time
- **Groups**: Organize friends into custom groups and view group-specific feeds
- **My Profile**: See all your own newsflashes in one place
- **News-Style Design**: Clean typography emphasizing headlines and subheadlines

## Entities

- **Users**: People in the network
- **Friendships**: Connections between users
- **Newsflash**: A post containing headline, optional subheadline, optional media, and timestamp
- **Groups**: Custom user-defined collections of friends

## Tech Stack

- React Native (Expo)
- TypeScript
- React Navigation (Bottom Tabs + Stack)
- Mock data (UI-only, no backend yet)

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── FeedList.tsx
│   └── NewsflashCard.tsx
├── data/            # Mock data
│   └── mock.ts
├── navigation/      # Navigation configuration
│   └── TabNavigator.tsx
├── screens/         # Screen components
│   ├── MainFeedScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── GroupsScreen.tsx
│   └── GroupFeedScreen.tsx
└── types/           # TypeScript type definitions
    └── index.ts
```

## Getting Started

### Prerequisites

- Node.js >= 20.19.4
- npm or yarn
- Expo Go app (for testing on physical device)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the development server
npm start

# For specific platforms
npm run android
npm run ios
npm run web
```

## Design Philosophy

- **Minimal**: No likes, comments, or shares
- **Simple**: Clean interface focused on content
- **News-style**: Typography and layout inspired by news apps (CNN, BBC, etc.)

## Future Enhancements

- Backend integration
- Real-time updates
- User authentication
- Media upload support
- Push notifications

