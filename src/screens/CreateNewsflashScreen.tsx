import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Surface, TextInput, Button, useTheme, Text, IconButton, Card, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useData } from '../context/DataContext';
import { useNavigation } from '@react-navigation/native';
import { uploadImage, getFileInfo } from '../services/upload';
import { NewsCategory, NewsSeverity, NewsflashAudience } from '../types';
import NewsOptions from '../components/NewsOptions';
import NewsflashAudiencePicker from '../components/NewsflashAudiencePicker';

const HEADLINE_MAX = 150;
const SUBHEADLINE_MAX = 200;

// Quick headline starters
const HEADLINE_STARTERS = [
  'Just discovered...',
  'Can confirm:',
  'Breaking news from my life:',
  'Update:',
  'Plot twist:',
];

export default function CreateNewsflashScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addNewsflash, currentUser, groups } = useData();
  
  const [headline, setHeadline] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [showSubheadline, setShowSubheadline] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState<NewsCategory>('GENERAL');
  const [severity, setSeverity] = useState<NewsSeverity>('STANDARD');
  const [audience, setAudience] = useState<NewsflashAudience>('ALL_FRIENDS');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!headline.trim()) return;
    setIsSubmitting(true);
    
    try {
      let mediaUrl: string | undefined;
      if (image) {
        setUploadProgress('Uploading image...');
        const { fileName, fileType } = getFileInfo(image);
        mediaUrl = await uploadImage(image, fileName, fileType);
      }

      setUploadProgress('Filing report...');
      await addNewsflash({
        userId: currentUser.id,
        headline: headline.trim(),
        subHeadline: subHeadline.trim() || undefined,
        media: mediaUrl,
        category,
        severity,
        audience,
        groupIds: audience === 'GROUPS' ? selectedGroupIds : undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create newsflash');
      setUploadProgress('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    headline.trim().length > 0 &&
    (audience === 'ALL_FRIENDS' || selectedGroupIds.length > 0);
  const headlineRemaining = HEADLINE_MAX - headline.length;

  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Header */}
            <Text variant="headlineSmall" style={styles.title}>
              What's the story?
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Share what's happening in your world
            </Text>

            {/* Quick Starters */}
            {!headline && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.startersRow}>
                {HEADLINE_STARTERS.map((starter, idx) => (
                  <Chip
                    key={idx}
                    onPress={() => setHeadline(starter + ' ')}
                    mode="outlined"
                    compact
                    style={styles.starterChip}
                  >
                    {starter}
                  </Chip>
                ))}
              </ScrollView>
            )}

            {/* Headline Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                value={headline}
                onChangeText={setHeadline}
                mode="flat"
                style={[styles.headlineInput, { backgroundColor: 'transparent' }]}
                maxLength={HEADLINE_MAX}
                placeholder="Write your headline..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                autoFocus
              />
              <Text 
                variant="labelSmall" 
                style={[
                  styles.charCount,
                  headlineRemaining < 20 && { color: theme.colors.error }
                ]}
              >
                {headlineRemaining}
              </Text>
            </View>

            {/* Subheadline Toggle & Input */}
            {!showSubheadline ? (
              <Button
                mode="text"
                icon="plus"
                onPress={() => setShowSubheadline(true)}
                compact
                style={styles.addSubheadline}
              >
                Add details
              </Button>
            ) : (
              <View style={styles.inputWrapper}>
                <TextInput
                  value={subHeadline}
                  onChangeText={setSubHeadline}
                  mode="flat"
                  style={[styles.subheadlineInput, { backgroundColor: 'transparent' }]}
                  maxLength={SUBHEADLINE_MAX}
                  placeholder="Add more context..."
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  multiline
                />
                <Text variant="labelSmall" style={styles.charCount}>
                  {SUBHEADLINE_MAX - subHeadline.length}
                </Text>
              </View>
            )}

            {/* Image Section */}
            <View style={styles.mediaSection}>
              {image ? (
                <View style={styles.imagePreview}>
                  <Card style={styles.imageCard}>
                    <Card.Cover source={{ uri: image }} style={styles.imageCover} />
                  </Card>
                  <IconButton
                    icon="close-circle"
                    size={24}
                    onPress={() => setImage(null)}
                    style={styles.removeImageBtn}
                    iconColor="white"
                  />
                </View>
              ) : (
                <Button mode="outlined" icon="camera" onPress={pickImage} style={styles.addImageBtn}>
                  Add photo
                </Button>
              )}
            </View>

            {/* Category & Severity Options */}
            <NewsOptions
              category={category}
              severity={severity}
              onCategoryChange={setCategory}
              onSeverityChange={setSeverity}
            />

            <NewsflashAudiencePicker
              groups={groups}
              audience={audience}
              setAudience={setAudience}
              selectedGroupIds={selectedGroupIds}
              setSelectedGroupIds={setSelectedGroupIds}
            />

            {/* Progress */}
            {uploadProgress ? (
              <Text variant="bodySmall" style={styles.progress}>{uploadProgress}</Text>
            ) : null}
          </View>
        </ScrollView>

        {/* Bottom Actions - Fixed */}
        <View style={[
          styles.bottomBar, 
          { 
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: Math.max(16, insets.bottom),
          }
        ]}>
          <Button mode="text" onPress={() => navigation.goBack()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            icon="send"
          >
            Publish
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { padding: 16, paddingBottom: 100 },
  title: { fontWeight: 'bold', marginBottom: 4 },
  subtitle: { opacity: 0.6, marginBottom: 16 },
  startersRow: { marginBottom: 16 },
  starterChip: { marginRight: 8 },
  inputWrapper: { marginBottom: 8 },
  headlineInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 0,
    minHeight: 60,
  },
  subheadlineInput: {
    fontSize: 16,
    paddingHorizontal: 0,
    minHeight: 50,
  },
  charCount: { textAlign: 'right', opacity: 0.5, marginTop: -4 },
  addSubheadline: { alignSelf: 'flex-start', marginBottom: 16 },
  mediaSection: { marginBottom: 16 },
  imagePreview: { position: 'relative' },
  imageCard: { borderRadius: 12, overflow: 'hidden' },
  imageCover: { height: 180 },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  addImageBtn: { borderStyle: 'dashed' },
  progress: { textAlign: 'center', opacity: 0.7, marginTop: 8 },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
});
