import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, RadialGradient as SvgRadial, Defs, Stop, Rect, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import { audioService } from '../services/audioService';
import {
  Crown,
  HeartHandshake,
  Swords,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Users,
  UserCheck,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FINGER_ART = require('../../assets/images/finger_art.jpg');

const MODE_PALETTES = {
  winners: [
    '#00f0ff', // 1. Electric Neon Cyan
    '#ff0055', // 2. Laser Crimson Red
    '#00ff66', // 3. Hyper Lime / Emerald Green
    '#ffcc00', // 4. Imperial Sun Gold
    '#9933ff', // 5. Cosmic Ultra Violet
    '#ff6600', // 6. Electric Blaze Orange
    '#0066ff', // 7. Royal Deep Sapphire Blue
    '#ff00cc', // 8. Hot Cyber Magenta
    '#00ffcc', // 9. Mint Turquoise
    '#f59e0b', // 10. Warm Amber
  ],
  pairs: [
    '#00f0ff', // Pair 1: Cyan
    '#ff0055', // Pair 2: Crimson
    '#00ff66', // Pair 3: Lime
    '#ffcc00', // Pair 4: Gold
    '#9933ff', // Pair 5: Violet
    '#ff6600', // Pair 6: Orange
  ],
  teams: [
    '#0066ff', // Team 1: Royal Blue
    '#ff0055', // Team 2: Laser Red
    '#00ff66', // Team 3: Emerald Lime
    '#ffcc00', // Team 4: Sun Gold
    '#9933ff', // Team 5: Ultra Violet
    '#ff6600', // Team 6: Blaze Orange
  ],
};

const NODE_SIZE = 76;
const NODE_HALF = NODE_SIZE / 2;

export function FingerChooserScreen() {
  const { activeTheme, themeId } = useTheme();
  const { lang, isRTL } = useLanguage();
  const { setActiveTab } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  const [mode, setMode] = useState('winners'); // 'winners' | 'pairs' | 'teams'
  const [winnersCount, setWinnersCount] = useState(1);
  const [teamsCount, setTeamsCount] = useState(2);

  const [touches, setTouches] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [results, setResults] = useState(null);

  const countdownTimer = useRef(null);
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  const activePalette = MODE_PALETTES[mode] || MODE_PALETTES.winners;

  const modes = [
    { id: 'winners', label: lang === 'ar' ? 'فائز' : 'Winner', icon: Crown, color: '#fbbf24' },
    { id: 'pairs', label: lang === 'ar' ? 'ثنائيات' : 'Pairs', icon: UserCheck, color: '#00f5d4' },
    { id: 'teams', label: lang === 'ar' ? 'فرق' : 'Teams', icon: Users, color: '#ec4899' },
  ];

  // Ambient pulsing glow wave
  useEffect(() => {
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

  // Reset when changing mode
  useEffect(() => {
    resetArena();
  }, [mode, winnersCount, teamsCount]);

  // Monitor touches for auto-countdown trigger
  useEffect(() => {
    if (results) return;

    if (touches.length >= 2) {
      if (countdown === null) {
        setCountdown(3);
        hapticsService.impactHeavy();
        audioService.playCharge();
      }
    } else {
      if (countdown !== null) {
        clearTimeout(countdownTimer.current);
        setCountdown(null);
      }
    }
  }, [touches.length, results]);

  // Handle countdown interval
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownTimer.current = setTimeout(() => {
        hapticsService.impactMedium();
        audioService.playTick();
        setCountdown((prev) => prev - 1);
      }, 750);
    } else if (countdown === 0) {
      finalizeDecision();
    }
    return () => clearTimeout(countdownTimer.current);
  }, [countdown]);

  const finalizeDecision = () => {
    hapticsService.success();
    audioService.playSuccess();
    setCountdown(null);

    const touchList = [...touches];
    if (touchList.length < 2) return;

    if (mode === 'winners') {
      const shuffled = [...touchList].sort(() => Math.random() - 0.5);
      const count = Math.min(winnersCount, touchList.length);
      const selectedWinners = shuffled.slice(0, count).map((t) => t.id);
      setResults({ winners: selectedWinners });
    } else if (mode === 'pairs') {
      const shuffled = [...touchList].sort(() => Math.random() - 0.5);
      const pairs = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
          pairs.push([shuffled[i], shuffled[i + 1]]);
        }
      }
      setResults({ pairs });
    } else if (mode === 'teams') {
      const shuffled = [...touchList].sort(() => Math.random() - 0.5);
      const teamMap = {};
      shuffled.forEach((touch, idx) => {
        const teamIdx = idx % teamsCount;
        teamMap[touch.id] = teamIdx;
      });
      setResults({ teams: teamMap });
    }
  };

  const resetArena = () => {
    setTouches([]);
    setCountdown(null);
    setResults(null);
    if (countdownTimer.current) {
      clearTimeout(countdownTimer.current);
    }
    hapticsService.impactLight();
  };

  // Cycle count with higher limit support (winners up to 10)
  const handleCycleCount = () => {
    hapticsService.impactLight();
    if (mode === 'winners') {
      setWinnersCount((prev) => (prev >= 10 ? 1 : prev + 1));
    } else if (mode === 'teams') {
      setTeamsCount((prev) => (prev >= 6 ? 2 : prev + 1));
    }
  };

  // Pixel-Perfect Touch Coordinates Handler
  const updateTouchPoints = (nativeTouches) => {
    if (results) return;
    const touchesArray = Array.from(nativeTouches || []);
    
    if (touchesArray.length === 0) {
      setTouches([]);
      return;
    }

    const formatted = touchesArray.map((t, idx) => {
      const id = String(t.identifier !== undefined ? t.identifier : idx);
      const color = activePalette[idx % activePalette.length];
      const posX = t.locationX !== undefined ? t.locationX : t.pageX;
      const posY = t.locationY !== undefined ? t.locationY : t.pageY;

      return {
        id,
        x: posX,
        y: posY,
        color,
        label: idx + 1,
      };
    });

    setTouches(formatted);
  };

  return (
    <View style={[styles.fullScreen, { backgroundColor: isLightMode ? '#f8fafc' : '#030511' }]}>
      {/* 1. Legendary Fixed Backdrop Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isLightMode ? '#f8fafc' : '#030511' },
          ]}
        />

        {/* Hero Finger Chooser Artwork */}
        <Image
          source={FINGER_ART}
          style={styles.heroBackdropArt}
          resizeMode="cover"
        />

        {/* Multi-Stop Cinematic Vignette Gradient Overlay */}
        <LinearGradient
          colors={
            isLightMode
              ? [
                  'rgba(248, 250, 252, 0.42)',
                  'rgba(248, 250, 252, 0.78)',
                  'rgba(248, 250, 252, 0.94)',
                  '#f8fafc',
                ]
              : [
                  'rgba(3, 5, 17, 0.42)',
                  'rgba(3, 5, 17, 0.72)',
                  'rgba(3, 5, 17, 0.92)',
                  '#030511',
                ]
          }
          locations={[0, 0.25, 0.6, 0.94]}
          style={StyleSheet.absoluteFill}
        />

        {/* Svg Cyber Flares & Celestial Arena Geometry */}
        <Svg style={StyleSheet.absoluteFill} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <SvgRadial id="fingerFlarePrimary" cx="50%" cy="30%" r="60%">
              <Stop
                offset="0%"
                stopColor={activeTheme.accentColor || '#00f0ff'}
                stopOpacity={isLightMode ? 0.35 : 0.45}
              />
              <Stop
                offset="60%"
                stopColor={activeTheme.accentSecondary || '#a855f7'}
                stopOpacity={isLightMode ? 0.1 : 0.15}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>

            <SvgRadial id="fingerFlareGold" cx="80%" cy="70%" r="50%">
              <Stop
                offset="0%"
                stopColor="#fbbf24"
                stopOpacity={isLightMode ? 0.2 : 0.3}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>
          </Defs>

          <Rect x="0" y="0" width="100%" height="100%" fill="url(#fingerFlarePrimary)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#fingerFlareGold)" />

          {/* Futuristic Concentric Arena Circles */}
          <Circle
            cx={SCREEN_WIDTH / 2}
            cy={SCREEN_HEIGHT / 2}
            r={130}
            stroke={isLightMode ? '#cbd5e1' : activeTheme.accentColor}
            strokeWidth="1.2"
            strokeDasharray="6, 10"
            strokeOpacity={isLightMode ? 0.28 : 0.22}
            fill="none"
          />
          <Circle
            cx={SCREEN_WIDTH / 2}
            cy={SCREEN_HEIGHT / 2}
            r={210}
            stroke={isLightMode ? '#cbd5e1' : '#00f0ff'}
            strokeWidth="1"
            strokeDasharray="4, 14"
            strokeOpacity={isLightMode ? 0.2 : 0.14}
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
            colors={['transparent', `${activeTheme.accentColor}10`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* 2. Sleek Floating Top Control Capsule - Transparent Crystal Glass */}
      <View style={styles.topControlCapsule}>
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            hapticsService.impactLight();
            setActiveTab('home');
          }}
          style={[
            styles.cleanBackBtn,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
            },
          ]}
        >
          {isRTL ? <ArrowRight size={15} color={activeTheme.accentColor} /> : <ArrowLeft size={15} color={activeTheme.accentColor} />}
          <Text style={[styles.cleanBackText, { color: activeTheme.textPrimary }]}>
            {lang === 'ar' ? 'الرئيسية' : 'Home'}
          </Text>
        </TouchableOpacity>

        {/* Minimalist 3-Mode Segmented Pill */}
        <View
          style={[
            styles.modeSegmentedPill,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
            },
          ]}
        >
          {modes.map((m) => {
            const isSelected = mode === m.id;
            const Icon = m.icon;
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.8}
                onPress={() => {
                  hapticsService.impactLight();
                  setMode(m.id);
                }}
                style={[
                  styles.modeIconSegment,
                  isSelected && {
                    backgroundColor: m.color,
                  },
                ]}
              >
                <Icon size={14} color={isSelected ? (m.id === 'winners' ? '#000000' : '#ffffff') : activeTheme.textSecondary} />
                <Text
                  style={[
                    styles.modeSegmentLabel,
                    {
                      color: isSelected ? (m.id === 'winners' ? '#000000' : '#ffffff') : activeTheme.textSecondary,
                      fontWeight: isSelected ? '900' : '600',
                    },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic Count Switcher (Supports up to 10 winners) or Reset Button */}
        {touches.length > 0 ? (
          <TouchableOpacity
            onPress={resetArena}
            style={[
              styles.resetCapsuleBtn,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                borderColor: 'rgba(239, 68, 68, 0.5)',
              },
            ]}
          >
            <RefreshCw size={14} color="#f87171" />
          </TouchableOpacity>
        ) : (
          mode !== 'pairs' && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCycleCount}
              style={[
                styles.countBadgePill,
                {
                  backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
                  borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
                },
              ]}
            >
              <Text style={[styles.countBadgeText, { color: activeTheme.accentColor }]}>
                {mode === 'winners' ? `👑 ${winnersCount}` : `⚔️ ${teamsCount}`}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* 3. Pure Touch Arena Surface */}
      <View
        onTouchStart={(e) => updateTouchPoints(e.nativeEvent.touches)}
        onTouchMove={(e) => updateTouchPoints(e.nativeEvent.touches)}
        onTouchEnd={(e) => updateTouchPoints(e.nativeEvent.touches)}
        onTouchCancel={(e) => updateTouchPoints(e.nativeEvent.touches)}
        style={styles.touchCaptureArea}
      >
        {/* Subtle Celestial Pulsing Rings */}
        <View pointerEvents="none" style={styles.celestialGrid}>
          <View style={[styles.arcaneRing1, { borderColor: isLightMode ? 'rgba(2, 132, 199, 0.22)' : `${activeTheme.accentColor}18` }]} />
          <View style={[styles.arcaneRing2, { borderColor: isLightMode ? 'rgba(2, 132, 199, 0.12)' : `${activeTheme.accentColor}08` }]} />
        </View>

        {/* Pure Glowing Countdown Typography */}
        {countdown !== null && (
          <View pointerEvents="none" style={styles.countdownCenterWrapper}>
            <Text
              style={[
                styles.countdownPureNumber,
                {
                  color: countdown === 0 ? '#d97706' : isLightMode ? '#0284c7' : '#ffffff',
                  textShadowColor: countdown === 0 ? '#fbbf24' : isLightMode ? 'rgba(2, 132, 199, 0.35)' : activeTheme.accentColor,
                },
              ]}
            >
              {countdown === 0 ? '⚡' : countdown}
            </Text>
          </View>
        )}

        {/* Laser Energy Beams for Pairs Mode */}
        {results?.pairs && (
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
            {results.pairs.map((pair, idx) => (
              <Line
                key={idx}
                x1={pair[0].x}
                y1={pair[0].y}
                x2={pair[1].x}
                y2={pair[1].y}
                stroke={activePalette[idx % activePalette.length]}
                strokeWidth="6"
                strokeDasharray="10, 5"
              />
            ))}
          </Svg>
        )}

        {/* Holographic Radar Rings under each touched finger */}
        {touches.map((touch) => {
          const isWinner = results?.winners?.includes(touch.id);
          const teamIdx = results?.teams ? results.teams[touch.id] : null;
          const nodeColor = isWinner
            ? '#fbbf24'
            : teamIdx !== null && teamIdx !== undefined
            ? activePalette[teamIdx % activePalette.length]
            : touch.color;

          return (
            <View
              key={touch.id}
              pointerEvents="none"
              style={[
                styles.hologramTouchNode,
                {
                  left: touch.x - NODE_HALF,
                  top: touch.y - NODE_HALF,
                  borderColor: isWinner ? '#fbbf24' : nodeColor,
                  shadowColor: isWinner ? '#fbbf24' : nodeColor,
                  transform: [{ scale: isWinner ? 1.3 : 1 }],
                },
              ]}
            >
              {/* Outer Dashed Radar Ring */}
              <View style={[styles.outerRadarRing, { borderColor: `${nodeColor}70` }]} />

              {/* Winner Floating Crown */}
              {isWinner && (
                <View style={styles.floatingCrownBadge}>
                  <Crown size={28} color="#fbbf24" />
                </View>
              )}

              {/* Glowing Center Core Dot */}
              <View
                style={[
                  styles.centerGlowCore,
                  {
                    backgroundColor: isWinner ? '#fbbf24' : nodeColor,
                    shadowColor: isWinner ? '#fbbf24' : nodeColor,
                  },
                ]}
              >
                <Text style={[styles.centerCoreText, isWinner && { color: '#000000' }]}>
                  {isWinner
                    ? '👑'
                    : teamIdx !== null && teamIdx !== undefined
                    ? `T${teamIdx + 1}`
                    : touch.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackdropArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    opacity: 0.58,
  },
  topControlCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
    zIndex: 30,
  },
  cleanBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  cleanBackText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  modeSegmentedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 3,
    gap: 3,
  },
  modeIconSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  modeSegmentLabel: {
    fontSize: 11.5,
  },
  countBadgePill: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  countBadgeText: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  resetCapsuleBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchCaptureArea: {
    flex: 1,
    position: 'relative',
  },
  celestialGrid: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcaneRing1: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  arcaneRing2: {
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 1,
    position: 'absolute',
  },
  countdownCenterWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  countdownPureNumber: {
    fontSize: 100,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  hologramTouchNode: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_HALF,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    zIndex: 20,
  },
  outerRadarRing: {
    position: 'absolute',
    width: NODE_SIZE + 18,
    height: NODE_SIZE + 18,
    borderRadius: (NODE_SIZE + 18) / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  floatingCrownBadge: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
  },
  centerGlowCore: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  centerCoreText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
});
