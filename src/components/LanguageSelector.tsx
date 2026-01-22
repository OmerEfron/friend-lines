import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, List, useTheme, Text, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../i18n';

interface LanguageSelectorProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function LanguageSelector({ visible, onDismiss }: LanguageSelectorProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLanguage || 'en');

  // Sync selectedLang when currentLanguage changes
  useEffect(() => {
    if (currentLanguage && currentLanguage in supportedLanguages) {
      setSelectedLang(currentLanguage);
    }
  }, [currentLanguage, supportedLanguages]);

  const handleSelect = async (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    await changeLanguage(lang);
    onDismiss();
  };

  const languageEntries = Object.entries(supportedLanguages) as [
    SupportedLanguage,
    { name: string; nativeName: string; isRTL: boolean }
  ][];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text variant="titleLarge" style={styles.title}>
          {t('profile.changeLanguage')}
        </Text>

        <RadioButton.Group
          value={selectedLang}
          onValueChange={(value) => handleSelect(value as SupportedLanguage)}
        >
          {languageEntries.map(([code, lang]) => (
            <List.Item
              key={code}
              title={lang.nativeName}
              description={lang.name}
              onPress={() => handleSelect(code)}
              left={() => (
                <View style={styles.radioContainer}>
                  <RadioButton value={code} />
                </View>
              )}
              right={() =>
                lang.isRTL ? (
                  <View style={styles.rtlBadge}>
                    <MaterialCommunityIcons
                      name="format-textdirection-r-to-l"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                      RTL
                    </Text>
                  </View>
                ) : null
              }
              style={[
                styles.listItem,
                currentLanguage === code && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
            />
          ))}
        </RadioButton.Group>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  radioContainer: {
    justifyContent: 'center',
  },
  listItem: {
    borderRadius: 8,
    marginVertical: 2,
  },
  rtlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
});

