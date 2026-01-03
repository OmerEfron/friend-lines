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
} from 'react-native-paper';

interface SignupScreenProps {
  onSignup: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onNavigateToLogin: () => void;
}

export default function SignupScreen({
  onSignup,
  onNavigateToLogin,
}: SignupScreenProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    setError('');

    // Validation
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await onSignup({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text variant="displaySmall" style={styles.title}>
              Create Account
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Join Friendlines today
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
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                disabled={loading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                disabled={loading}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                disabled={loading}
              />

              {error ? (
                <HelperText type="error" visible={true}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleSignup}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Sign Up
              </Button>

              <Button
                mode="text"
                onPress={onNavigateToLogin}
                style={styles.linkButton}
                disabled={loading}
              >
                Already have an account? Sign In
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
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 8,
  },
});




