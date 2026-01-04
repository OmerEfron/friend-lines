import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card, Text, Avatar, useTheme, IconButton } from 'react-native-paper';
import { Newsflash, User } from '../types';
import { useBookmarks } from '../context/BookmarksContext';

interface NewsflashCardProps {
  newsflash: Newsflash;
  user: User;
}

export default function NewsflashCard({ newsflash, user }: NewsflashCardProps) {
  const theme = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  const getTimeInfo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    const isJustIn = minutes < 60;
    let timeText: string;

    if (days > 0) {
      timeText = `Filed ${days}d ago`;
    } else if (hours > 0) {
      timeText = `Filed ${hours}h ago`;
    } else if (minutes > 0) {
      timeText = `Filed ${minutes}m ago`;
    } else {
      timeText = 'Filed just now';
    }

    return { isJustIn, timeText };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const bookmarked = isBookmarked(newsflash.id);
  const { isJustIn, timeText } = getTimeInfo(newsflash.timestamp);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.card} mode="contained">
        <Card.Content>
          {isJustIn && (
            <View style={[styles.justInBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.justInText}>JUST IN</Text>
            </View>
          )}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Avatar.Text 
                size={32} 
                label={getInitials(user.name)}
                style={{ backgroundColor: theme.colors.primaryContainer }}
              />
              <View style={styles.userMeta}>
                <Text variant="labelMedium" style={styles.username}>
                  @{user.username}
                </Text>
                <Text variant="labelSmall" style={styles.correspondent}>
                  Correspondent
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text variant="labelSmall" style={styles.time}>
                {timeText}
              </Text>
              <IconButton
                icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                onPress={() => toggleBookmark(newsflash.id)}
                style={styles.bookmarkButton}
              />
            </View>
          </View>
          
          <Text variant="headlineSmall" style={styles.headline}>
            {newsflash.headline}
          </Text>
          
          {newsflash.subHeadline && (
            <Text variant="bodyMedium" style={styles.subHeadline}>
              {newsflash.subHeadline}
            </Text>
          )}
        </Card.Content>
        
        {newsflash.media && (
          <Card.Cover 
            source={{ uri: newsflash.media }} 
            style={styles.media}
            resizeMode="cover"
          />
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  justInBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  justInText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  userMeta: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontWeight: '600',
  },
  correspondent: {
    opacity: 0.5,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    opacity: 0.6,
  },
  bookmarkButton: {
    margin: 0,
  },
  headline: {
    fontWeight: 'bold',
    lineHeight: 28,
    marginBottom: 4,
  },
  subHeadline: {
    marginTop: 4,
    opacity: 0.8,
  },
  media: {
    marginTop: 12,
    height: 200,
  },
});

