import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Searchbar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FeedList from '../components/FeedList';
import NewsTicker from '../components/NewsTicker';
import { useData } from '../context/DataContext';
import { useA11y } from '../utils/a11y';
import { mediumImpact } from '../utils/haptics';
import { FAB as FAB_SPACING, SPACING } from '../theme/spacing';

export default function MainFeedScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation('feed');
  const { labels: a11yLabels } = useA11y();
  const { newsflashes, loadMoreNewsflashes, loadingMore, hasMore, refreshNewsflashes } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNewsflashes();
    setRefreshing(false);
  };

  // Backend already returns filtered feed (friends + self), just apply search
  const filteredNewsflashes = useMemo(() => {
    const sorted = [...newsflashes].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    if (!searchQuery.trim()) {
      return sorted;
    }
    
    const query = searchQuery.toLowerCase();
    return sorted.filter(n => 
      n.headline.toLowerCase().includes(query) ||
      (n.subHeadline && n.subHeadline.toLowerCase().includes(query))
    );
  }, [newsflashes, searchQuery]);

  // Only enable infinite scroll when not searching
  const handleEndReached = !searchQuery.trim() && hasMore
    ? loadMoreNewsflashes
    : undefined;

  return (
    <Surface style={styles.container}>
      <NewsTicker newsflashes={filteredNewsflashes} />
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('searchPlaceholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      <FeedList
        newsflashes={filteredNewsflashes}
        onEndReached={handleEndReached}
        loadingMore={loadingMore}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
  searchContainer: {
    padding: SPACING.SM,
    paddingBottom: 0,
  },
  searchbar: {
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    right: FAB_SPACING.RIGHT,
    bottom: FAB_SPACING.BOTTOM,
  },
});

