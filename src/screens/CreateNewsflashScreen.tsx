import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Surface, TextInput, Button, useTheme, Text } from 'react-native-paper';
import { useData } from '../context/DataContext';
import { useNavigation } from '@react-navigation/native';

export default function CreateNewsflashScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addNewsflash, currentUser } = useData();
  
  const [headline, setHeadline] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!headline.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    addNewsflash({
      userId: currentUser.id,
      headline: headline.trim(),
      subHeadline: subHeadline.trim() || undefined,
    });

    setIsSubmitting(false);
    navigation.goBack();
  };

  const isValid = headline.trim().length > 0;

  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text variant="titleLarge" style={styles.title}>
              Create Newsflash
            </Text>
            
            <TextInput
              label="Headline *"
              value={headline}
              onChangeText={setHeadline}
              mode="outlined"
              style={styles.input}
              maxLength={150}
              placeholder="What's happening?"
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              label="Subheadline (optional)"
              value={subHeadline}
              onChangeText={setSubHeadline}
              mode="outlined"
              style={styles.input}
              maxLength={200}
              placeholder="Add more details..."
              multiline
              numberOfLines={4}
            />

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
                Post
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
    marginBottom: 16,
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

