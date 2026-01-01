import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Searchbar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import FeedList from '../components/FeedList';
import { useData } from '../context/DataContext';

export default function MainFeedScreen() {
  const navigation = useNavigation();
  const { newsflashes, users, friendships, currentUser } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  
  const friendIds = useMemo(() => {
    return friendships
      .filter(f => f.userId === currentUser.id)
      .map(f => f.friendId);
  }, [friendships, currentUser.id]);

  const friendNewsflashes = useMemo(() => {
    const filtered = newsflashes.filter(n => friendIds.includes(n.userId));
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return filtered
        .filter(n => 
          n.headline.toLowerCase().includes(query) ||
          (n.subHeadline && n.subHeadline.toLowerCase().includes(query))
        )
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [newsflashes, friendIds, searchQuery]);

  return (
    <Surface style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search newsflashes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      <FeedList newsflashes={friendNewsflashes} users={users} />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateNewsflash' as never)}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 8,
    paddingBottom: 0,
  },
  searchbar: {
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

