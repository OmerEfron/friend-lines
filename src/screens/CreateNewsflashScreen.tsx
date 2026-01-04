import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Surface, TextInput, Button, useTheme, Text, IconButton, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useData } from '../context/DataContext';
import { useNavigation } from '@react-navigation/native';
import { uploadImage, getFileInfo } from '../services/upload';

export default function CreateNewsflashScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addNewsflash, currentUser } = useData();
  
  const [headline, setHeadline] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!headline.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      let mediaUrl: string | undefined = undefined;

      // Upload image if one was selected
      if (image) {
        setUploadProgress('Uploading image...');
        const { fileName, fileType } = getFileInfo(image);
        mediaUrl = await uploadImage(image, fileName, fileType);
      }

      setUploadProgress('Creating newsflash...');
      await addNewsflash({
        userId: currentUser.id,
        headline: headline.trim(),
        subHeadline: subHeadline.trim() || undefined,
        media: mediaUrl,
      });

      setUploadProgress('');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create newsflash:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create newsflash'
      );
      setUploadProgress('');
    } finally {
      setIsSubmitting(false);
    }
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

            <View style={styles.imageSection}>
              {image ? (
                <View style={styles.imagePreview}>
                  <Card style={styles.imageCard}>
                    <Card.Cover source={{ uri: image }} />
                    <IconButton
                      icon="close-circle"
                      size={28}
                      onPress={removeImage}
                      style={styles.removeImageButton}
                      iconColor={theme.colors.error}
                    />
                  </Card>
                </View>
              ) : (
                <Button
                  mode="outlined"
                  icon="image-plus"
                  onPress={pickImage}
                  style={styles.imageButton}
                >
                  Add Image
                </Button>
              )}
            </View>

            {uploadProgress ? (
              <Text variant="bodySmall" style={styles.uploadProgress}>
                {uploadProgress}
              </Text>
            ) : null}

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
                Report
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
  imageSection: {
    marginBottom: 16,
  },
  imageButton: {
    borderStyle: 'dashed',
  },
  imagePreview: {
    position: 'relative',
  },
  imageCard: {
    overflow: 'hidden',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  uploadProgress: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 12,
  },
});

