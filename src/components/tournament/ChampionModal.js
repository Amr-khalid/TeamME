import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalSheet } from '../common/ModalSheet';
import { GlowButton } from '../common/GlowButton';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';
import { Crown, Trophy, Sparkles, Shield } from 'lucide-react-native';

export function ChampionModal({
  champion,
  visible,
  onClose,
}) {
  const { activeTheme } = useTheme();
  const { lang, t } = useLanguage();

  useEffect(() => {
    if (visible && champion) {
      audioService.playTrophy();
      hapticsService.success();
    }
  }, [visible, champion]);

  if (!champion) return null;

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={t.tournament.championTitle}
    >
      <View style={styles.container}>
        {/* Glowing Golden Trophy Header */}
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.trophyBadge}
        >
          <Crown size={48} color="#ffffff" />
        </LinearGradient>

        <Text style={[styles.title, { color: '#fbbf24' }]}>
          {lang === 'ar' ? champion.nameAr : champion.nameEn}
        </Text>

        <Text style={[styles.subtitle, { color: activeTheme.textSecondary }]}>
          {t.tournament.championSubtitle}
        </Text>

        {/* Champion Roster Summary */}
        <View
          style={[
            styles.rosterCard,
            {
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'rgba(245, 158, 11, 0.35)',
            },
          ]}
        >
          <View style={styles.rosterHeader}>
            <Trophy size={16} color="#fbbf24" />
            <Text style={[styles.rosterTitle, { color: '#fbbf24' }]}>
              {champion.members?.length || 0} {t.history.membersCount}
            </Text>
          </View>

          <View style={styles.membersGrid}>
            {champion.members?.map((m, i) => (
              <View key={m.id || i} style={styles.memberPill}>
                <Shield size={12} color="#fbbf24" />
                <Text style={[styles.memberName, { color: activeTheme.textPrimary }]}>
                  {m.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <GlowButton
          variant="gold"
          title={t.tournament.closeChampion}
          onPress={onClose}
          style={{ width: '100%', marginTop: 8 }}
        />
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  trophyBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  rosterCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rosterTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '700',
  },
});
