import React, { useMemo } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Newsflash } from '../types';
import NewsflashCard, { CardVariant } from './NewsflashCard';
import { SPACING, LIST } from '../theme/spacing';

// Layout thresholds
const HERO_COUNT = 1;        // First item is hero
const STANDARD_COUNT = 4;    // Next 4 items are standard
const GRID_START = HERO_COUNT + STANDARD_COUNT; // Index 5+ are compact grid

// Feed item types for FlashList
type FeedItem = 
  | { type: 'hero'; newsflash: Newsflash }
  | { type: 'standard'; newsflash: Newsflash }
  | { type: 'grid-row'; newsflashes: Newsflash[] };

interface FeedListProps {
  newsflashes: Newsflash[];
  onEndReached?: () => void;
  loadingMore?: boolean;
  showActions?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// Component for rendering 2 compact cards in a row
function GridRow({ newsflashes }: { newsflashes: Newsflash[] }) {
  return (
    <View style={styles.gridRow}>
      {newsflashes.map((item) => (
        item.user && (
          <View key={item.id} style={styles.gridItem}>
            <NewsflashCard newsflash={item} user={item.user} variant="compact" />
          </View>
        )
      ))}
    </View>
  );
}

export default function FeedList({
  newsflashes,
  onEndReached,
  loadingMore,
  showActions = true,
  refreshing = false,
  onRefresh,
}: FeedListProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation('feed');

  // Transform newsflashes into feed items with different layouts
  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    
    newsflashes.forEach((item, index) => {
      if (index === 0) {
        // Hero (first item)
        items.push({ type: 'hero', newsflash: item });
      } else if (index < GRID_START) {
        // Standard (items 1-4)
        items.push({ type: 'standard', newsflash: item });
      } else {
        // Grid items (5+) - pair them up
        const gridIndex = index - GRID_START;
        if (gridIndex % 2 === 0) {
          // Start new row with this item
          const pair = [item];
          if (newsflashes[index + 1]) {
            pair.push(newsflashes[index + 1]);
          }
          items.push({ type: 'grid-row', newsflashes: pair });
        }
        // Skip odd indices as they're already paired
      }
    });
    
    return items;
  }, [newsflashes]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyHeadline}>
        {t('empty')}
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('emptySubtitle')}
      </Text>
      {showActions && (
        <View style={styles.emptyActions}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('CreateNewsflash' as never)}
            style={styles.actionButton}
          >
            {t('create', { ns: 'newsflash' })}
          </Button>
          <Button
            mode="outlined"
            icon="account-plus"
            onPress={() => navigation.navigate('AddFriend' as never)}
            style={styles.actionButton}
          >
            {t('add', { ns: 'friends' })}
          </Button>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'hero':
        if (!item.newsflash.user) return null;
        return (
          <NewsflashCard 
            newsflash={item.newsflash} 
            user={item.newsflash.user} 
            variant="hero" 
          />
        );
      case 'standard':
        if (!item.newsflash.user) return null;
        return (
          <NewsflashCard 
            newsflash={item.newsflash} 
            user={item.newsflash.user} 
            variant="standard" 
          />
        );
      case 'grid-row':
        return <GridRow newsflashes={item.newsflashes} />;
      default:
        return null;
    }
  };

  const getItemType = (item: FeedItem) => item.type;

  return (
    <FlashList
      data={feedItems}
      keyExtractor={(item, index) => {
        if (item.type === 'grid-row') {
          return `grid-${item.newsflashes.map(n => n.id).join('-')}`;
        }
        return item.newsflash.id;
      }}
      renderItem={renderItem}
      getItemType={getItemType}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
      contentContainerStyle={[
        styles.contentContainer,
        newsflashes.length === 0 && styles.emptyList,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: LIST.HORIZONTAL_PADDING,
    paddingBottom: LIST.BOTTOM_CLEARANCE,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.GIANT,
  },
  emptyHeadline: {
    fontWeight: 'bold',
    marginBottom: SPACING.SM,
  },
  emptyText: {
    opacity: 0.6,
    marginBottom: SPACING.XS,
  },
  emptySubtext: {
    opacity: 0.4,
  },
  emptyActions: {
    marginTop: SPACING.LG,
    gap: SPACING.SM + SPACING.XS,
  },
  actionButton: {
    minWidth: 180,
  },
  footerLoader: {
    paddingVertical: SPACING.LG - SPACING.XS,
    alignItems: 'center',
  },
  // Grid layout styles
  gridRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.XS,
    gap: SPACING.XS,
  },
  gridItem: {
    flex: 1,
  },
});
