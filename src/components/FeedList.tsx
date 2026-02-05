import React from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Newsflash } from '../types';
import NewsflashCard from './NewsflashCard';
import { SPACING, LIST } from '../theme/spacing';

interface FeedListProps {
  newsflashes: Newsflash[];
  onEndReached?: () => void;
  loadingMore?: boolean;
  showActions?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
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
  const { t } = useTranslation();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyHeadline}>
        {t('feed.empty')}
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('feed.emptySubtitle')}
      </Text>
      {showActions && (
        <View style={styles.emptyActions}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('CreateNewsflash' as never)}
            style={styles.actionButton}
          >
            {t('newsflash.create')}
          </Button>
          <Button
            mode="outlined"
            icon="account-plus"
            onPress={() => navigation.navigate('AddFriend' as never)}
            style={styles.actionButton}
          >
            {t('friends.add')}
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

  return (
    <FlashList
      data={newsflashes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        // Use embedded user data from API response
        if (!item.user) return null;
        return <NewsflashCard newsflash={item} user={item.user} />;
      }}
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
});

