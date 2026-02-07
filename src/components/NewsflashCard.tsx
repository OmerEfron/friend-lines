import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Newsflash, User, NewsCategory } from '../types';
import { useBookmarks } from '../context/BookmarksContext';
import { useA11y } from '../utils/a11y';
import { lightImpact } from '../utils/haptics';
import { SPACING } from '../theme/spacing';

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

export type CardVariant = 'hero' | 'standard';

interface NewsflashCardProps {
  newsflash: Newsflash;
  user: User;
  variant?: CardVariant;
}

export default function NewsflashCard({ 
  newsflash, 
  user, 
  variant = 'standard' 
}: NewsflashCardProps) {
  const theme = useTheme();
  const { t } = useTranslation('newsflash');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { labels: a11yLabels, hints: a11yHints } = useA11y();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isHero = variant === 'hero';
  const isBreaking = newsflash.severity === 'BREAKING';
  const isDeveloping = newsflash.severity === 'DEVELOPING';
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  // News-style time format (e.g., "14:30" or date for older)
  const getTimeText = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const bookmarked = isBookmarked(newsflash.id);
  const timeText = getTimeText(newsflash.timestamp);
  const categoryIcon = newsflash.category ? CATEGORY_ICONS[newsflash.category] : null;

  // Subtle footer with time and reporter name (news magazine style)
  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.metaLeft}>
        {categoryIcon && <Text style={styles.categoryIcon}>{categoryIcon}</Text>}
        <Text style={[styles.metaText, { color: theme.colors.primary }]}>
          {timeText}
        </Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {user.name}
        </Text>
      </View>
      <IconButton
        icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
        size={18}
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
  );

  // Severity badge for breaking/developing news
  const renderSeverityBadge = () => {
    if (!isBreaking && !isDeveloping) return null;
    
    const badgeColor = isBreaking ? theme.colors.error : '#FFA000';
    const badgeText = isBreaking ? '🔴 BREAKING' : '📡 DEVELOPING';
    
    return (
      <View style={[styles.severityBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.severityText}>{badgeText}</Text>
      </View>
    );
  };

  // HERO VARIANT: Full-width image on top, large headline below
  if (isHero) {
    return (
      <Animated.View style={[styles.heroContainer, { opacity: fadeAnim }]}>
        <Card style={styles.heroCard} mode="elevated">
          {newsflash.media && (
            <Card.Cover 
              source={{ uri: newsflash.media }} 
              style={styles.heroImage} 
              resizeMode="cover"
            />
          )}
          <Card.Content style={styles.heroContent}>
            {renderSeverityBadge()}
            <Text 
              variant="headlineMedium" 
              style={[
                styles.heroHeadline,
                isRTLText(newsflash.headline) && styles.rtlText
              ]}
            >
              {newsflash.headline}
            </Text>
            {newsflash.subHeadline && (
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.heroSubHeadline,
                  isRTLText(newsflash.subHeadline) && styles.rtlText
                ]}
                numberOfLines={2}
              >
                {newsflash.subHeadline}
              </Text>
            )}
            {renderFooter()}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  }

  // STANDARD VARIANT: Side-by-side layout (Text Left, Image Right)
  return (
    <Animated.View style={[styles.standardContainer, { opacity: fadeAnim }]}>
      <Card style={styles.standardCard} mode="elevated">
        <View style={styles.rowContainer}>
          <View style={styles.textContainer}>
            {(isBreaking || isDeveloping) && (
              <Text style={[
                styles.liveBadgeText, 
                { color: isBreaking ? theme.colors.error : '#FFA000' }
              ]}>
                {isBreaking ? 'LIVE 🔴' : 'DEVELOPING 📡'}
              </Text>
            )}
            <Text 
              variant="titleMedium" 
              numberOfLines={3} 
              style={[
                styles.standardHeadline,
                isRTLText(newsflash.headline) && styles.rtlText
              ]}
            >
              {newsflash.headline}
            </Text>
            {renderFooter()}
          </View>
          {newsflash.media && (
            <Image 
              source={{ uri: newsflash.media }} 
              style={styles.standardImage} 
            />
          )}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Hero Variant Styles
  heroContainer: {
    marginBottom: SPACING.MD,
    marginHorizontal: SPACING.XS,
  },
  heroCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroImage: {
    height: 220,
    borderRadius: 0,
  },
  heroContent: {
    paddingTop: SPACING.MD,
    paddingBottom: SPACING.SM,
  },
  heroHeadline: {
    fontWeight: '800',
    marginTop: SPACING.XS,
    marginBottom: SPACING.XS,
    lineHeight: 32,
  },
  heroSubHeadline: {
    opacity: 0.7,
    marginBottom: SPACING.SM,
    lineHeight: 22,
  },

  // Standard Variant Styles
  standardContainer: {
    marginBottom: SPACING.XS,
    marginHorizontal: SPACING.XS,
  },
  standardCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  rowContainer: {
    flexDirection: 'row',
    padding: SPACING.SM,
    minHeight: 100,
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.SM,
    justifyContent: 'space-between',
  },
  standardImage: {
    width: 100,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  standardHeadline: {
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: SPACING.XS,
  },
  liveBadgeText: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: SPACING.XS,
  },

  // Shared Styles
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: SPACING.XS,
  },
  severityText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  metaDot: {
    fontSize: 11,
    color: '#ccc',
    marginHorizontal: 4,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  bookmarkButton: {
    margin: 0,
    width: 28,
    height: 28,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
