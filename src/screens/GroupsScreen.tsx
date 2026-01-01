import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Surface, List, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import { Group } from '../types';

export default function GroupsScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { groups } = useData();

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupFeed' as never, { group } as never);
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
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
});

