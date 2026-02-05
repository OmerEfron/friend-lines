import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Avatar, useTheme, Switch, List, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import { useAppTheme } from '../context/ThemeContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  const { isDark, toggleTheme } = useAppTheme();
  const { newsflashes, currentUser, friends } = useData();
  const { bookmarkedIds } = useBookmarks();
  const { logout } = useAuth();
  const { currentLanguage, supportedLanguages } = useLanguage();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const userNewsflashCount = useMemo(() => {
    return newsflashes.filter((n) => n.userId === currentUser.id).length;
  }, [newsflashes, currentUser.id]);

  const friendsCount = friends.length;

  // Load pending requests count
  React.useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await fetch(
          `${require('../config/api').apiConfig.baseUrl}/friend-requests/received`,
          {
            headers: {
              Authorization: `Bearer ${await require('../services/auth').getToken()}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPendingRequestsCount(data.requests?.length || 0);
        }
      } catch (error) {
        console.error('Failed to load pending requests count:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadPendingCount();
    });

    loadPendingCount();

    return unsubscribe;
  }, [navigation]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Press Pass Card */}
        <Card style={[styles.pressPass, { borderColor: theme.colors.primary }]} mode="outlined">
          <View style={styles.pressPassHeader}>
            <Text style={[styles.pressPassLabel, { color: theme.colors.primary }]}>
              {t('pressCredentials')}
            </Text>
            <View style={[styles.activeBadge, { backgroundColor: theme.colors.tertiary }]}>
              <Text style={styles.activeBadgeText}>{t('active')}</Text>
            </View>
          </View>

          <View style={styles.pressPassContent}>
            <Avatar.Text
              size={72}
              label={getInitials(currentUser.name)}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.pressPassInfo}>
              <Text variant="headlineSmall" style={styles.name}>
                {currentUser.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                @{currentUser.username}
              </Text>
              <View style={[styles.correspondentBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialCommunityIcons
                  name="account-tie"
                  size={14}
                  color={theme.colors.onSecondaryContainer}
                />
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSecondaryContainer, fontWeight: '600' }}
                >
                  {t('correspondent')}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderTopColor: theme.colors.outlineVariant }]}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {userNewsflashCount}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('reportsFiled')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {friendsCount}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('network')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={styles.statItem}>
              <Text
                variant="headlineMedium"
                style={[
                  styles.statNumber,
                  { color: pendingRequestsCount > 0 ? theme.colors.error : theme.colors.primary },
                ]}
              >
                {pendingRequestsCount}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('pending')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Assignment Desk Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {t('assignmentDesk')}
          </Text>
          <Card mode="contained" style={styles.menuCard}>
            <List.Item
              title={t('filedReports')}
              description={t('newsflashCount', { count: userNewsflashCount })}
              left={() => (
                <MaterialCommunityIcons
                  name="newspaper-variant-multiple"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              )}
              onPress={() => navigation.navigate('UserFeed' as never)}
            />
            <List.Item
              title={t('archives')}
              description={t('bookmarkedCount', { count: bookmarkedIds.length })}
              left={() => (
                <MaterialCommunityIcons
                  name="archive"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              )}
              onPress={() => navigation.navigate('Saved' as never)}
            />
          </Card>
        </View>

        {/* Network Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {t('correspondentNetwork')}
          </Text>
          <Card mode="contained" style={styles.menuCard}>
            <List.Item
              title={t('networkRequests')}
              description={
                pendingRequestsCount > 0
                  ? t('pendingCount', { count: pendingRequestsCount })
                  : t('noPendingRequests')
              }
              left={() => (
                <MaterialCommunityIcons
                  name="account-clock"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <View style={styles.rightContainer}>
                  {pendingRequestsCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                      <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
                    </View>
                  )}
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                </View>
              )}
              onPress={() => navigation.navigate('FriendRequests' as never)}
            />
            <List.Item
              title={t('myCorrespondents')}
              description={t('inNetwork', { count: friendsCount })}
              left={() => (
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              )}
              onPress={() => navigation.navigate('FriendsList' as never)}
            />
            <List.Item
              title={t('recruitCorrespondents')}
              description={t('expandNetwork')}
              left={() => (
                <MaterialCommunityIcons
                  name="account-plus"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              )}
              onPress={() => navigation.navigate('AddFriend' as never)}
            />
          </Card>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {t('system')}
          </Text>
          <Card mode="contained" style={styles.menuCard}>
            <List.Item
              title={t('updatePressPass')}
              description={t('editCredentials')}
              left={() => (
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              )}
              onPress={() => navigation.navigate('EditProfile' as never)}
            />
            <List.Item
              title={t('nightEdition')}
              description={isDark ? t('enabled') : t('disabled')}
              left={() => (
                <MaterialCommunityIcons
                  name={isDark ? 'weather-night' : 'white-balance-sunny'}
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => <Switch value={isDark} onValueChange={toggleTheme} color={theme.colors.primary} />}
            />
            <List.Item
              title={t('language')}
              description={supportedLanguages[currentLanguage]?.nativeName || currentLanguage}
              left={() => (
                <MaterialCommunityIcons
                  name="translate"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              )}
              onPress={() => setShowLanguageSelector(true)}
            />
            <List.Item
              title={t('resignCommission')}
              description={t('signOut')}
              left={() => (
                <MaterialCommunityIcons
                  name="exit-run"
                  size={24}
                  color={theme.colors.error}
                  style={styles.listIcon}
                />
              )}
              onPress={logout}
              titleStyle={{ color: theme.colors.error }}
            />
          </Card>
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <LanguageSelector
        visible={showLanguageSelector}
        onDismiss={() => setShowLanguageSelector(false)}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  pressPass: {
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  pressPassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pressPassLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pressPassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  pressPassInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: '700',
  },
  correspondentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 12,
  },
  listIcon: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
