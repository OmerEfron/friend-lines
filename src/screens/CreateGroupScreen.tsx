import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Surface, TextInput, Button, useTheme, Text, Checkbox, List } from 'react-native-paper';
import { useData } from '../context/DataContext';
import { useNavigation } from '@react-navigation/native';

export default function CreateGroupScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addGroup, users, friendships, currentUser } = useData();
  
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const friends = useMemo(() => {
    const friendIds = friendships
      .filter(f => f.userId === currentUser.id)
      .map(f => f.friendId);
    
    return users.filter(u => friendIds.includes(u.id));
  }, [users, friendships, currentUser.id]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    addGroup({
      name: groupName.trim(),
      userIds: selectedUserIds,
    });

    setIsSubmitting(false);
    navigation.goBack();
  };

  const isValid = groupName.trim().length > 0 && selectedUserIds.length > 0;

  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text variant="titleLarge" style={styles.title}>
              Create Group
            </Text>
            
            <TextInput
              label="Group Name *"
              value={groupName}
              onChangeText={setGroupName}
              mode="outlined"
              style={styles.input}
              maxLength={50}
              placeholder="Enter group name..."
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Select Friends ({selectedUserIds.length})
            </Text>

            {friends.map(friend => (
              <List.Item
                key={friend.id}
                title={friend.name}
                description={`@${friend.username}`}
                onPress={() => toggleUser(friend.id)}
                left={() => (
                  <Checkbox
                    status={selectedUserIds.includes(friend.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleUser(friend.id)}
                  />
                )}
                style={styles.listItem}
              />
            ))}

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              >
                Create
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  listItem: {
    paddingVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    minWidth: 100,
  },
});

