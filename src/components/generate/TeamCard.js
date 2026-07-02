import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { ROLES } from '../../theme/constants';
import { hapticsService } from '../../services/hapticsService';
import {
  Shield,
  Plus,
  Minus,
  ArrowLeftRight,
  Crown,
  Zap,
  HeartHandshake,
  Sparkles,
  Target,
  Flame,
  Edit3,
  Check,
  Star,
} from 'lucide-react-native';

const ROLE_ICONS = {
  captain: Crown,
  striker: Zap,
  tank: Shield,
  support: HeartHandshake,
  playmaker: Sparkles,
  rookie: Target,
  Crown,
  Zap,
  Shield,
  HeartHandshake,
  Sparkles,
  Target,
};

const EGYPTIAN_ROLE_NAMES = {
  captain: 'كابتن الفرقة',
  striker: 'مهاجم هدّاف',
  tank: 'مدافع صلب',
  support: 'خط وسط وجوكر',
  playmaker: 'صانع ألعاب حريف',
  rookie: 'لاعب جديد',
};

export function TeamCard({
  team,
  showScoreboard = true,
  showStats = true,
  allowSwap = true,
}) {
  const { activeTheme, themeId } = useTheme();
  const { lang, isRTL } = useLanguage();
  const {
    swapSelection,
    handlePlayerSwap,
    handlePlayerSwapTap,
    updateTeamScore,
    renameTeam,
  } = useAppData();

  const onSwap = handlePlayerSwap || handlePlayerSwapTap;

  const isLight = themeId === 'manga_white' || themeId === 'frost';

  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState(lang === 'ar' ? team.nameAr : team.nameEn);

  const isPlayerSelectedForSwap = (memberId) => {
    return swapSelection && swapSelection.member.id === memberId;
  };

  const avgSkill = Number(team.stats?.avgSkill || 0).toFixed(1);
  const totalSkill = team.stats?.totalSkill || 0;
  const avgPercent = Math.min(Math.max((Number(avgSkill) / 10) * 100, 10), 100);

  const handleSaveName = () => {
    if (customName.trim()) {
      renameTeam(team.id, customName.trim());
    }
    setIsEditingName(false);
  };

  const teamColor = team.color || '#3b82f6';
  const teamSecondary = team.secondary || '#1d4ed8';

  return (
    <View
      style={[
        styles.teamCard,
        {
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(15, 23, 42, 0.45)',
          borderColor: `${teamColor}75`,
          shadowColor: teamColor,
        },
      ]}
    >
      {/* 1. Legendary Championship Header */}
      <LinearGradient
        colors={[teamColor, teamSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={styles.teamHeaderGradient}
      >
        <View style={[styles.teamHeaderLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {/* Team Shield Emblem */}
          <View style={styles.teamShieldBadge}>
            <Shield size={19} color="#ffffff" />
          </View>

          {/* Name & Member Count */}
          {isEditingName ? (
            <View style={[styles.renameRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                autoFocus
                placeholder={lang === 'ar' ? 'اسم الفريق...' : 'Team Name...'}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                style={[styles.renameInput, { textAlign: isRTL ? 'right' : 'left' }]}
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity
                onPress={handleSaveName}
                style={styles.saveRenameBtn}
              >
                <Check size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hapticsService.impactLight();
                setCustomName(lang === 'ar' ? team.nameAr : team.nameEn);
                setIsEditingName(true);
              }}
              style={styles.nameTouchable}
            >
              <View style={[styles.nameWithEdit, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={styles.teamNameTitle}>
                  {lang === 'ar' ? team.nameAr : team.nameEn}
                </Text>
                <Edit3 size={12} color="rgba(255, 255, 255, 0.75)" />
              </View>
              <Text style={[styles.teamPlayerCount, { textAlign: isRTL ? 'right' : 'left' }]}>
                {team.members.length} {lang === 'ar' ? 'لعيبة' : 'Players'} • {avgSkill} OVR
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Score Counter */}
        {showScoreboard && !isEditingName && (
          <View style={styles.scoreboardPill}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticsService.impactLight();
                updateTeamScore(team.id, -1);
              }}
              style={styles.scoreActionBtn}
            >
              <Minus size={13} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.scoreDigit}>{team.score || 0}</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticsService.impactLight();
                updateTeamScore(team.id, 1);
              }}
              style={[styles.scoreActionBtn, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}
            >
              <Plus size={13} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* 2. Legendary Players Roster */}
      <View style={styles.rosterContainer}>
        {team.members.map((member, idx) => {
          const roleConfig = ROLES[member.role] || ROLES.rookie;
          const RoleIcon = ROLE_ICONS[member.role] || ROLE_ICONS[roleConfig.icon] || Shield;
          const isSelected = isPlayerSelectedForSwap(member.id);
          const roleArabicTitle = EGYPTIAN_ROLE_NAMES[member.role] || roleConfig.nameAr;

          return (
            <TouchableOpacity
              key={member.id || idx}
              activeOpacity={allowSwap ? 0.75 : 1}
              disabled={!allowSwap}
              onPress={() => {
                if (allowSwap && onSwap) {
                  onSwap(team.id, member);
                }
              }}
              style={[
                styles.playerSlot,
                {
                  backgroundColor: isSelected
                    ? `${activeTheme.accentColor}35`
                    : isLight
                    ? 'rgba(255, 255, 255, 0.68)'
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: isSelected
                    ? '#fbbf24'
                    : isLight
                    ? 'rgba(0, 0, 0, 0.08)'
                    : `${roleConfig.color}40`,
                  borderWidth: isSelected ? 1.8 : 1,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              {/* Left: Role Emblem Badge & Player Name */}
              <View style={[styles.playerInfoLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {/* Role Icon Badge */}
                <View
                  style={[
                    styles.roleIconBox,
                    {
                      backgroundColor: `${roleConfig.color}25`,
                      borderColor: `${roleConfig.color}60`,
                    },
                  ]}
                >
                  <RoleIcon size={14} color={roleConfig.color} />
                </View>

                {/* Name & Role Text */}
                <View style={[styles.nameBlock, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text numberOfLines={1} style={[styles.playerNameText, { color: activeTheme.textPrimary }]}>
                    {member.name}
                  </Text>
                  <Text style={[styles.playerRoleText, { color: roleConfig.color }]}>
                    {lang === 'ar' ? roleArabicTitle : roleConfig.nameEn}
                  </Text>
                </View>
              </View>

              {/* Right: Star Level & Swap Button (if enabled) */}
              <View style={[styles.playerInfoRight, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {/* Level Tag */}
                <View style={styles.starLevelBadge}>
                  <Star size={11} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.playerRatingNum}>{member.level}</Text>
                </View>

                {/* Swap Button (Only if allowed) */}
                {allowSwap && (
                  <View
                    style={[
                      styles.swapButtonBox,
                      {
                        backgroundColor: isSelected ? '#fbbf24' : isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                        borderColor: isSelected ? '#ffffff' : isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                      },
                    ]}
                  >
                    <ArrowLeftRight
                      size={12}
                      color={isSelected ? '#000000' : activeTheme.textMuted}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Team Overall Strength Progress Bar */}
      {showStats && (
        <View style={[styles.statsBar, { borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }]}>
          <View style={[styles.ovrSummary, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.ovrBadge}>
              <Flame size={13} color="#fbbf24" />
              <Text style={styles.ovrText}>{avgSkill} OVR</Text>
            </View>
            <Text style={[styles.totalStarsText, { color: activeTheme.textSecondary }]}>
              {totalSkill} ★ {lang === 'ar' ? 'مجموع طاقة الفريق' : 'Total Power'}
            </Text>
          </View>

          {/* Progress gauge */}
          <View style={styles.gaugeTrack}>
            <LinearGradient
              colors={[teamColor, '#fbbf24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gaugeFill, { width: `${avgPercent}%` }]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  teamCard: {
    borderRadius: 20,
    borderWidth: 1.3,
    overflow: 'hidden',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    gap: 12,
    paddingBottom: 14,
  },
  teamHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  teamHeaderLeft: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  teamShieldBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  nameTouchable: {
    flex: 1,
  },
  nameWithEdit: {
    alignItems: 'center',
    gap: 5,
  },
  teamNameTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  teamPlayerCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  renameRow: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  renameInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveRenameBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreboardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  scoreActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreDigit: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    minWidth: 18,
    textAlign: 'center',
  },
  rosterContainer: {
    paddingHorizontal: 12,
    gap: 7,
  },
  playerSlot: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 13,
  },
  playerInfoLeft: {
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  roleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
    gap: 1,
  },
  playerNameText: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  playerRoleText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  playerInfoRight: {
    alignItems: 'center',
    gap: 8,
  },
  starLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  playerRatingNum: {
    color: '#fbbf24',
    fontSize: 11.5,
    fontWeight: '900',
  },
  swapButtonBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    paddingHorizontal: 12,
    gap: 6,
    marginTop: 2,
  },
  ovrSummary: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ovrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  ovrText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '900',
  },
  totalStarsText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  gaugeTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 999,
  },
});
