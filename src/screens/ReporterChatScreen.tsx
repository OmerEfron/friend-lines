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
  Avatar,
  Chip,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { startInterview, sendInterviewMessage, getInterview } from '../services/reporter';
import { LiveHeader, DraftPreview } from '../components/reporter';
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
  const flatListRef = useRef<FlatList>(null);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

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

  const handleWrapUp = async () => {
    if (!session || isSending) return;
    setIsSending(true);
    try {
      const updatedSession = await sendInterviewMessage(session.id, "That's all I have for now.");
      setSession(updatedSession);
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('errorGeneric'));
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: InterviewMessage }) => {
    const isAI = item.role === 'assistant';
    return (
      <View style={[styles.messageRow, isAI ? styles.aiRow : styles.userRow]}>
        {isAI && (
          <View style={styles.avatarContainer}>
            <Avatar.Icon
              size={36}
              icon="microphone-variant"
              style={[styles.avatar, { backgroundColor: theme.colors.error }]}
              color={theme.colors.onError}
            />
            <View style={[styles.liveDot, { backgroundColor: '#4caf50' }]} />
          </View>
        )}
        <Surface
          style={[
            styles.bubble,
            isAI
              ? [styles.aiBubble, { backgroundColor: theme.colors.surfaceVariant }]
              : [styles.userBubble, { backgroundColor: theme.colors.primaryContainer }],
          ]}
          elevation={isAI ? 0 : 1}
        >
          <Text style={[styles.senderLabel, { color: isAI ? theme.colors.error : theme.colors.primary }]}>
            {isAI ? t('senderScoop') : t('senderYou')}
          </Text>
          <Text style={styles.messageText}>
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
      <DraftPreview
        session={session}
        draft={session.draftNewsflash}
        onSessionUpdate={setSession}
      />
    );
  }

  return (
    <Surface style={styles.container}>
      <LiveHeader
        onBack={() => navigation.goBack()}
        coveredDimensions={session?.coveredDimensions || []}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
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
                <ActivityIndicator size="small" color={theme.colors.error} />
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
          {session?.status === 'active' && !isSending && (
            <View style={styles.quickActions}>
              <Chip icon="check" onPress={handleWrapUp} style={styles.quickChip} textStyle={styles.chipText}>
                {t('thatsAll')}
              </Chip>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('inputPlaceholder')}
              mode="outlined"
              style={styles.input}
              disabled={isSending || session?.status !== 'active'}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              dense
            />
            <IconButton
              icon="send"
              mode="contained"
              onPress={handleSend}
              disabled={!inputText.trim() || isSending || session?.status !== 'active'}
            />
          </View>
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
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  aiRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  avatarContainer: { marginRight: 8, alignItems: 'center' },
  avatar: {},
  liveDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 12 },
  aiBubble: { borderTopLeftRadius: 0 },
  userBubble: { borderTopRightRadius: 0 },
  senderLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 4, letterSpacing: 0.5 },
  messageText: { fontSize: 15, lineHeight: 22 },
  typingContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, marginLeft: 8 },
  typingText: { marginLeft: 8, opacity: 0.7, fontStyle: 'italic', fontSize: 12 },
  inputContainer: { padding: 8, borderTopWidth: 1 },
  quickActions: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  quickChip: { backgroundColor: '#f5f5f5' },
  chipText: { fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginRight: 8 },
});
