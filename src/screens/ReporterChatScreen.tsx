import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  IconButton,
  useTheme,
  ActivityIndicator,
  Card,
  Button,
  Avatar,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import {
  startInterview,
  sendInterviewMessage,
  getInterview,
} from '../services/reporter';
import type { InterviewSession, InterviewMessage, InterviewType, SupportedLanguage } from '../types';

type ReporterChatParams = {
  ReporterChat: { sessionId?: string; type?: InterviewType };
};

export default function ReporterChatScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ReporterChatParams, 'ReporterChat'>>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation('reporter');
  const { addNewsflash, currentUser } = useData();
  const flatListRef = useRef<FlatList>(null);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [tweakMode, setTweakMode] = useState(false);
  const [tweakText, setTweakText] = useState('');

  // Initialize or resume session
  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      if (route.params?.sessionId) {
        const existingSession = await getInterview(route.params.sessionId);
        setSession(existingSession);
      } else {
        // Get current language and ensure it's a supported language
        const currentLang = i18n.language as SupportedLanguage;
        const language: SupportedLanguage = ['en', 'he', 'es'].includes(currentLang) ? currentLang : 'en';
        const newSession = await startInterview(route.params?.type || 'daily', language);
        setSession(newSession);
      }
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('errorGeneric'));
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !session || isSending) return;

    const message = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const updatedSession = await sendInterviewMessage(session.id, message);
      setSession(updatedSession);
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('errorGeneric'));
    } finally {
      setIsSending(false);
    }
  };

  const handlePublish = async () => {
    if (!session?.draftNewsflash) return;

    try {
      await addNewsflash({
        userId: currentUser.id,
        headline: session.draftNewsflash.headline,
        subHeadline: session.draftNewsflash.subHeadline,
        category: session.draftNewsflash.category,
        severity: session.draftNewsflash.severity,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('errorGeneric'));
    }
  };

  const handleTweak = async () => {
    if (!tweakText.trim() || !session) return;

    setIsSending(true);
    try {
      const updatedSession = await sendInterviewMessage(
        session.id,
        `Please regenerate the newsflash with this feedback: ${tweakText.trim()}`
      );
      setSession(updatedSession);
      setTweakMode(false);
      setTweakText('');
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('errorGeneric'));
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: InterviewMessage; index: number }) => {
    const isAI = item.role === 'assistant';
    return (
      <View style={[styles.messageRow, isAI ? styles.aiRow : styles.userRow]}>
        {isAI && (
          <Avatar.Icon
            size={32}
            icon="microphone"
            style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
          />
        )}
        <Surface
          style={[
            styles.bubble,
            isAI
              ? [styles.aiBubble, { backgroundColor: theme.colors.surfaceVariant }]
              : [styles.userBubble, { backgroundColor: theme.colors.primary }],
          ]}
          elevation={1}
        >
          <Text
            style={[styles.messageText, !isAI && { color: theme.colors.onPrimary }]}
          >
            {item.content}
          </Text>
        </Surface>
      </View>
    );
  };

  // Filter out system messages for display
  const displayMessages = session?.messages.filter((m) => m.role !== 'system') || [];

  if (isLoading) {
    return (
      <Surface style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>{t('starting')}</Text>
      </Surface>
    );
  }

  // Show draft preview when completed
  if (session?.status === 'completed' && session.draftNewsflash) {
    return (
      <Surface style={styles.container}>
        <View style={[styles.draftContainer, { paddingBottom: insets.bottom + 16 }]}>
          <Text variant="headlineSmall" style={styles.draftTitle}>
            {t('draftReady')}
          </Text>
          <Card style={styles.draftCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.headline}>
                {session.draftNewsflash.headline}
              </Text>
              <Text variant="bodyMedium" style={styles.subheadline}>
                {session.draftNewsflash.subHeadline}
              </Text>
              <View style={styles.metaRow}>
                <Text variant="labelSmall" style={styles.metaText}>
                  {session.draftNewsflash.category} • {session.draftNewsflash.severity}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {tweakMode ? (
            <View style={styles.tweakContainer}>
              <TextInput
                value={tweakText}
                onChangeText={setTweakText}
                placeholder={t('tweakPlaceholder')}
                mode="outlined"
                style={styles.tweakInput}
                multiline
              />
              <View style={styles.tweakActions}>
                <Button mode="text" onPress={() => setTweakMode(false)}>
                  {t('cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleTweak}
                  loading={isSending}
                  disabled={!tweakText.trim() || isSending}
                >
                  {t('regenerate')}
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.draftActions}>
              <Button mode="outlined" onPress={() => navigation.goBack()}>
                {t('discard')}
              </Button>
              <Button mode="text" onPress={() => setTweakMode(true)}>
                {t('tweakIt')}
              </Button>
              <Button mode="contained" onPress={handlePublish} icon="send">
                {t('publish')}
              </Button>
            </View>
          )}
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={
            isSending ? (
              <View style={styles.typingContainer}>
                <ActivityIndicator size="small" />
                <Text style={styles.typingText}>{t('typing')}</Text>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 8), borderTopColor: theme.colors.outlineVariant },
          ]}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('inputPlaceholder')}
            mode="outlined"
            style={styles.input}
            disabled={isSending || session?.status !== 'active'}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <IconButton
            icon="send"
            mode="contained"
            onPress={handleSend}
            disabled={!inputText.trim() || isSending || session?.status !== 'active'}
          />
        </View>
      </KeyboardAvoidingView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, opacity: 0.7 },
  keyboardView: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 8 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  avatar: { marginRight: 8 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  aiBubble: { borderBottomLeftRadius: 4 },
  userBubble: { borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  typingContainer: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  typingText: { marginLeft: 8, opacity: 0.7, fontStyle: 'italic' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  input: { flex: 1, marginRight: 8 },
  draftContainer: { flex: 1, padding: 16, justifyContent: 'center' },
  draftTitle: { textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  draftCard: { marginBottom: 24 },
  headline: { fontWeight: 'bold', marginBottom: 8 },
  subheadline: { opacity: 0.8, marginBottom: 12 },
  metaRow: { flexDirection: 'row' },
  metaText: { opacity: 0.6 },
  draftActions: { flexDirection: 'row', justifyContent: 'space-between' },
  tweakContainer: { marginTop: 16 },
  tweakInput: { marginBottom: 12 },
  tweakActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
