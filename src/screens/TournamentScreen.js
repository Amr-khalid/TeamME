import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  RadialGradient as SvgRadial,
  Stop,
  Rect,
  Line,
  Circle,
} from 'react-native-svg';
import { BracketMatchCard } from '../components/tournament/BracketMatchCard';
import { ChampionModal } from '../components/tournament/ChampionModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import { Trophy, RotateCcw, Swords, Crown, Sparkles } from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const TOURNAMENT_ART = require('../../assets/images/tournament_art.jpg');

export function TournamentScreen() {
  const { activeTheme, themeId } = useTheme();
  const { lang, isRTL } = useLanguage();
  const {
    tournament,
    champion,
    setChampion,
    initTournamentFromTeams,
    resetTournament,
    currentTeams,
    setActiveTab,
  } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  // Continuous ambient glow pulse animation
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

  const quarterMatches = tournament?.matches?.filter((m) => m.round === 1) || [];
  const semiMatches = tournament?.matches?.filter((m) => m.round === 2) || [];
  const finalMatches = tournament?.matches?.filter((m) => m.round === 3) || [];

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

        {/* Hero Tournament Artwork */}
        <Image
          source={TOURNAMENT_ART}
          style={styles.heroBackdropArt}
          resizeMode="cover"
        />

        {/* Multi-Stop Cinematic Vignette Gradient Overlay */}
        <LinearGradient
          colors={
            isLightMode
              ? [
                  'rgba(248, 250, 252, 0.45)',
                  'rgba(248, 250, 252, 0.85)',
                  'rgba(248, 250, 252, 0.96)',
                  '#f8fafc',
                ]
              : [
                  'rgba(3, 5, 17, 0.48)',
                  'rgba(3, 5, 17, 0.78)',
                  'rgba(3, 5, 17, 0.94)',
                  '#030511',
                ]
          }
          locations={[0, 0.22, 0.52, 0.92]}
          style={StyleSheet.absoluteFill}
        />

        {/* Svg Golden Championship Radiance & Flares */}
        <Svg style={StyleSheet.absoluteFill} width={SCREEN_W} height={SCREEN_H}>
          <Defs>
            <SvgRadial id="tournFlareGold" cx="50%" cy="12%" r="55%">
              <Stop
                offset="0%"
                stopColor="#fbbf24"
                stopOpacity={isLightMode ? 0.32 : 0.45}
              />
              <Stop
                offset="55%"
                stopColor={activeTheme.accentColor || '#38bdf8'}
                stopOpacity={isLightMode ? 0.1 : 0.16}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>

            <SvgRadial id="tournFlareCyan" cx="15%" cy="45%" r="48%">
              <Stop
                offset="0%"
                stopColor={activeTheme.accentColor || '#38bdf8'}
                stopOpacity={isLightMode ? 0.2 : 0.28}
              />
              <Stop
                offset="60%"
                stopColor="#7c3aed"
                stopOpacity={isLightMode ? 0.05 : 0.09}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>
          </Defs>

          <Rect x="0" y="0" width="100%" height="100%" fill="url(#tournFlareGold)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#tournFlareCyan)" />

          {/* High-Tech Championship Arena Lines */}
          <Line
            x1="0"
            y1="90"
            x2={SCREEN_W}
            y2="90"
            stroke={isLightMode ? '#94a3b8' : '#334155'}
            strokeWidth="1"
            strokeDasharray="6, 8"
            strokeOpacity={isLightMode ? 0.3 : 0.45}
          />
          <Line
            x1="0"
            y1="240"
            x2={SCREEN_W}
            y2="240"
            stroke={isLightMode ? '#94a3b8' : '#334155'}
            strokeWidth="1"
            strokeDasharray="10, 10"
            strokeOpacity={isLightMode ? 0.25 : 0.35}
          />
          <Circle
            cx={SCREEN_W / 2}
            cy="150"
            r="110"
            stroke={isLightMode ? '#cbd5e1' : '#fbbf24'}
            strokeWidth="1.2"
            strokeDasharray="4, 10"
            strokeOpacity={isLightMode ? 0.25 : 0.22}
            fill="none"
          />
        </Svg>

        {/* Pulsing Energy Wave */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: glowPulse,
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(251, 191, 36, 0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* 2. Scrollable Foreground Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Calm & Floating Tournament Header Hub */}
        <View
          style={[
            styles.trophyHeroCard,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
            },
          ]}
        >
          <View style={[styles.trophyHeroLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View
              style={[
                styles.trophyIconBox,
                {
                  backgroundColor: isLightMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)',
                  borderColor: 'rgba(251, 191, 36, 0.4)',
                },
              ]}
            >
              <Trophy size={20} color="#fbbf24" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: activeTheme.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                {lang === 'ar' ? 'شجرة البطولة والمواجهات' : 'Tournament Bracket Arena'}
              </Text>
              <Text style={[styles.heroSub, { color: activeTheme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {tournament
                  ? (lang === 'ar' ? 'سجّل النتيجة وأهّل الفائز للدور القادم' : 'Record match scores & advance winners')
                  : (lang === 'ar' ? 'مواجهات إقصائية لحسم بطل الكأس' : 'Organized elimination bracket for teams')}
              </Text>
            </View>
          </View>

          {tournament && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hapticsService.impactMedium();
                resetTournament();
              }}
              style={[
                styles.resetPillBtn,
                {
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                },
              ]}
            >
              <RotateCcw size={13} color="#f87171" />
              <Text style={styles.resetPillText}>{lang === 'ar' ? 'إعادة' : 'Reset'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. Tournament Bracket Content */}
        {tournament ? (
          <View style={styles.bracketContainer}>
            {/* Quarter Finals */}
            {quarterMatches.length > 0 && (
              <View style={styles.stageSection}>
                <View style={[styles.stageTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.stageIconBadge, { backgroundColor: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }]}>
                    <Swords size={14} color={activeTheme.textSecondary} />
                  </View>
                  <Text style={[styles.stageTitleText, { color: activeTheme.textPrimary }]}>
                    {lang === 'ar' ? 'دور الـ 8 (Quarter-Finals)' : 'Quarter-Finals'}
                  </Text>
                </View>
                <View style={styles.stageGrid}>
                  {quarterMatches.map((match) => (
                    <BracketMatchCard key={match.id} match={match} />
                  ))}
                </View>
              </View>
            )}

            {/* Semi Finals */}
            {semiMatches.length > 0 && (
              <View style={styles.stageSection}>
                <View style={[styles.stageTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.stageIconBadge, { backgroundColor: `${activeTheme.accentColor}25` }]}>
                    <Swords size={14} color={activeTheme.accentColor} />
                  </View>
                  <Text style={[styles.stageTitleText, { color: activeTheme.textPrimary }]}>
                    {lang === 'ar' ? 'نصف النهائي (Semi-Finals)' : 'Semi-Finals'}
                  </Text>
                </View>
                <View style={styles.stageGrid}>
                  {semiMatches.map((match) => (
                    <BracketMatchCard key={match.id} match={match} />
                  ))}
                </View>
              </View>
            )}

            {/* Grand Final */}
            {finalMatches.length > 0 && (
              <View style={styles.stageSection}>
                <View style={[styles.stageTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.stageIconBadge, { backgroundColor: 'rgba(251, 191, 36, 0.25)', borderColor: 'rgba(251, 191, 36, 0.4)', borderWidth: 1 }]}>
                    <Crown size={15} color="#fbbf24" />
                  </View>
                  <Text style={[styles.stageTitleText, { color: '#fbbf24' }]}>
                    {lang === 'ar' ? 'الماتش النهائي الكبير (Grand Final)' : 'Grand Final & Champion'}
                  </Text>
                </View>
                <View style={styles.stageGrid}>
                  {finalMatches.map((match) => (
                    <BracketMatchCard key={match.id} match={match} />
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          /* Minimalist & Floating Launchpad Empty State */
          <View
            style={[
              styles.emptyLaunchpad,
              {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
              },
            ]}
          >
            <View
              style={[
                styles.trophyEmblemCircle,
                {
                  borderColor: 'rgba(251, 191, 36, 0.45)',
                  backgroundColor: isLightMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.12)',
                },
              ]}
            >
              <Trophy size={34} color="#fbbf24" />
            </View>
            <Text style={[styles.launchpadTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'بدء شجرة البطولة' : 'Ready to Launch Tournament?'}
            </Text>
            <Text style={[styles.launchpadDesc, { color: activeTheme.textSecondary }]}>
              {lang === 'ar'
                ? 'حوّل الفرق اللي عملتها لماتشات تصفيات وشوف مين هيكسب الكاس.'
                : 'Turn your generated teams into an organized elimination tournament.'}
            </Text>

            {currentTeams && currentTeams.length >= 2 ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  hapticsService.impactHeavy();
                  initTournamentFromTeams();
                }}
                style={styles.launchBtnTouchable}
              >
                <LinearGradient
                  colors={activeTheme.gradientColors || ['#38bdf8', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.launchBtnGradient}
                >
                  <Trophy size={18} color="#ffffff" />
                  <Text style={styles.launchBtnTextWhite}>
                    {lang === 'ar' ? 'ابدأ البطولة دلوقتي 🏆' : 'Launch Tournament Bracket'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  hapticsService.impactLight();
                  setActiveTab('generate');
                }}
                style={[
                  styles.launchBtnOutline,
                  {
                    backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isLightMode ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)',
                  },
                ]}
              >
                <Sparkles size={16} color={activeTheme.accentColor} />
                <Text style={[styles.launchBtnOutlineText, { color: activeTheme.textPrimary }]}>
                  {lang === 'ar' ? 'وزّع الفرق الأول من هنا  ' : 'Generate Teams First'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Champion Celebration Modal */}
        <ChampionModal
          champion={champion}
          visible={!!champion}
          onClose={() => setChampion(null)}
        />
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
    width: SCREEN_W,
    height: Math.max(380, SCREEN_H * 0.45),
    opacity: 0.35,
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
  trophyHeroCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  trophyHeroLeft: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  trophyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  heroSub: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  resetPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetPillText: {
    color: '#f87171',
    fontSize: 11.5,
    fontWeight: '800',
  },
  bracketContainer: {
    gap: 16,
  },
  stageSection: {
    gap: 8,
  },
  stageTitleRow: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  stageIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTitleText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  stageGrid: {
    gap: 10,
  },
  emptyLaunchpad: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.2,
    gap: 8,
    marginTop: 6,
    elevation: 4,
  },
  trophyEmblemCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  launchpadTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  launchpadDesc: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 14,
  },
  launchBtnTouchable: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 5,
  },
  launchBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  launchBtnTextWhite: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  launchBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.2,
    paddingVertical: 13,
    marginTop: 10,
  },
  launchBtnOutlineText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});
