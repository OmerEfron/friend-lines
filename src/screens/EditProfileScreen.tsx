import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  Surface,
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  Divider,
  Avatar,
  IconButton,
  Card,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../config/api';
import { uploadImage, getFileInfo } from '../services/upload';
import { A11Y_LABELS } from '../utils/a11y';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export default function EditProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  
  if (!user) {
    return null;
  }

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalAvatarUri(result.assets[0].uri);
    }
  };

  const removeAvatar = () => {
    setLocalAvatarUri(null);
    setAvatarUrl('');
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess(false);

    if (!name.trim() || !username.trim()) {
      setError('Name and username are required');
      return;
    }

    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      // Upload new avatar if one was selected
      if (localAvatarUri) {
        const { fileName, fileType } = getFileInfo(localAvatarUri);
        finalAvatarUrl = await uploadImage(localAvatarUri, fileName, fileType);
      }

      // Update profile via API
      const response = await apiCall<{ user: User }>(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          avatar: finalAvatarUrl || undefined,
        }),
      });

      // Refresh user in auth context
      await refreshUser();

      setSuccess(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    name !== user.name ||
    username !== user.username ||
    avatarUrl !== (user.avatar || '') ||
    localAvatarUri !== null;

  const displayAvatar = localAvatarUri || avatarUrl || user.avatar;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text variant="headlineMedium" style={styles.title}>
              Edit Profile
            </Text>

            <View style={styles.form}>
              <View style={styles.avatarSection}>
                {displayAvatar ? (
                  <View style={styles.avatarContainer}>
                    <Avatar.Image
                      size={80}
                      source={{ uri: displayAvatar }}
                    />
                    <IconButton
                      icon="close-circle"
                      size={24}
                      onPress={removeAvatar}
                      style={styles.removeAvatarButton}
                      iconColor={theme.colors.error}
                      accessibilityLabel="Remove avatar"
                    />
                  </View>
                ) : (
                  <Avatar.Text
                    size={80}
                    label={getInitials(name || user.name)}
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
                <Button
                  mode="outlined"
                  icon="camera"
                  onPress={pickImage}
                  style={styles.changeAvatarButton}
                  disabled={loading}
                >
                  Change Avatar
                </Button>
              </View>

              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
                disabled={loading}
              />

              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                disabled={loading}
              />

              <Divider style={styles.divider} />

              <View style={styles.infoSection}>
                <Text variant="labelLarge" style={styles.infoLabel}>
                  Email
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {user.email}
                </Text>
                <HelperText type="info" visible={true}>
                  Email cannot be changed
                </HelperText>
              </View>

              {error ? (
                <HelperText type="error" visible={true}>
                  {error}
                </HelperText>
              ) : null}

              {success ? (
                <HelperText type="info" visible={true} style={styles.success}>
                  Profile updated successfully!
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleUpdate}
                style={styles.button}
                loading={loading}
                disabled={loading || !hasChanges}
              >
                Save Changes
              </Button>

              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
              >
                Cancel
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
    flex: 1,
    padding: 24,
  },
  title: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  divider: {
    marginVertical: 8,
  },
  infoSection: {
    gap: 4,
  },
  infoLabel: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
  success: {
    color: '#4CAF50',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  removeAvatarButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  changeAvatarButton: {
    marginTop: 8,
  },
});


