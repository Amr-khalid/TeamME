import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Modal,
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
import { TeamCard } from '../components/generate/TeamCard';
import { MatchTimer } from '../components/generate/MatchTimer';
import { GlowButton } from '../components/common/GlowButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import { audioService } from '../services/audioService';
import {
  Zap,
  Shuffle,
  Scale,
  Crown,
  Shield,
  Clock,
  Trophy,
  Share2,
  Bookmark,
  Sparkles,
  Users,
  Check,
  UserPlus,
  Minus,
  Plus,
  ArrowLeftRight,
} from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const GENERATOR_ART = require('../../assets/images/generator_art.jpg');

export function GenerateScreen() {
  const { activeTheme, themeId } = useTheme();
  const { lang, isRTL } = useLanguage();
  const {
    members,
    currentTeams,
    sessionConfig,
    setSessionConfig,
    generateTeams,
    swapSelection,
    saveCurrentToHistory,
    initTournamentFromTeams,
    setActiveTab,
  } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  const [isCharging, setIsCharging] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isCustomTeamInput, setIsCustomTeamInput] = useState(false);
  const [customTeamNumText, setCustomTeamNumText] = useState(String(sessionConfig.numTeams || 2));
  const scrollViewRef = useRef(null);
  const resultsYRef = useRef(0);

  // Ambient pulsing glow wave
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

  const handleSetTeamCount = (num) => {
    const clamped = Math.max(2, Math.min(64, num));
    setSessionConfig((prev) => ({ ...prev, numTeams: clamped }));
    setCustomTeamNumText(String(clamped));
  };

  const handleCustomTeamSubmit = () => {
    const parsed = parseInt(customTeamNumText, 10);
    if (!isNaN(parsed) && parsed >= 2) {
      handleSetTeamCount(parsed);
    }
  };

  // Algorithms in natural Egyptian phrasing & English
  const algorithms = [
    {
      id: 'balanced',
      title: lang === 'ar' ? 'توزيع متوازن (حسب اللعب)' : 'Skill Balanced',
      desc: lang === 'ar' ? 'يوزّع الحريفة بالتساوي عشان الماتش يولّع' : 'Snake draft parity balancing',
      icon: Scale,
    },
    {
      id: 'roles',
      title: lang === 'ar' ? 'حسب المراكز' : 'Role Equalized',
      desc: lang === 'ar' ? 'هجوم ودفاع متساوي في كل فرقة' : 'Equal strikers and defenders',
      icon: Shield,
    },
    {
      id: 'captains',
      title: lang === 'ar' ? 'الكباتن ع الرؤوس' : 'Captains First',
      desc: lang === 'ar' ? 'كل كابتن يمسك فرقة لوحده' : 'Captains seeded as anchors',
      icon: Crown,
    },
    {
      id: 'random',
      title: lang === 'ar' ? 'قرعة عشوائية' : 'Pure Random',
      desc: lang === 'ar' ? 'خلط سريع وبالحظ تماماً' : 'Pure random shuffle',
      icon: Shuffle,
    },
  ];

  const handleGenerate = () => {
    if (members.length < 2) {
      hapticsService.warning();
      audioService.playTick();
      setShowEmptyModal(true);
      return;
    }

    setIsCharging(true);
    hapticsService.impactHeavy();
    audioService.playCharge();

    setTimeout(() => {
      generateTeams();
      setIsCharging(false);
      hapticsService.success();
      audioService.playSuccess();

      // Smooth scroll down directly to the generated results section
      setTimeout(() => {
        if (scrollViewRef.current) {
          const targetY = resultsYRef.current > 0 ? resultsYRef.current - 16 : 420;
          scrollViewRef.current.scrollTo({
            y: targetY,
            animated: true,
          });
        }
      }, 100);
    }, 500);
  };

  const handleShareWhatsapp = async () => {
    if (!currentTeams || currentTeams.length === 0) return;

    let text = ` *تشكيلات مباريات TEAM ME PRO*\n`;
    text += `📅 ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n`;

    currentTeams.forEach((team) => {
      const name = lang === 'ar' ? team.nameAr : team.nameEn;
      text += `🛡️ *${name}* (متوسط القوة: ${team.stats?.avgSkill}/10 OVR):\n`;
      team.members.forEach((m, idx) => {
        text += `  ${idx + 1}. ${m.name} (${m.level}★)\n`;
      });
      text += `\n`;
    });

    text += `🚀 تم التوزيع بنظام - TEAM ME PRO`;

    try {
      await Share.share({ message: text });
      hapticsService.impactLight();
    } catch (e) {}
  };

  const handleSaveToHistory = () => {
    const saved = saveCurrentToHistory();
    if (saved) {
      hapticsService.success();
      Alert.alert(
        'TEAM ME PRO',
        lang === 'ar' ? 'تم حفظ تشكيلات الفرق في السجل بنجاح!' : 'Current squads saved to history successfully!'
      );
    }
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: isLightMode ? '#f8fafc' : '#030511' }]}>
      {/* 1. Legendary Cinematic Fixed Backdrop Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Base Color */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isLightMode ? '#f8fafc' : '#030511' },
          ]}
        />

        {/* Hero Generator Artwork */}
        <Image
          source={GENERATOR_ART}
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

        {/* Tactical Pitch Geometry & Cyber Glow Flares */}
        <Svg style={StyleSheet.absoluteFill} width={SCREEN_W} height={SCREEN_H}>
          <Defs>
            <SvgRadial id="genFlarePrimary" cx="20%" cy="12%" r="55%">
              <Stop
                offset="0%"
                stopColor={activeTheme.accentColor || '#38bdf8'}
                stopOpacity={isLightMode ? 0.3 : 0.42}
              />
              <Stop
                offset="55%"
                stopColor={activeTheme.accentSecondary || '#818cf8'}
                stopOpacity={isLightMode ? 0.1 : 0.15}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>

            <SvgRadial id="genFlareGold" cx="85%" cy="35%" r="50%">
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

          {/* Ambient Glows */}
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#genFlarePrimary)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#genFlareGold)" />

          {/* Futuristic Tactical Pitch Lines */}
          <Line
            x1="0"
            y1="80"
            x2={SCREEN_W}
            y2="80"
            stroke={isLightMode ? '#94a3b8' : '#334155'}
            strokeWidth="1"
            strokeDasharray="6, 8"
            strokeOpacity={isLightMode ? 0.3 : 0.45}
          />
          <Line
            x1="0"
            y1="220"
            x2={SCREEN_W}
            y2="220"
            stroke={isLightMode ? '#94a3b8' : '#334155'}
            strokeWidth="1"
            strokeDasharray="10, 10"
            strokeOpacity={isLightMode ? 0.25 : 0.35}
          />
          <Circle
            cx={SCREEN_W / 2}
            cy="150"
            r="110"
            stroke={isLightMode ? '#cbd5e1' : activeTheme.accentColor}
            strokeWidth="1.2"
            strokeDasharray="4, 10"
            strokeOpacity={isLightMode ? 0.25 : 0.2}
            fill="none"
          />
        </Svg>

        {/* Animated Cyber Pulsing Energy Wave */}
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

      {/* 2. Scrollable Foreground Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Header & Ready Squad Banner */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'توزيع الفرق' : 'Team Generator'}
            </Text>
            <Text style={[styles.subtitle, { color: activeTheme.textSecondary }]}>
              {lang === 'ar'
                ? 'قسّم صحابك فرق متوازنة بالعدل للماتش '
                : 'Instant parity balancing of skills and roles'}
            </Text>
          </View>

          <View
            style={[
              styles.squadBadge,
              {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                borderColor: `${activeTheme.accentColor}40`,
              },
            ]}
          >
            <Users size={14} color={activeTheme.accentColor} />
            <Text style={[styles.squadBadgeText, { color: activeTheme.textPrimary }]}>
              {members.length} {lang === 'ar' ? 'لعيبة جاهزين' : 'Ready'}
            </Text>
          </View>
        </View>

        {/* 2. Configuration Glass Card - Transparent Floating Hub */}
        <View
          style={[
            styles.configCard,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
            },
          ]}
        >
          {/* Stepper & Number of Teams (Without redundant count clutter) */}
          <View style={styles.sectionBlock}>
            <View style={[styles.labelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.sectionLabel, { color: activeTheme.textPrimary }]}>
                {lang === 'ar' ? 'عايز كام فريق؟' : 'Number of Teams'}
              </Text>
            </View>

            {/* Stepper Hero Header */}
            <View
              style={[
                styles.teamStepperHero,
                {
                  backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0.25)',
                  borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={sessionConfig.numTeams <= 2}
                onPress={() => {
                  hapticsService.impactLight();
                  handleSetTeamCount(sessionConfig.numTeams - 1);
                }}
                style={[
                  styles.teamStepIconBtn,
                  {
                    backgroundColor: sessionConfig.numTeams <= 2 ? 'transparent' : isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                  },
                ]}
              >
                <Minus size={16} color={sessionConfig.numTeams <= 2 ? activeTheme.textMuted : activeTheme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsCustomTeamInput(!isCustomTeamInput)}
                style={styles.teamHeroDisplay}
              >
                <LinearGradient
                  colors={activeTheme.gradientColors || ['#38bdf8', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.teamHeroPill}
                >
                  <Text style={styles.teamHeroNumber}>{sessionConfig.numTeams}</Text>
                  <Text style={styles.teamHeroLabel}>
                    {lang === 'ar' ? 'فرق' : 'Teams'}
                  </Text>
                  {sessionConfig.numTeams > 12 && (
                    <View style={styles.customBadgeTag}>
                      <Text style={styles.customBadgeTagText}>+12 🚀</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                disabled={sessionConfig.numTeams >= 64}
                onPress={() => {
                  hapticsService.impactLight();
                  handleSetTeamCount(sessionConfig.numTeams + 1);
                }}
                style={[
                  styles.teamStepIconBtn,
                  {
                    backgroundColor: sessionConfig.numTeams >= 64 ? 'transparent' : isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                  },
                ]}
              >
                <Plus size={16} color={sessionConfig.numTeams >= 64 ? activeTheme.textMuted : activeTheme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Interactive Range Slider (2 to 12) */}
            <View
              style={[
                styles.rangeTrackContainer,
                {
                  backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0.2)',
                  borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                },
              ]}
            >
              <View style={styles.rangeSegmentsRow}>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                  const isSelected = sessionConfig.numTeams === num;
                  const isUnder = sessionConfig.numTeams >= num;
                  return (
                    <TouchableOpacity
                      key={num}
                      activeOpacity={0.7}
                      onPress={() => {
                        hapticsService.impactLight();
                        handleSetTeamCount(num);
                      }}
                      style={styles.rangeSegmentPoint}
                    >
                      <View
                        style={[
                          styles.rangeTickDot,
                          {
                            backgroundColor: isSelected
                              ? '#ffffff'
                              : isUnder
                              ? activeTheme.accentColor
                              : isLightMode
                              ? 'rgba(0, 0, 0, 0.15)'
                              : 'rgba(255, 255, 255, 0.15)',
                            transform: [{ scale: isSelected ? 1.4 : 1 }],
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.rangeTickNumber,
                          {
                            color: isSelected
                              ? activeTheme.accentColor
                              : isUnder
                              ? activeTheme.textPrimary
                              : activeTheme.textMuted,
                            fontWeight: isSelected ? '900' : '600',
                          },
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Input Trigger & Number Box for > 12 Teams */}
            <View style={styles.customTeamRowWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsCustomTeamInput(!isCustomTeamInput)}
                style={[
                  styles.moreTeamsBtn,
                  {
                    backgroundColor: isCustomTeamInput || sessionConfig.numTeams > 12 ? `${activeTheme.accentColor}25` : isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: isCustomTeamInput || sessionConfig.numTeams > 12 ? activeTheme.borderFocus : isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                  },
                ]}
              >
                <Text style={[styles.moreTeamsBtnText, { color: activeTheme.textPrimary }]}>
                  {isCustomTeamInput || sessionConfig.numTeams > 12
                    ? (lang === 'ar' ? '🔢 الإدخال المخصص شغال' : '🔢 Custom Input Active')
                    : (lang === 'ar' ? '🔢 اكتب رقم مخصص (أكتر من 12)' : '🔢 Custom Team Count (> 12)')}
                </Text>
              </TouchableOpacity>

              {(isCustomTeamInput || sessionConfig.numTeams > 12) && (
                <View
                  style={[
                    styles.customNumberInputCard,
                    {
                      backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(15, 23, 42, 0.65)',
                      borderColor: activeTheme.borderFocus,
                    },
                  ]}
                >
                  <Text style={[styles.customNumberLabel, { color: activeTheme.textSecondary }]}>
                    {lang === 'ar' ? 'اكتب عدد الفرق:' : 'Enter Teams Count:'}
                  </Text>
                  <TextInput
                    value={customTeamNumText}
                    onChangeText={(t) => setCustomTeamNumText(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={3}
                    onSubmitEditing={handleCustomTeamSubmit}
                    style={[styles.customNumberTextInput, { color: activeTheme.textPrimary, borderColor: activeTheme.accentColor }]}
                  />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCustomTeamSubmit}
                    style={[styles.customNumberApplyBtn, { backgroundColor: activeTheme.accentColor }]}
                  >
                    <Check size={14} color="#ffffff" />
                    <Text style={styles.customNumberApplyBtnText}>
                      {lang === 'ar' ? 'تأكيد' : 'Set'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* 4 Algorithm Visual Cards (2x2 Grid) in Egyptian Dialect */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: activeTheme.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
              {lang === 'ar' ? 'طريقة ونمط التوزيع' : 'Balancing Algorithm'}
            </Text>

            <View style={styles.algoGrid}>
              {algorithms.map((algo) => {
                const isSelected = sessionConfig.algorithm === algo.id;
                const Icon = algo.icon;

                return (
                  <TouchableOpacity
                    key={algo.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      hapticsService.impactLight();
                      setSessionConfig((prev) => ({ ...prev, algorithm: algo.id }));
                    }}
                    style={[
                      styles.algoCard,
                      {
                        backgroundColor: isSelected
                          ? `${activeTheme.accentColor}25`
                          : isLightMode
                          ? 'rgba(255, 255, 255, 0.45)'
                          : 'rgba(255, 255, 255, 0.04)',
                        borderColor: isSelected ? activeTheme.accentColor : isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.algoCardTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View
                        style={[
                          styles.algoIconBox,
                          {
                            backgroundColor: isSelected ? activeTheme.accentColor : isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                          },
                        ]}
                      >
                        <Icon size={15} color={isSelected ? '#ffffff' : activeTheme.textSecondary} />
                      </View>
                      {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: activeTheme.accentColor }]}>
                          <Check size={10} color="#ffffff" />
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.algoTitleText,
                        {
                          color: isSelected ? activeTheme.textPrimary : activeTheme.textSecondary,
                          fontWeight: isSelected ? '900' : '700',
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {algo.title}
                    </Text>
                    <Text numberOfLines={2} style={[styles.algoDescText, { color: activeTheme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                      {algo.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Feature Toggles (Player Swap Condition + Timer + Scoreboard) */}
          <View style={styles.togglesRow}>
            {/* Player Swap Allowed Toggle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hapticsService.impactLight();
                setSessionConfig((prev) => ({ ...prev, allowSwap: !prev.allowSwap }));
              }}
              style={[
                styles.toggleChip,
                {
                  backgroundColor: sessionConfig.allowSwap
                    ? `${activeTheme.accentColor}25`
                    : isLightMode
                    ? 'rgba(255, 255, 255, 0.45)'
                    : 'rgba(255, 255, 255, 0.04)',
                  borderColor: sessionConfig.allowSwap ? activeTheme.accentColor : isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            >
              <ArrowLeftRight size={13} color={sessionConfig.allowSwap ? activeTheme.accentColor : activeTheme.textMuted} />
              <Text
                style={[
                  styles.toggleText,
                  { color: sessionConfig.allowSwap ? activeTheme.accentColor : activeTheme.textSecondary },
                ]}
              >
                {lang === 'ar' ? 'تبديل اللعيبة' : 'Player Swap'}
              </Text>
            </TouchableOpacity>

            {/* Match Timer Toggle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hapticsService.impactLight();
                setSessionConfig((prev) => ({ ...prev, showTimer: !prev.showTimer }));
              }}
              style={[
                styles.toggleChip,
                {
                  backgroundColor: sessionConfig.showTimer
                    ? `${activeTheme.accentColor}25`
                    : isLightMode
                    ? 'rgba(255, 255, 255, 0.45)'
                    : 'rgba(255, 255, 255, 0.04)',
                  borderColor: sessionConfig.showTimer ? activeTheme.accentColor : isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            >
              <Clock size={13} color={sessionConfig.showTimer ? activeTheme.accentColor : activeTheme.textMuted} />
              <Text
                style={[
                  styles.toggleText,
                  { color: sessionConfig.showTimer ? activeTheme.accentColor : activeTheme.textSecondary },
                ]}
              >
                {lang === 'ar' ? 'ساعة الماتش' : 'Timer'}
              </Text>
            </TouchableOpacity>

            {/* Scoreboard Toggle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hapticsService.impactLight();
                setSessionConfig((prev) => ({ ...prev, showScoreboard: !prev.showScoreboard }));
              }}
              style={[
                styles.toggleChip,
                {
                  backgroundColor: sessionConfig.showScoreboard
                    ? `${activeTheme.accentColor}25`
                    : isLightMode
                    ? 'rgba(255, 255, 255, 0.45)'
                    : 'rgba(255, 255, 255, 0.04)',
                  borderColor: sessionConfig.showScoreboard ? activeTheme.accentColor : isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                },
              ]}
            >
              <Trophy size={13} color={sessionConfig.showScoreboard ? activeTheme.accentColor : activeTheme.textMuted} />
              <Text
                style={[
                  styles.toggleText,
                  { color: sessionConfig.showScoreboard ? activeTheme.accentColor : activeTheme.textSecondary },
                ]}
              >
                {lang === 'ar' ? 'لوحة الأهداف' : 'Score'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Main Generate Button with Gradient Charge in Egyptian dialect */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleGenerate}
          disabled={isCharging}
          style={styles.generateBtnTouchable}
        >
          <LinearGradient
            colors={activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateBtnGradient}
          >
            <Text style={styles.generateBtnText}>
              {isCharging
                ? (lang === 'ar' ? 'بنقسّم الفرق بالتساوي... ' : 'Balancing Squads... ')
                : (lang === 'ar' ? ' قسّم الفرق' : ' Generate Balanced Squads')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 4. Swap Selection Alert (Only if active & swapping is allowed) */}
        {sessionConfig.allowSwap && swapSelection && (
          <View
            style={[
              styles.swapNoticeCard,
              {
                backgroundColor: `${activeTheme.accentColor}25`,
                borderColor: activeTheme.accentColor,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Sparkles size={18} color={activeTheme.accentColor} />
            <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.swapNoticeTitle, { color: activeTheme.textPrimary }]}>
                {lang === 'ar'
                  ? `محدد: ${swapSelection.member.name}`
                  : `Selected: ${swapSelection.member.name}`}
              </Text>
              <Text style={[styles.swapNoticeDesc, { color: activeTheme.textSecondary }]}>
                {lang === 'ar'
                  ? 'اضغط على أي لاعب في فرقة تانية عشان تبدلهم مع بعض فوراً.'
                  : 'Tap any player in another team to swap them instantly.'}
              </Text>
            </View>
          </View>
        )}

        {/* Match Timer Component (if enabled) */}
        {sessionConfig.showTimer && <MatchTimer />}

        {/* 5. Generated Teams Showcase */}
        {currentTeams && currentTeams.length > 0 && (
          <View
            style={styles.teamsSection}
            onLayout={(event) => {
              resultsYRef.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={[styles.teamsHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.teamsHeading, { color: activeTheme.textPrimary }]}>
                {lang === 'ar' ? 'تشكيلات الماتش' : 'Generated Squads'}
              </Text>
              {sessionConfig.allowSwap && (
                <Text style={[styles.swapHint, { color: activeTheme.textMuted }]}>
                  {lang === 'ar' ? '💡 اضغط على أي لاعب لتبديله' : '💡 Tap player to swap'}
                </Text>
              )}
            </View>

            <View style={styles.teamsList}>
              {currentTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  showScoreboard={sessionConfig.showScoreboard}
                  showStats={sessionConfig.showStats}
                  allowSwap={sessionConfig.allowSwap}
                />
              ))}
            </View>

            {/* Export & Actions Row */}
            <View style={styles.exportRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShareWhatsapp}
                style={[
                  styles.actionBtn,
                  { backgroundColor: '#25D366', borderColor: '#25D366' },
                ]}
              >
                <Share2 size={16} color="#ffffff" />
                <Text style={styles.actionBtnTextWhite}>
                  {lang === 'ar' ? 'مشاركة ع الواتساب' : 'WhatsApp'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveToHistory}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                    borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
                  },
                ]}
              >
                <Bookmark size={16} color={activeTheme.accentColor} />
                <Text style={[styles.actionBtnText, { color: activeTheme.textPrimary }]}>
                  {lang === 'ar' ? 'حفظ في السجل' : 'Save Squad'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Launch Tournament Button */}
            <GlowButton
              variant="secondary"
              title={lang === 'ar' ? 'ابدأ بطولة إقصائية للفرق دي 🏆' : 'Launch Tournament Bracket'}
              size="md"
              onPress={initTournamentFromTeams}
            />
          </View>
        )}
      </ScrollView>

      {/* Distinctive Custom Empty Roster Modal */}
      <Modal
        transparent={true}
        visible={showEmptyModal}
        animationType="fade"
        onRequestClose={() => setShowEmptyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowEmptyModal(false)}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isLightMode ? '#ffffff' : activeTheme.bgCard || '#0f172a',
                borderColor: activeTheme.borderFocus || activeTheme.accentColor,
              },
            ]}
          >
            {/* Top Luminous Halo & Icon Disc */}
            <View style={[styles.modalIconGlow, { backgroundColor: `${activeTheme.accentColor}22` }]}>
              <LinearGradient
                colors={activeTheme.gradientColors || ['#38bdf8', '#6366f1']}
                style={styles.modalIconCircle}
              >
                <UserPlus size={28} color="#ffffff" />
              </LinearGradient>
            </View>

            {/* Title & Badge */}
            <Text style={[styles.modalTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'قائمة اللعيبة غير مكتملة!' : 'Squad Roster Incomplete!'}
            </Text>

            <View
              style={[
                styles.modalCountBadge,
                { backgroundColor: `${activeTheme.accentColor}18`, borderColor: `${activeTheme.accentColor}40` },
              ]}
            >
              <Users size={13} color={activeTheme.accentColor} />
              <Text style={[styles.modalCountText, { color: activeTheme.accentColor }]}>
                {lang === 'ar'
                  ? (members.length === 0 ? 'مفيش أي لعيبة متسجلة' : 'فيه لاعب واحد بس')
                  : (members.length === 0 ? 'No players registered yet' : 'Only 1 player in squad')}
              </Text>
            </View>

            {/* Description */}
            <Text style={[styles.modalDescription, { color: activeTheme.textSecondary }]}>
              {lang === 'ar'
                ? 'عشان تقسم الفرق وتوزع الماتشات بالعدل، لازم تضيف لاعبين اتنين (2) على الأقل في القائمة الأول.'
                : 'To generate balanced teams and matches, you need at least 2 players in your squad roster.'}
            </Text>

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  hapticsService.impactMedium();
                  setShowEmptyModal(false);
                  setActiveTab('members');
                }}
                style={styles.modalPrimaryBtn}
              >
                <LinearGradient
                  colors={activeTheme.gradientColors || ['#38bdf8', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalPrimaryGradient}
                >
                  <UserPlus size={16} color="#ffffff" />
                  <Text style={styles.modalPrimaryBtnText}>
                    {lang === 'ar' ? 'ضيف لعيبة دلوقتي 🚀' : 'Add Players Now 🚀'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  hapticsService.impactLight();
                  setShowEmptyModal(false);
                }}
                style={[styles.modalCancelBtn, { borderColor: activeTheme.borderSubtle }]}
              >
                <Text style={[styles.modalCancelBtnText, { color: activeTheme.textMuted }]}>
                  {lang === 'ar' ? 'إلغاء' : 'Dismiss'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    height: Math.max(480, SCREEN_H * 0.6),
    opacity: 0.52,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  squadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  squadBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  configCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 14,
    gap: 14,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sectionBlock: {
    gap: 8,
  },
  labelRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  teamStepperHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1.2,
    gap: 8,
  },
  teamStepIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamHeroDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamHeroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  teamHeroNumber: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  teamHeroLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  customBadgeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customBadgeTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  rangeTrackContainer: {
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  rangeSegmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rangeSegmentPoint: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  rangeTickDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rangeTickNumber: {
    fontSize: 11,
  },
  customTeamRowWrapper: {
    gap: 8,
  },
  moreTeamsBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreTeamsBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  customNumberInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  customNumberLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  customNumberTextInput: {
    width: 60,
    height: 36,
    borderWidth: 1.5,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  customNumberApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  customNumberApplyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  algoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  algoCard: {
    width: '48.5%',
    borderRadius: 14,
    padding: 10,
    gap: 4,
  },
  algoCardTop: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  algoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  algoTitleText: {
    fontSize: 12,
    marginTop: 2,
  },
  algoDescText: {
    fontSize: 10,
    lineHeight: 14,
  },
  togglesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  generateBtnTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  swapNoticeCard: {
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  swapNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  swapNoticeDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  teamsSection: {
    gap: 14,
    marginTop: 4,
  },
  teamsHeaderRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamsHeading: {
    fontSize: 17,
    fontWeight: '900',
  },
  swapHint: {
    fontSize: 11.5,
  },
  teamsList: {
    gap: 12,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnTextWhite: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    gap: 12,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalIconGlow: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginBottom: 4,
  },
  modalIconCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCountText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  modalActionsRow: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  modalPrimaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
  },
  modalPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  modalCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
