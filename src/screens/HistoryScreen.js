import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadial, Stop, Rect, Circle, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import {
  History,
  RotateCcw,
  Trash2,
  Clock,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Crown,
  Flame,
  Star,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HISTORY_ART = require('../../assets/images/history_art.jpg');

export function HistoryScreen() {
  const { activeTheme, themeId } = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const {
    history,
    restoreHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
  } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  // Expanded card tracking: { [itemId]: boolean }
  const [expandedItems, setExpandedItems] = useState({});

  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.95,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.5,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const toggleExpand = (itemId) => {
    hapticsService.impactLight();
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleConfirmClearAll = () => {
    Alert.alert(
      lang === 'ar' ? 'مسح سجل التشكيلات' : 'Clear Squad History',
      lang === 'ar' ? 'هل أنت متأكد من مسح جميع التشكيلات المحفوظة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete all saved squad drafts?',
      [
        { text: lang === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: lang === 'ar' ? 'مسح الكل' : 'Clear All',
          style: 'destructive',
          onPress: () => {
            hapticsService.impactHeavy();
            clearAllHistory();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: isLightMode ? '#f8fafc' : '#030511' }]}>
      {/* 1. Legendary Fixed Backdrop Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isLightMode ? '#f8fafc' : '#030511' },
          ]}
        />

        {/* Hero History Artwork */}
        <Image
          source={HISTORY_ART}
          style={styles.heroBackdropArt}
          resizeMode="cover"
        />

        {/* Multi-Stop Cinematic Vignette Gradient Overlay */}
        <LinearGradient
          colors={
            isLightMode
              ? [
                  'rgba(248, 250, 252, 0.45)',
                  'rgba(248, 250, 252, 0.82)',
                  'rgba(248, 250, 252, 0.95)',
                  '#f8fafc',
                ]
              : [
                  'rgba(3, 5, 17, 0.45)',
                  'rgba(3, 5, 17, 0.75)',
                  'rgba(3, 5, 17, 0.92)',
                  '#030511',
                ]
          }
          locations={[0, 0.25, 0.58, 0.92]}
          style={StyleSheet.absoluteFill}
        />

        {/* Svg Cyber Flares & Holographic Lines */}
        <Svg style={StyleSheet.absoluteFill} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <SvgRadial id="histFlare1" cx="20%" cy="15%" r="55%">
              <Stop
                offset="0%"
                stopColor={activeTheme.accentColor || '#38bdf8'}
                stopOpacity={isLightMode ? 0.3 : 0.42}
              />
              <Stop
                offset="55%"
                stopColor={activeTheme.accentSecondary || '#6366f1'}
                stopOpacity={isLightMode ? 0.1 : 0.15}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>

            <SvgRadial id="histFlareGold" cx="85%" cy="40%" r="50%">
              <Stop
                offset="0%"
                stopColor="#fbbf24"
                stopOpacity={isLightMode ? 0.2 : 0.3}
              />
              <Stop
                offset="60%"
                stopColor={activeTheme.accentColor || '#38bdf8'}
                stopOpacity={isLightMode ? 0.05 : 0.09}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>
          </Defs>

          <Rect x="0" y="0" width="100%" height="100%" fill="url(#histFlare1)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#histFlareGold)" />

          {/* Futuristic Tactical Pitch Lines */}
          <Line
            x1="0"
            y1="90"
            x2={SCREEN_WIDTH}
            y2="90"
            stroke={isLightMode ? '#94a3b8' : '#334155'}
            strokeWidth="1"
            strokeDasharray="6, 8"
            strokeOpacity={isLightMode ? 0.3 : 0.4}
          />
          <Circle
            cx={SCREEN_WIDTH / 2}
            cy="160"
            r={100}
            stroke={isLightMode ? '#cbd5e1' : activeTheme.accentColor}
            strokeWidth="1"
            strokeDasharray="4, 10"
            strokeOpacity={isLightMode ? 0.25 : 0.2}
            fill="none"
          />
        </Svg>

        {/* Pulsing Energy Aura */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: glowPulse,
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', `${activeTheme.accentColor}12`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* 2. Scrollable Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header & Clear All Button */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <Text style={[styles.title, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'سجل التشكيلات المحفوظة' : 'Squad History Vault'}
            </Text>
            <Text style={[styles.subtitle, { color: activeTheme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {lang === 'ar'
                ? 'أرشيف التوزيعات وقوائم الفرق السابقة بكامل تفاصيل اللاعبين'
                : 'Archive of past squad drafts with full team rosters'}
            </Text>
          </View>

          {history.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirmClearAll}
              style={[
                styles.clearBtn,
                {
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderColor: 'rgba(239, 68, 68, 0.35)',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Trash2 size={13} color="#f87171" />
              <Text style={styles.clearBtnText}>
                {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. History Timeline Cards - Transparent Crystal Glass */}
        {history.length > 0 ? (
          <View style={styles.timelineList}>
            {history.map((item) => {
              const dateObj = new Date(item.timestamp);
              const dateStr = dateObj.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                month: 'short',
                day: 'numeric',
              });
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isExpanded = expandedItems[item.id] !== false; // Default expanded for maximum visibility!

              return (
                <View
                  key={item.id}
                  style={[
                    styles.historyCard,
                    {
                      backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
                      borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
                      shadowColor: activeTheme.accentColor,
                    },
                  ]}
                >
                  {/* Card Top Row: Timestamp & Algorithm Badge */}
                  <View style={[styles.cardTopRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.dateInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Clock size={13} color={activeTheme.accentColor} />
                      <Text style={[styles.dateText, { color: activeTheme.textPrimary }]}>
                        {dateStr} • {timeStr}
                      </Text>
                    </View>

                    <View style={[styles.algoBadge, { backgroundColor: `${activeTheme.accentColor}25`, borderColor: activeTheme.accentColor }]}>
                      <Text style={[styles.algoBadgeText, { color: activeTheme.textPrimary }]}>
                        {item.teams?.length || 2} {lang === 'ar' ? 'فرق' : 'Teams'} • {item.totalPlayers || item.memberCount || 0} {lang === 'ar' ? 'لاعب' : 'Players'}
                      </Text>
                    </View>
                  </View>

                  {/* Teams & Detailed Member Roster */}
                  <View style={styles.teamsContainer}>
                    {item.teams?.map((team, tIdx) => {
                      const teamColor = team.color || '#3b82f6';
                      const teamName = team.name || (lang === 'ar' ? team.nameAr : team.nameEn) || `Team ${tIdx + 1}`;
                      const teamAvg = team.members?.length
                        ? (team.members.reduce((s, m) => s + (Number(m.level) || 5), 0) / team.members.length).toFixed(1)
                        : '0.0';

                      return (
                        <View
                          key={team.id || tIdx}
                          style={[
                            styles.teamRosterBox,
                            {
                              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.05)',
                              borderColor: `${teamColor}60`,
                            },
                          ]}
                        >
                          {/* Team Title & Average Rating Bar */}
                          <View style={[styles.teamHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.teamTitleGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                              <View style={[styles.teamDot, { backgroundColor: teamColor }]} />
                              <Text numberOfLines={1} style={[styles.teamNameText, { color: activeTheme.textPrimary }]}>
                                {teamName}
                              </Text>
                              <Text style={[styles.teamCountPill, { color: teamColor }]}>
                                ({team.members?.length || 0})
                              </Text>
                            </View>

                            <View style={[styles.teamAvgRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                              <Flame size={12} color="#fbbf24" />
                              <Text style={styles.teamAvgText}>{teamAvg} ★</Text>
                            </View>
                          </View>

                          {/* Members Chips Inside Team */}
                          {isExpanded && (
                            <View style={[styles.membersGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                              {team.members?.map((member, mIdx) => (
                                <View
                                  key={member.id || mIdx}
                                  style={[
                                    styles.memberChip,
                                    {
                                      backgroundColor: member.role === 'captain'
                                        ? 'rgba(251, 191, 36, 0.2)'
                                        : isLightMode
                                        ? 'rgba(0, 0, 0, 0.04)'
                                        : 'rgba(255, 255, 255, 0.06)',
                                      borderColor: member.role === 'captain'
                                        ? '#fbbf24'
                                        : isLightMode
                                        ? 'rgba(0, 0, 0, 0.08)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                      flexDirection: isRTL ? 'row-reverse' : 'row',
                                    },
                                  ]}
                                >
                                  {member.role === 'captain' ? (
                                    <Crown size={11} color="#fbbf24" />
                                  ) : (
                                    <Text style={styles.memberLevelBadge}>
                                      {member.level || 7}★
                                    </Text>
                                  )}
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.memberNameText,
                                      {
                                        color: member.role === 'captain' ? '#fbbf24' : activeTheme.textPrimary,
                                        fontWeight: member.role === 'captain' ? '900' : '700',
                                      },
                                    ]}
                                  >
                                    {member.name}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* Card Actions Bottom Row */}
                  <View style={[styles.cardActionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      onPress={() => toggleExpand(item.id)}
                      style={[styles.expandToggleBtn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                    >
                      <Text style={[styles.expandToggleText, { color: activeTheme.textSecondary }]}>
                        {isExpanded
                          ? (lang === 'ar' ? 'طي التشكيلة' : 'Collapse')
                          : (lang === 'ar' ? 'عرض التشكيلة' : 'Show Roster')}
                      </Text>
                      {isExpanded ? (
                        <ChevronUp size={14} color={activeTheme.textSecondary} />
                      ) : (
                        <ChevronDown size={14} color={activeTheme.textSecondary} />
                      )}
                    </TouchableOpacity>

                    <View style={[styles.actionsRight, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <TouchableOpacity
                        onPress={() => {
                          hapticsService.impactMedium();
                          deleteHistoryItem(item.id);
                        }}
                        style={[styles.deleteIconBtn, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                      >
                        <Trash2 size={13} color="#f87171" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => restoreHistoryItem(item)}
                        style={styles.restoreBtnWrapper}
                      >
                        <LinearGradient
                          colors={activeTheme.gradientColors || ['#38bdf8', '#2563eb']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.restoreBtnGradient, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                        >
                          <RotateCcw size={12} color="#ffffff" />
                          <Text style={styles.restoreBtnText}>
                            {lang === 'ar' ? 'استعادة' : 'Restore'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
              },
            ]}
          >
            <History size={48} color={activeTheme.accentColor} style={{ opacity: 0.6 }} />
            <Text style={[styles.emptyTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'لا يوجد تشكيلات محفوظة' : 'No Saved History'}
            </Text>
            <Text style={[styles.emptyDesc, { color: activeTheme.textSecondary }]}>
              {lang === 'ar'
                ? 'عند توليد فرق جديدة، يمكنك الضغط على "حفظ في السجل" للرجوع إليها واستعادتها في أي وقت ⚡'
                : 'Generate teams and save them to review or restore past squads anytime'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
  heroBackdropArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: Math.max(480, SCREEN_HEIGHT * 0.6),
    opacity: 0.52,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
  },
  header: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  clearBtn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.2,
  },
  clearBtnText: {
    color: '#f87171',
    fontSize: 11.5,
    fontWeight: '800',
  },
  timelineList: {
    gap: 12,
  },
  historyCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 14,
    gap: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTopRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: {
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  algoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  algoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  teamsContainer: {
    gap: 8,
  },
  teamRosterBox: {
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 10,
    gap: 6,
  },
  teamHeaderRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamTitleGroup: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  teamDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  teamNameText: {
    fontSize: 14,
    fontWeight: '900',
  },
  teamCountPill: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  teamAvgRow: {
    alignItems: 'center',
    gap: 3,
  },
  teamAvgText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '900',
  },
  membersGrid: {
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  memberChip: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  memberLevelBadge: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '900',
  },
  memberNameText: {
    fontSize: 11.5,
  },
  cardActionsRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  expandToggleBtn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  expandToggleText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  actionsRight: {
    alignItems: 'center',
    gap: 6,
  },
  deleteIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreBtnWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  restoreBtnGradient: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  restoreBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },
});
