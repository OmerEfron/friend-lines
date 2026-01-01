import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, useTheme } from 'react-native-paper';
import { Newsflash, User } from '../types';

interface NewsflashCardProps {
  newsflash: Newsflash;
  user: User;
}

export default function NewsflashCard({ newsflash, user }: NewsflashCardProps) {
  const theme = useTheme();
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card style={styles.card} mode="contained">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={32} 
              label={getInitials(user.name)}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
            <Text variant="labelMedium" style={styles.username}>
              @{user.username}
            </Text>
          </View>
          <Text variant="labelSmall" style={styles.time}>
            {formatTime(newsflash.timestamp)}
          </Text>
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
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
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
  },
  username: {
    fontWeight: '600',
  },
  time: {
    opacity: 0.6,
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
});

