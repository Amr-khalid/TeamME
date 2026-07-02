import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { hapticsService } from '../../services/hapticsService';
import { Shield, Plus, Minus, Crown } from 'lucide-react-native';

export function BracketMatchCard({ match }) {
  const { activeTheme, themeId } = useTheme();
  const { lang } = useLanguage();
  const { updateMatchScore, advanceMatchWinner } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';
  const isCompleted = !!match.winner;

  const handleScoreAdjust = (teamKey, currentScore, delta) => {
    hapticsService.impactLight();
    const newScore = Math.max(0, (Number(currentScore) || 0) + delta);
    updateMatchScore(match.id, teamKey, String(newScore));
  };

  const handleAdvance = (winnerTeam) => {
    hapticsService.success();
    advanceMatchWinner(match.id, winnerTeam);
  };

  const isTeamAWinner = match.winner && match.winner.id === match.teamA?.id;
  const isTeamBWinner = match.winner && match.winner.id === match.teamB?.id;

  return (
    <View
      style={[
        styles.duelCard,
        {
          backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
          borderColor: isCompleted ? '#fbbf24' : isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
        },
      ]}
    >
      {/* Top Header Tag */}
      <View style={styles.duelHeader}>
        <View style={[styles.matchTagPill, { backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)' }]}>
          <Text style={[styles.matchTagText, { color: activeTheme.accentColor }]}>
            {lang === 'ar' ? match.titleAr : match.title}
          </Text>
        </View>
        {isCompleted && (
          <View style={styles.statusPill}>
            <Crown size={12} color="#fbbf24" />
            <Text style={styles.statusText}>{lang === 'ar' ? 'حُسمت المباراة' : 'Decided'}</Text>
          </View>
        )}
      </View>

      {/* Face-off Arena (Team A vs Team B) */}
      <View style={styles.faceoffRow}>
        {/* Team A Column */}
        {match.teamA ? (
          <TouchableOpacity
            activeOpacity={match.winner ? 1 : 0.8}
            onPress={() => !match.winner && handleAdvance(match.teamA)}
            style={[
              styles.teamBox,
              {
                backgroundColor: isTeamAWinner
                  ? 'rgba(251, 191, 36, 0.2)'
                  : isTeamBWinner
                  ? isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
                  : isLightMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.06)',
                borderColor: isTeamAWinner
                  ? '#fbbf24'
                  : match.teamA.color
                  ? `${match.teamA.color}70`
                  : activeTheme.borderSubtle,
                opacity: isTeamBWinner ? 0.45 : 1,
              },
            ]}
          >
            {isTeamAWinner && (
              <View style={styles.winnerBadgeTop}>
                <Crown size={12} color="#fbbf24" />
              </View>
            )}

            <View style={[styles.emblemCircle, { backgroundColor: match.teamA.color || '#3b82f6' }]}>
              <Shield size={16} color="#ffffff" />
            </View>

            <Text numberOfLines={1} style={[styles.teamNameTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? match.teamA.nameAr : match.teamA.nameEn}
            </Text>

            {/* Score Stepper */}
            <View style={[styles.scoreStepper, { backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.45)' }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleScoreAdjust('scoreA', match.scoreA, -1)}
                style={styles.stepBtn}
              >
                <Minus size={11} color={activeTheme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.scoreNumText, { color: isLightMode ? '#0f172a' : '#ffffff' }]}>
                {match.scoreA || 0}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleScoreAdjust('scoreA', match.scoreA, 1)}
                style={[styles.stepBtn, { backgroundColor: `${match.teamA.color || activeTheme.accentColor}35` }]}
              >
                <Plus size={11} color={match.teamA.color || activeTheme.accentColor} />
              </TouchableOpacity>
            </View>

            {!match.winner && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleAdvance(match.teamA)}
                style={[
                  styles.chooseWinBtn,
                  {
                    backgroundColor: `${match.teamA.color || activeTheme.accentColor}25`,
                    borderColor: match.teamA.color || activeTheme.accentColor,
                  },
                ]}
              >
                <Text style={[styles.chooseWinText, { color: match.teamA.color || activeTheme.accentColor }]}>
                  {lang === 'ar' ? 'فائز 👑' : 'Win 👑'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.teamBoxEmpty,
              {
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
              },
            ]}
          >
            <Shield size={18} color={activeTheme.textMuted} />
            <Text style={[styles.emptyLabel, { color: activeTheme.textMuted }]}>
              {lang === 'ar' ? 'بانتظار الفائز' : 'TBD'}
            </Text>
          </View>
        )}

        {/* Center VS Nexus */}
        <View style={styles.vsCenterColumn}>
          <LinearGradient
            colors={activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
            style={styles.vsCircle}
          >
            <Text style={styles.vsLabel}>VS</Text>
          </LinearGradient>
        </View>

        {/* Team B Column */}
        {match.teamB ? (
          <TouchableOpacity
            activeOpacity={match.winner ? 1 : 0.8}
            onPress={() => !match.winner && handleAdvance(match.teamB)}
            style={[
              styles.teamBox,
              {
                backgroundColor: isTeamBWinner
                  ? 'rgba(251, 191, 36, 0.2)'
                  : isTeamAWinner
                  ? isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
                  : isLightMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.06)',
                borderColor: isTeamBWinner
                  ? '#fbbf24'
                  : match.teamB.color
                  ? `${match.teamB.color}70`
                  : activeTheme.borderSubtle,
                opacity: isTeamAWinner ? 0.45 : 1,
              },
            ]}
          >
            {isTeamBWinner && (
              <View style={styles.winnerBadgeTop}>
                <Crown size={12} color="#fbbf24" />
              </View>
            )}

            <View style={[styles.emblemCircle, { backgroundColor: match.teamB.color || '#ef4444' }]}>
              <Shield size={16} color="#ffffff" />
            </View>

            <Text numberOfLines={1} style={[styles.teamNameTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? match.teamB.nameAr : match.teamB.nameEn}
            </Text>

            {/* Score Stepper */}
            <View style={[styles.scoreStepper, { backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.45)' }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleScoreAdjust('scoreB', match.scoreB, -1)}
                style={styles.stepBtn}
              >
                <Minus size={11} color={activeTheme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.scoreNumText, { color: isLightMode ? '#0f172a' : '#ffffff' }]}>
                {match.scoreB || 0}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleScoreAdjust('scoreB', match.scoreB, 1)}
                style={[styles.stepBtn, { backgroundColor: `${match.teamB.color || activeTheme.accentColor}35` }]}
              >
                <Plus size={11} color={match.teamB.color || activeTheme.accentColor} />
              </TouchableOpacity>
            </View>

            {!match.winner && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleAdvance(match.teamB)}
                style={[
                  styles.chooseWinBtn,
                  {
                    backgroundColor: `${match.teamB.color || activeTheme.accentColor}25`,
                    borderColor: match.teamB.color || activeTheme.accentColor,
                  },
                ]}
              >
                <Text style={[styles.chooseWinText, { color: match.teamB.color || activeTheme.accentColor }]}>
                  {lang === 'ar' ? 'فائز 👑' : 'Win 👑'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.teamBoxEmpty,
              {
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
              },
            ]}
          >
            <Shield size={18} color={activeTheme.textMuted} />
            <Text style={[styles.emptyLabel, { color: activeTheme.textMuted }]}>
              {lang === 'ar' ? 'بانتظار الفائز' : 'TBD'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  duelCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 12,
    gap: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  duelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  matchTagText: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  statusText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '900',
  },
  faceoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.2,
    gap: 6,
    position: 'relative',
  },
  winnerBadgeTop: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  emblemCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamNameTitle: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  scoreStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 2,
    gap: 5,
  },
  stepBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumText: {
    fontSize: 15,
    fontWeight: '900',
    minWidth: 16,
    textAlign: 'center',
  },
  chooseWinBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  chooseWinText: {
    fontSize: 11,
    fontWeight: '900',
  },
  teamBoxEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 4,
  },
  emptyLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  vsCenterColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  vsLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
});
