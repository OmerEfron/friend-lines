import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Surface, List, useTheme, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useData } from '../context/DataContext';
import { Group } from '../types';

type GroupStackParamList = {
  GroupsList: undefined;
  GroupFeed: { group: Group };
};

type NavigationProp = NativeStackNavigationProp<GroupStackParamList, 'GroupsList'>;

export default function GroupsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { groups } = useData();

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupFeed', { group });
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <List.Item
      title={item.name}
      description={`${item.userIds.length} members`}
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
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.listContainer}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup' as never)}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 110,
  },
  listItem: {
    paddingVertical: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 106,
  },
});

