import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Newsflash, User } from '../types';

interface NewsflashCardProps {
  newsflash: Newsflash;
  user: User;
}

export default function NewsflashCard({ newsflash, user }: NewsflashCardProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.time}>{formatTime(newsflash.timestamp)}</Text>
      </View>
      
      <Text style={styles.headline}>{newsflash.headline}</Text>
      
      {newsflash.subHeadline && (
        <Text style={styles.subHeadline}>{newsflash.subHeadline}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  headline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    lineHeight: 28,
    marginBottom: 4,
  },
  subHeadline: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 4,
  },
});

