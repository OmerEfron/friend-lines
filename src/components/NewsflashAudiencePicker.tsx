import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Group, NewsflashAudience } from '../types';

type Props = {
  groups: Group[];
  audience: NewsflashAudience;
  setAudience: (audience: NewsflashAudience) => void;
  selectedGroupIds: string[];
  setSelectedGroupIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function NewsflashAudiencePicker({
  groups,
  audience,
  setAudience,
  selectedGroupIds,
  setSelectedGroupIds,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation('creation');

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={styles.title}>{t('audience.title')}</Text>
      <View style={styles.row}>
        <Chip
          selected={audience === 'ALL_FRIENDS'}
          onPress={() => setAudience('ALL_FRIENDS')}
          mode="outlined"
          compact
        >
          {t('audience.allFriends')}
        </Chip>
        <Chip
          selected={audience === 'GROUPS'}
          onPress={() => setAudience('GROUPS')}
          mode="outlined"
          compact
        >
          {t('audience.groups')}
        </Chip>
      </View>

      {audience === 'GROUPS' && (
        groups.length === 0 ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('audience.noGroups')}
          </Text>
        ) : (
          <View style={styles.groupRow}>
            {groups.map((g) => (
              <Chip
                key={g.id}
                selected={selectedGroupIds.includes(g.id)}
                onPress={() => toggleGroup(g.id)}
                mode="outlined"
                compact
                style={styles.groupChip}
              >
                {g.name}
              </Chip>
            ))}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 8 },
  title: { marginBottom: 6, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap' },
  groupChip: { marginRight: 8, marginBottom: 8 },
});

