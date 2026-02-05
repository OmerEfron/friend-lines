import React, { useState } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Surface, List, useTheme, FAB } from 'react-native-paper';

// Estimated height of a group list item
const ESTIMATED_ITEM_SIZE = 60;
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import { Group } from '../types';
import { mediumImpact, lightImpact } from '../utils/haptics';
import { SPACING, LIST, FAB as FAB_SPACING } from '../theme/spacing';

type GroupStackParamList = {
  GroupsList: undefined;
  GroupFeed: { group: Group };
};

type NavigationProp = NativeStackNavigationProp<GroupStackParamList, 'GroupsList'>;

export default function GroupsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { t } = useTranslation();
  const { groups, refreshGroups } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    lightImpact();
    setRefreshing(true);
    await refreshGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (group: Group) => {
    lightImpact();
    navigation.navigate('GroupFeed', { group });
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <List.Item
      title={item.name}
      description={t('groups.members', { count: item.userIds.length })}
      left={(props) => (
        <List.Icon 
          {...props} 
          icon="account-group" 
          color={theme.colors.primary}
        />
      )}
      right={(props) => <List.Icon {...props} icon="chevron-right" />}
      onPress={() => handleGroupPress(item)}
      style={styles.listItem}
    />
  );

  return (
    <Surface style={styles.container}>
      <FlashList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContainer}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          mediumImpact();
          navigation.navigate('CreateGroup' as never);
        }}
        accessibilityLabel="Create new group"
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: LIST.VERTICAL_PADDING,
    paddingBottom: LIST.BOTTOM_CLEARANCE,
  },
  listItem: {
    paddingVertical: SPACING.XS,
  },
  fab: {
    position: 'absolute',
    right: FAB_SPACING.RIGHT,
    bottom: FAB_SPACING.BOTTOM,
  },
});

