import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text, IconButton, useTheme, Surface } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING } from '../theme/spacing';

interface NewsHeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onNotificationsPress?: () => void;
}

export default function NewsHeader({ 
  onSearch, 
  searchQuery,
  onNotificationsPress 
}: NewsHeaderProps) {
  const theme = useTheme();
  const { t } = useTranslation('feed');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.leftSection}>
        {/* Logo */}
        <Text style={[styles.logo, { color: theme.colors.primary }]}>
          Friendlines
        </Text>
        {/* Live Indicator */}
        <View style={[styles.liveBadge, { backgroundColor: theme.colors.error }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        {isSearchExpanded ? (
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <TextInput
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={onSearch}
              autoFocus
            />
            <IconButton
              icon="close"
              size={18}
              onPress={() => {
                setIsSearchExpanded(false);
                onSearch('');
              }}
            />
          </View>
        ) : (
          <>
            <IconButton
              icon="magnify"
              size={24}
              onPress={() => setIsSearchExpanded(true)}
              iconColor={theme.colors.onSurface}
            />
            <IconButton
              icon="bell-outline"
              size={24}
              onPress={onNotificationsPress}
              iconColor={theme.colors.onSurface}
            />
          </>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingLeft: SPACING.MD,
    flex: 1,
    marginLeft: SPACING.SM,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: SPACING.XS,
  },
});
