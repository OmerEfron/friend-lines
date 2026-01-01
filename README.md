# Friendlines

A minimal social network app with a news aesthetic. Share newsflashes with friends in a clean, headline-focused interface with a modern Material Design 3 red theme.

## Features

- **Main Feed**: View newsflashes from all your friends, sorted by time
- **Groups**: Organize friends into custom groups and view group-specific feeds
- **My Profile**: See all your own newsflashes with statistics
- **News-Style Design**: Bold typography emphasizing headlines and subheadlines
- **Material Design 3**: Modern UI with red accent colors and smooth interactions

## Design Highlights

- **Primary Color**: Deep Red (#D32F2F) for branding and key actions
- **Material You**: Implements Material Design 3 with custom theming
- **Cards**: Elevated newsflash cards with avatars and timestamps
- **Icons**: Material Community Icons throughout the interface
- **Typography**: Strong hierarchy with headline variants for news-style presentation

## Entities

- **Users**: People in the network
- **Friendships**: Connections between users
- **Newsflash**: A post containing headline, optional subheadline, optional media, and timestamp
- **Groups**: Custom user-defined collections of friends

## Tech Stack

- **React Native (Expo)**: Cross-platform mobile framework
- **TypeScript**: Type-safe development
- **React Navigation**: Bottom Tabs + Stack navigation
- **React Native Paper**: Material Design 3 components
- **Material Community Icons**: Comprehensive icon library
- **Mock data**: UI-only, no backend yet

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
├── theme/           # Material Design 3 theme
│   └── index.ts
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

- **Minimal**: No likes, comments, or shares - just newsflashes
- **Simple**: Clean interface focused on content delivery
- **News-style**: Bold typography and layout inspired by news apps (CNN, BBC, etc.)
- **Material Design**: Following Google's Material Design 3 guidelines
- **Accessibility**: High contrast red theme with proper text hierarchy

## Future Enhancements

- Backend integration
- Real-time updates
- User authentication
- Media upload support
- Push notifications

