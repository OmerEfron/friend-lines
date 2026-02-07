import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FeedList from '../components/FeedList';
import NewsTicker from '../components/NewsTicker';
import NewsHeader from '../components/NewsHeader';
import CategoryFilter from '../components/CategoryFilter';
import NotificationBanner from '../components/NotificationBanner';
import { useData } from '../context/DataContext';
import { useA11y } from '../utils/a11y';
import { mediumImpact } from '../utils/haptics';
import { FAB as FAB_SPACING } from '../theme/spacing';
import { NewsCategory } from '../types';

export default function MainFeedScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation('feed');
  const { labels: a11yLabels } = useA11y();
  const { newsflashes, loadMoreNewsflashes, loadingMore, hasMore, refreshNewsflashes } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNewsflashes();
    setRefreshing(false);
  };

  // Check for breaking news and show notification banner
  const latestBreaking = useMemo(() => {
    return newsflashes.find(n => n.severity === 'BREAKING');
  }, [newsflashes]);

  // Show notification for breaking news (only once per session)
  const handleBreakingNotification = useCallback(() => {
    if (latestBreaking && !notificationVisible) {
      setNotificationMessage(latestBreaking.headline);
      setNotificationVisible(true);
    }
  }, [latestBreaking, notificationVisible]);

  // Filter newsflashes by search query and category
  const filteredNewsflashes = useMemo(() => {
    let filtered = [...newsflashes].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    // Apply category filter
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.headline.toLowerCase().includes(query) ||
        (n.subHeadline && n.subHeadline.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [newsflashes, searchQuery, selectedCategory]);

  // Only enable infinite scroll when not searching/filtering
  const handleEndReached = !searchQuery.trim() && selectedCategory === 'ALL' && hasMore
    ? loadMoreNewsflashes
    : undefined;

  return (
    <Surface style={styles.container}>
      {/* Breaking News Notification Banner */}
      <NotificationBanner
        message={notificationMessage}
        visible={notificationVisible}
        onDismiss={() => setNotificationVisible(false)}
        onPress={() => {
          setNotificationVisible(false);
          // Could navigate to the breaking story
        }}
      />
      
      {/* Branded Header with Search */}
      <NewsHeader
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onNotificationsPress={handleBreakingNotification}
      />
      
      {/* Breaking News Ticker */}
      <NewsTicker newsflashes={filteredNewsflashes} />
      
      {/* Category Filter Bar */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      
      {/* News Feed */}
      <FeedList
        newsflashes={filteredNewsflashes}
        onEndReached={handleEndReached}
        loadingMore={loadingMore}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      
      {/* FABs */}
      <FAB
        icon="microphone"
        style={styles.fabReporter}
        onPress={() => {
          mediumImpact();
          navigation.navigate('ReporterChat' as never);
        }}
        accessibilityLabel={t('aiReporterButton')}
        size="small"
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          mediumImpact();
          navigation.navigate('CreateNewsflash' as never);
        }}
        accessibilityLabel={a11yLabels.CREATE_NEWSFLASH}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: FAB_SPACING.RIGHT,
    bottom: FAB_SPACING.BOTTOM,
  },
  fabReporter: {
    position: 'absolute',
    right: FAB_SPACING.RIGHT,
    bottom: FAB_SPACING.BOTTOM + 70,
  },
});
