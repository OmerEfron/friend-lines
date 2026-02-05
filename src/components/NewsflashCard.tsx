import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, I18nManager } from 'react-native';
import { Card, Text, Avatar, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Newsflash, User, NewsCategory } from '../types';
import { useBookmarks } from '../context/BookmarksContext';
import { useA11y, HIT_SLOP_48 } from '../utils/a11y';
import { lightImpact } from '../utils/haptics';

// Detect if text contains RTL characters (Hebrew, Arabic, etc.)
const isRTLText = (text: string): boolean => {
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/;
  return rtlRegex.test(text);
};

// Category icons for display
const CATEGORY_ICONS: Record<NewsCategory, string> = {
  GENERAL: '📰', LIFESTYLE: '🏠', ENTERTAINMENT: '🎬',
  SPORTS: '🏃', FOOD: '🍽️', TRAVEL: '✈️', OPINION: '💬',
};

interface NewsflashCardProps {
  newsflash: Newsflash;
  user: User;
}

export default function NewsflashCard({ newsflash, user }: NewsflashCardProps) {
  const theme = useTheme();
  const { t } = useTranslation('newsflash');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { labels: a11yLabels, hints: a11yHints } = useA11y();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isBreaking = newsflash.severity === 'BREAKING';
  const isDeveloping = newsflash.severity === 'DEVELOPING';
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  const getTimeText = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return t('daysAgo', { count: days });
    if (hours > 0) return t('hoursAgo', { count: hours });
    if (minutes > 0) return t('minutesAgo', { count: minutes });
    return t('justNow');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const bookmarked = isBookmarked(newsflash.id);
  const timeText = getTimeText(newsflash.timestamp);
  const categoryIcon = newsflash.category ? CATEGORY_ICONS[newsflash.category] : null;

  const cardStyle = [
    styles.card,
    isBreaking && { borderLeftWidth: 4, borderLeftColor: theme.colors.error },
    isDeveloping && { borderLeftWidth: 4, borderLeftColor: '#FFA000' },
  ];

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={cardStyle} mode="contained">
        <Card.Content>
          {/* Severity Badge */}
          {isBreaking && (
            <View style={[styles.severityBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.severityText}>🔴 BREAKING</Text>
            </View>
          )}
          {isDeveloping && (
            <View style={[styles.severityBadge, { backgroundColor: '#FFA000' }]}>
              <Text style={styles.severityText}>📡 DEVELOPING</Text>
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
                  {t('correspondent', { ns: 'profile' })}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              {categoryIcon && <Text style={styles.categoryIcon}>{categoryIcon}</Text>}
              <Text variant="labelSmall" style={styles.time}>{timeText}</Text>
              <IconButton
                icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                onPress={() => {
                  lightImpact();
                  toggleBookmark(newsflash.id);
                }}
                style={styles.bookmarkButton}
                accessibilityLabel={bookmarked ? a11yLabels.BOOKMARK_REMOVE : a11yLabels.BOOKMARK_ADD}
                accessibilityHint={bookmarked ? a11yHints.BOOKMARK_REMOVE : a11yHints.BOOKMARK_ADD}
                accessibilityState={{ selected: bookmarked }}
              />
            </View>
          </View>
          
          <Text 
            variant="headlineSmall" 
            style={[
              styles.headline,
              isRTLText(newsflash.headline) && styles.rtlText
            ]}
          >
            {newsflash.headline}
          </Text>
          
          {newsflash.subHeadline && (
            <Text 
              variant="bodyMedium" 
              style={[
                styles.subHeadline,
                isRTLText(newsflash.subHeadline) && styles.rtlText
              ]}
            >
              {newsflash.subHeadline}
            </Text>
          )}
        </Card.Content>
        
        {newsflash.media && (
          <Card.Cover source={{ uri: newsflash.media }} style={styles.media} resizeMode="cover" />
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  severityText: {
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
  categoryIcon: {
    fontSize: 14,
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
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  media: {
    marginTop: 12,
    height: 200,
  },
});

