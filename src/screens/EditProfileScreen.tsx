import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Surface,
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

interface EditProfileScreenProps {
  user: User;
  onUpdate: (data: {
    name: string;
    username: string;
    avatar?: string;
  }) => Promise<void>;
}

export default function EditProfileScreen({
  user,
  onUpdate,
}: EditProfileScreenProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    setError('');
    setSuccess(false);

    if (!name.trim() || !username.trim()) {
      setError('Name and username are required');
      return;
    }

    setLoading(true);
    try {
      await onUpdate({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        avatar: avatar.trim() || undefined,
      });
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
    avatar !== (user.avatar || '');

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

              <TextInput
                label="Avatar URL (optional)"
                value={avatar}
                onChangeText={setAvatar}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                disabled={loading}
                placeholder="https://example.com/avatar.jpg"
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
});


