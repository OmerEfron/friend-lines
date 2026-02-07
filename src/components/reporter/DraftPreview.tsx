import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Surface, Text, TextInput, Card, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { sendInterviewMessage } from '../../services/reporter';
import type { InterviewSession, NewsflashDraft } from '../../types';

interface DraftPreviewProps {
  session: InterviewSession;
  draft: NewsflashDraft;
  onSessionUpdate: (session: InterviewSession) => void;
}

export default function DraftPreview({ session, draft, onSessionUpdate }: DraftPreviewProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation('reporter');
  const { addNewsflash, currentUser } = useData();

  const [tweakMode, setTweakMode] = useState(false);
  const [tweakText, setTweakText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handlePublish = async () => {
    try {
      await addNewsflash({
        userId: currentUser.id,
        headline: draft.headline,
        subHeadline: draft.subHeadline,
        category: draft.category,
        severity: draft.severity,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('errorGeneric'));
    }
  };

  const handleTweak = async () => {
    if (!tweakText.trim()) return;

    setIsSending(true);
    try {
      const updatedSession = await sendInterviewMessage(
        session.id,
        `Please regenerate the newsflash with this feedback: ${tweakText.trim()}`
      );
      onSessionUpdate(updatedSession);
      setTweakMode(false);
      setTweakText('');
    } catch (error) {
      Alert.alert(t('error'), error instanceof Error ? error.message : t('errorGeneric'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Surface style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <Text variant="headlineSmall" style={styles.title}>
          {t('draftReady')}
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.headline}>
              {draft.headline}
            </Text>
            <Text variant="bodyMedium" style={styles.subheadline}>
              {draft.subHeadline}
            </Text>
            <View style={styles.metaRow}>
              <Text variant="labelSmall" style={styles.metaText}>
                {draft.category} • {draft.severity}
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
          <View style={styles.actions}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  card: { marginBottom: 24 },
  headline: { fontWeight: 'bold', marginBottom: 8 },
  subheadline: { opacity: 0.8, marginBottom: 12 },
  metaRow: { flexDirection: 'row' },
  metaText: { opacity: 0.6 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  tweakContainer: { marginTop: 16 },
  tweakInput: { marginBottom: 12 },
  tweakActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
