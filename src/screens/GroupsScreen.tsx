import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { groups } from '../data/mock';
import { Group } from '../types';

export default function GroupsScreen() {
  const navigation = useNavigation();

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupFeed' as never, { group } as never);
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity 
      style={styles.groupItem}
      onPress={() => handleGroupPress(item)}
    >
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.memberCount}>{item.userIds.length} members</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  groupItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

