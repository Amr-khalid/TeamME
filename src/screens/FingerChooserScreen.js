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
  Platform,
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
  Sparkles,
  Zap,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Users,
  UserCheck,
  Timer,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FINGER_ART = require('../../assets/images/finger_art.jpg');

const MODE_PALETTES = {
  winners: [
    '#00f0ff', // 1. Electric Neon Cyan
    '#ff0055', // 2. Laser Crimson Red
    '#00ff66', // 3. Hyper Lime / Emerald Green
    '#e2e8f0', // 4. Platinum Silver (Replaced Gold)
    '#9933ff', // 5. Cosmic Ultra Violet
    '#ff6600', // 6. Electric Blaze Orange
    '#0066ff', // 7. Royal Deep Sapphire Blue
    '#ff00cc', // 8. Hot Cyber Magenta
    '#00ffcc', // 9. Mint Turquoise
    '#cbd5e1', // 10. Titanium Silver (Replaced Amber)
  ],
  pairs: [
    '#00f0ff', // Pair 1: Cyan
    '#ff0055', // Pair 2: Crimson
    '#00ff66', // Pair 3: Lime
    '#e2e8f0', // Pair 4: Platinum Silver
    '#9933ff', // Pair 5: Violet
    '#ff6600', // Pair 6: Orange
  ],
  teams: [
    '#0066ff', // Team 1: Royal Blue
    '#ff0055', // Team 2: Laser Red
    '#00ff66', // Team 3: Emerald Lime
    '#e2e8f0', // Team 4: Platinum Silver
    '#9933ff', // Team 5: Ultra Violet
    '#ff6600', // Team 6: Blaze Orange
  ],
};

const NODE_SIZE = 78;
const NODE_HALF = NODE_SIZE / 2;

export function FingerChooserScreen() {
  const { activeTheme, themeId } = useTheme();
  const { lang, isRTL } = useLanguage();
  const { setActiveTab } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  const [mode, setMode] = useState('winners'); // 'winners' | 'pairs' | 'teams'
  const [winnersCount, setWinnersCount] = useState(1);
  const [teamsCount, setTeamsCount] = useState(2);
  const [countdownDuration, setCountdownDuration] = useState(1); // Default to 1 second

  const [touches, setTouches] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [results, setResults] = useState(null);

  // Moving Light & Roulette Animation States
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanId, setActiveScanId] = useState(null);
  const [laserTrail, setLaserTrail] = useState(null);

  const countdownTimer = useRef(null);
  const scanTimeouts = useRef([]);

  // Animated values
  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const spotlightPos = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 })).current;
  const spotlightScale = useRef(new Animated.Value(0)).current;
  const shockwaveScale = useRef(new Animated.Value(0.8)).current;
  const shockwaveOpacity = useRef(new Animated.Value(0)).current;
  const crownDropAnim = useRef(new Animated.Value(-45)).current;
  const winnerNodeScale = useRef(new Animated.Value(1)).current;
  const winnerPulseAura = useRef(new Animated.Value(0.8)).current;
  const rotatingRays = useRef(new Animated.Value(0)).current;

  const activePalette = MODE_PALETTES[mode] || MODE_PALETTES.winners;

  const modes = [
    { id: 'winners', label: lang === 'ar' ? 'فائز' : 'Winner', icon: Crown, color: '#e2e8f0' },
    { id: 'pairs', label: lang === 'ar' ? 'ثنائيات' : 'Pairs', icon: UserCheck, color: '#00f5d4' },
    { id: 'teams', label: lang === 'ar' ? 'فرق' : 'Teams', icon: Users, color: '#ec4899' },
  ];

  // Ambient pulsing glow wave & Continuous Rotating Rings
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

    // Continuous Rotating Sunburst Rays
    Animated.loop(
      Animated.timing(rotatingRays, {
        toValue: 1,
        duration: 4500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Winner Aura Breathing Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(winnerPulseAura, {
          toValue: 1.3,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(winnerPulseAura, {
          toValue: 0.9,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Clear timeouts helper
  const clearScanTimeouts = () => {
    scanTimeouts.current.forEach((t) => clearTimeout(t));
    scanTimeouts.current = [];
  };

  // Reset when changing mode
  useEffect(() => {
    resetArena();
  }, [mode, winnersCount, teamsCount]);

  // Monitor touches for auto-countdown trigger
  useEffect(() => {
    if (results || isScanning) return;

    if (touches.length >= 2) {
      if (countdown === null) {
        setCountdown(countdownDuration);
        hapticsService.impactHeavy();
        audioService.playCharge();
      }
    } else {
      if (countdown !== null) {
        clearTimeout(countdownTimer.current);
        setCountdown(null);
      }
    }
  }, [touches.length, results, isScanning, countdownDuration]);

  // Handle countdown interval
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownTimer.current = setTimeout(() => {
        hapticsService.impactMedium();
        audioService.playTick();
        setCountdown((prev) => prev - 1);
      }, 750);
    } else if (countdown === 0) {
      startMovingLightRoulette(touches);
    }
    return () => clearTimeout(countdownTimer.current);
  }, [countdown]);

  // 🌟 Spectacular Moving Light Roulette Scanner
  const startMovingLightRoulette = (touchList) => {
    if (!touchList || touchList.length < 2) return;

    clearScanTimeouts();
    setCountdown(null);
    setIsScanning(true);

    // 1. Pre-calculate outcomes
    const shuffled = [...touchList].sort(() => Math.random() - 0.5);
    let finalWinners = [];
    let finalPairs = [];
    let finalTeams = {};

    if (mode === 'winners') {
      const count = Math.min(winnersCount, touchList.length);
      finalWinners = shuffled.slice(0, count).map((t) => t.id);
    } else if (mode === 'pairs') {
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
          finalPairs.push([shuffled[i], shuffled[i + 1]]);
        }
      }
    } else if (mode === 'teams') {
      shuffled.forEach((touch, idx) => {
        const teamIdx = idx % teamsCount;
        finalTeams[touch.id] = teamIdx;
      });
    }

    // Target final winner to land spotlight on
    const targetWinnerId = mode === 'winners' ? finalWinners[0] : shuffled[0].id;
    const targetWinnerIndex = touchList.findIndex((t) => t.id === targetWinnerId);

    // Initial spotlight pop-in at first touched finger
    const startTouch = touchList[0];
    spotlightPos.setValue({ x: startTouch.x - 40, y: startTouch.y - 40 });
    Animated.spring(spotlightScale, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // 2. Physics-based decelerating step schedule (Fast -> Suspenseful slow)
    const baseDelays = [40, 42, 45, 50, 58, 70, 85, 105, 135, 175, 230, 300, 400, 520];
    const numSteps = baseDelays.length;

    // Sequence of indices ending precisely on targetWinnerIndex
    let hopSequence = [];
    let curIdx = 0;
    for (let s = 0; s < numSteps - 1; s++) {
      curIdx = (curIdx + 1 + Math.floor(Math.random() * (touchList.length - 1))) % touchList.length;
      hopSequence.push(curIdx);
    }
    hopSequence.push(targetWinnerIndex >= 0 ? targetWinnerIndex : 0);

    let cumulativeTime = 0;

    hopSequence.forEach((hopIdx, stepIdx) => {
      const stepDelay = baseDelays[stepIdx];
      cumulativeTime += stepDelay;

      const timeoutId = setTimeout(() => {
        const candidateTouch = touchList[hopIdx];
        if (!candidateTouch) return;

        setActiveScanId(candidateTouch.id);

        // Previous touch for drawing trailing laser beam
        const prevHopIdx = stepIdx > 0 ? hopSequence[stepIdx - 1] : 0;
        const prevTouch = touchList[prevHopIdx];
        if (prevTouch && prevTouch.id !== candidateTouch.id) {
          setLaserTrail({
            x1: prevTouch.x,
            y1: prevTouch.y,
            x2: candidateTouch.x,
            y2: candidateTouch.y,
            color: '#ffffff',
          });
        }

        // Animate spotlight position smoothly
        Animated.timing(spotlightPos, {
          toValue: { x: candidateTouch.x - 40, y: candidateTouch.y - 40 },
          duration: Math.min(stepDelay * 0.85, 130),
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();

        // Audio & Haptic Tick
        hapticsService.impactLight();
        audioService.playTick();

        // Final step: Trigger Coronation Explosion!
        if (stepIdx === hopSequence.length - 1) {
          setTimeout(() => {
            triggerWinnerCoronation({
              winners: finalWinners,
              pairs: finalPairs.length > 0 ? finalPairs : null,
              teams: Object.keys(finalTeams).length > 0 ? finalTeams : null,
            });
          }, 90);
        }
      }, cumulativeTime);

      scanTimeouts.current.push(timeoutId);
    });
  };

  // 👑 Winner Coronation & Shockwave Burst Sequence
  const triggerWinnerCoronation = (finalResults) => {
    setIsScanning(false);
    setActiveScanId(null);
    setLaserTrail(null);
    setResults(finalResults);

    // Fade out moving spotlight
    Animated.timing(spotlightScale, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Shockwave explosion animation (4.5x scale in Silver/Chrome/Cyan)
    shockwaveScale.setValue(0.8);
    shockwaveOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(shockwaveScale, {
        toValue: 4.5,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shockwaveOpacity, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Winner node spring bounce
    winnerNodeScale.setValue(0.65);
    Animated.spring(winnerNodeScale, {
      toValue: 1.38,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Royal Crown drop bounce
    crownDropAnim.setValue(-55);
    Animated.spring(crownDropAnim, {
      toValue: 0,
      friction: 3.5,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Victory Fanfare & Heavy Haptics
    hapticsService.success();
    audioService.playTrophy();
  };

  const resetArena = () => {
    clearScanTimeouts();
    setTouches([]);
    setCountdown(null);
    setResults(null);
    setIsScanning(false);
    setActiveScanId(null);
    setLaserTrail(null);
    spotlightScale.setValue(0);
    shockwaveOpacity.setValue(0);
    winnerNodeScale.setValue(1);
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

  // Cycle countdown duration: 1s, 2s, 3s, 5s, 7s, 10s
  const durationOptions = [1, 2, 3, 5, 7, 10];
  const handleCycleDuration = () => {
    hapticsService.impactLight();
    setCountdownDuration((prev) => {
      const idx = durationOptions.indexOf(prev);
      const nextIdx = (idx + 1) % durationOptions.length;
      return durationOptions[nextIdx];
    });
  };

  // Pixel-Perfect Touch Coordinates Handler
  const updateTouchPoints = (nativeTouches) => {
    if (results || isScanning) return;
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

  const spinAngle = rotatingRays.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinAngleReverse = rotatingRays.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

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

            <SvgRadial id="fingerFlareSilver" cx="80%" cy="70%" r="50%">
              <Stop
                offset="0%"
                stopColor="#ffffff"
                stopOpacity={isLightMode ? 0.25 : 0.35}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>
          </Defs>

          <Rect x="0" y="0" width="100%" height="100%" fill="url(#fingerFlarePrimary)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#fingerFlareSilver)" />

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

      {/* 2. Sleek Floating Top Control Capsule */}
      <View style={styles.topControlCapsule}>
        {/* Back Button (Compact) */}
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
                <Icon size={13} color={isSelected ? '#000000' : activeTheme.textSecondary} />
                <Text
                  style={[
                    styles.modeSegmentLabel,
                    {
                      color: isSelected ? '#000000' : activeTheme.textSecondary,
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

        {/* Right Side Actions: Duration Selector & Count Switcher / Reset */}
        <View style={styles.topRightActions}>
          {/* Dynamic Countdown Duration Switcher */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCycleDuration}
            style={[
              styles.timerBadgePill,
              {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.52)' : 'rgba(15, 23, 42, 0.45)',
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
              },
            ]}
          >
            <Timer size={12} color={activeTheme.accentColor} />
            <Text style={[styles.timerBadgeText, { color: activeTheme.accentColor }]}>
              {countdownDuration}s
            </Text>
          </TouchableOpacity>

          {/* Dynamic Count Switcher or Reset Button */}
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
              <RefreshCw size={13} color="#f87171" />
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

        {/* ⚡ High-Voltage Connecting Plasma Constellation Mesh */}
        {touches.length >= 2 && !results && (
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
            {touches.map((t, idx) => {
              const nextTouch = touches[(idx + 1) % touches.length];
              return (
                <Line
                  key={`mesh-${idx}`}
                  x1={t.x}
                  y1={t.y}
                  x2={nextTouch.x}
                  y2={nextTouch.y}
                  stroke={isScanning ? '#ffffff' : `${activeTheme.accentColor || '#00f0ff'}75`}
                  strokeWidth={isScanning ? '3.5' : '1.8'}
                  strokeDasharray={isScanning ? '8, 6' : '4, 8'}
                  opacity={isScanning ? 0.9 : 0.5}
                />
              );
            })}
          </Svg>
        )}

        {/* ⚡ High-Contrast Obsidian & Chrome Trailing Laser Beam Arc during Scan */}
        {laserTrail && (
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Line
              x1={laserTrail.x1}
              y1={laserTrail.y1}
              x2={laserTrail.x2}
              y2={laserTrail.y2}
              stroke="rgba(0, 0, 0, 0.85)"
              strokeWidth="7.5"
              strokeLinecap="round"
            />
            <Line
              x1={laserTrail.x1}
              y1={laserTrail.y1}
              x2={laserTrail.x2}
              y2={laserTrail.y2}
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </Svg>
        )}

        {/* 🌟 Professional Cyber Obsidian & Chrome Target Lock Selector */}
        {isScanning && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.movingSpotlightNode,
              {
                transform: [
                  { translateX: spotlightPos.x },
                  { translateY: spotlightPos.y },
                  { scale: spotlightScale },
                  { rotate: spinAngle },
                ],
              },
            ]}
          >
            {/* Outer Precision Target Reticle (Obsidian Black & Polished Chrome) */}
            <View style={styles.targetLockOuterRing}>
              <View style={styles.targetCornerTL} />
              <View style={styles.targetCornerTR} />
              <View style={styles.targetCornerBL} />
              <View style={styles.targetCornerBR} />
            </View>

            {/* Inner Rotating Chrome Compass Ring */}
            <View style={styles.targetLockInnerCompass} />

            {/* Jet Black Obsidian Core with Glowing White Center Dot */}
            <View style={styles.targetLockObsidianCore}>
              <View style={styles.targetLockCenterDot} />
            </View>
          </Animated.View>
        )}

        {/* Pure Glowing Countdown Typography */}
        {countdown !== null && (
          <View pointerEvents="none" style={styles.countdownCenterWrapper}>
            <Text
              style={[
                styles.countdownPureNumber,
                {
                  color: countdown === 0 ? '#ffffff' : isLightMode ? '#0284c7' : '#ffffff',
                  textShadowColor: countdown === 0 ? '#ffffff' : isLightMode ? 'rgba(2, 132, 199, 0.35)' : activeTheme.accentColor,
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
          const isCurrentlyScanned = isScanning && activeScanId === touch.id;
          const teamIdx = results?.teams ? results.teams[touch.id] : null;
          const isDimmed = results && !isWinner && teamIdx === null && !results?.pairs;

          const nodeColor = isWinner
            ? '#ffffff'
            : isCurrentlyScanned
            ? '#ffffff'
            : teamIdx !== null && teamIdx !== undefined
            ? activePalette[teamIdx % activePalette.length]
            : touch.color;

          return (
            <Animated.View
              key={touch.id}
              pointerEvents="none"
              style={[
                styles.hologramTouchNode,
                {
                  left: touch.x - NODE_HALF,
                  top: touch.y - NODE_HALF,
                  borderColor: isWinner ? '#ffffff' : nodeColor,
                  shadowColor: isWinner ? '#ffffff' : isCurrentlyScanned ? '#ffffff' : nodeColor,
                  opacity: isDimmed ? 0.3 : 1,
                  transform: [
                    { scale: isWinner ? winnerNodeScale : isCurrentlyScanned ? 1.25 : 1 },
                  ],
                },
              ]}
            >
              {/* Outer Dashed Radar Ring */}
              <View style={[styles.outerRadarRing, { borderColor: `${nodeColor}80` }]} />

              {/* 🌟 Ultra-Luxurious Platinum Silver & Diamond Winner Presentation */}
              {isWinner && (
                <>
                  {/* Triple Multi-Tier Supernova Shockwave Waves (Silver, Chrome, Cyan) */}
                  {/* Wave 1: Pure Platinum Silver */}
                  <Animated.View
                    style={[
                      styles.shockwaveRingSilver1,
                      {
                        transform: [{ scale: shockwaveScale }],
                        opacity: shockwaveOpacity,
                      },
                    ]}
                  />
                  {/* Wave 2: Diamond Aurora Cyan */}
                  <Animated.View
                    style={[
                      styles.shockwaveRingCyan,
                      {
                        transform: [{ scale: Animated.multiply(shockwaveScale, 0.86) }],
                        opacity: shockwaveOpacity,
                      },
                    ]}
                  />
                  {/* Wave 3: Titanium Steel Gray */}
                  <Animated.View
                    style={[
                      styles.shockwaveRingSilver3,
                      {
                        transform: [{ scale: Animated.multiply(shockwaveScale, 0.72) }],
                        opacity: shockwaveOpacity,
                      },
                    ]}
                  />

                  {/* Pulsing Winner Breathing Plasma Halo */}
                  <Animated.View
                    style={[
                      styles.winnerBreathingHalo,
                      {
                        transform: [{ scale: winnerPulseAura }],
                      },
                    ]}
                  />

                  {/* Outer Counter-Rotating Celestial Diamond Rune Ring */}
                  <Animated.View
                    style={[
                      styles.outerDiamondRuneRing,
                      {
                        transform: [{ rotate: spinAngleReverse }],
                      },
                    ]}
                  />

                  {/* Inner Rotating Pure Silver Sunburst Gear */}
                  <Animated.View
                    style={[
                      styles.sunburstRotatingRays,
                      {
                        transform: [{ rotate: spinAngle }],
                      },
                    ]}
                  />

                  {/* Grand Royal Floating Crown & Ornate Winner Badge */}
                  <Animated.View
                    style={[
                      styles.floatingCrownBadge,
                      {
                        transform: [{ translateY: crownDropAnim }],
                      },
                    ]}
                  >
                    {/* Glowing Arabic Ornate Prose Badge */}
                    <View style={styles.royalWinnerTitlePill}>
                      <Text style={styles.royalWinnerTitleText}>
                        {lang === 'ar' ? 'الْـفَـائِـزْ' : 'CHAMPION'}
                      </Text>
                    </View>

                    {/* 3D Platinum Silver Crown */}
                    <View style={styles.crownContainer}>
                      <Crown size={34} color="#ffffff" fill="#e2e8f0" />
                    </View>
                  </Animated.View>
                </>
              )}

              {/* Scanning Active Halo Ring */}
              {isCurrentlyScanned && (
                <View style={styles.scanTargetAura} />
              )}

              {/* Ultra-Luxurious Center Core Orb */}
              <View
                style={[
                  styles.centerGlowCore,
                  {
                    backgroundColor: isWinner ? '#ffffff' : nodeColor,
                    shadowColor: isWinner ? '#ffffff' : nodeColor,
                    borderColor: isWinner ? '#e2e8f0' : 'transparent',
                    borderWidth: isWinner ? 2 : 0,
                  },
                ]}
              >
                {/* Glossy Top Glass Highlight for Winner */}
                {isWinner && <View style={styles.glossHighlightTop} />}

                <Text
                  style={[
                    styles.centerCoreText,
                    isWinner && {
                      color: '#000000',
                      fontSize: 18,
                      fontWeight: '900',
                    },
                  ]}
                >
                  {isWinner
                    ? '👑'
                    : isCurrentlyScanned
                    ? '⚡'
                    : teamIdx !== null && teamIdx !== undefined
                    ? `T${teamIdx + 1}`
                    : touch.label}
                </Text>
              </View>
            </Animated.View>
          );
        })}

        {/* Floating Winner Confirmation Bottom Pill */}
        {results && (
          <View
            pointerEvents="box-none"
            style={styles.winnerBottomPillWrapper}
          >
            <View
              style={[
                styles.winnerBottomBanner,
                {
                  backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 12, 24, 0.94)',
                  borderColor: isLightMode ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.75)',
                },
              ]}
            >
              <View style={styles.winnerBannerContent}>
                <Crown size={22} color="#ffffff" fill="#e2e8f0" />
                <Text style={[styles.winnerBannerTitle, { color: activeTheme.textPrimary }]}>
                  {mode === 'winners'
                    ? (lang === 'ar' ? '' : '👑 Champion Crowned!')
                    : mode === 'pairs'
                    ? (lang === 'ar' ? '⚔️ تم توزيع الثنائيات!' : '⚔️ Pairs Matched!')
                    : (lang === 'ar' ? '🛡️ تم تشكيل الفرق!' : '🛡️ Teams Formed!')}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={resetArena}
                style={[styles.winnerRerollBtn, { backgroundColor: '#ffffff' }]}
              >
                <Text style={styles.winnerRerollBtnText}>
                  {lang === 'ar' ? 'إعادة' : 'Reset'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  timerBadgeText: {
    fontSize: 12,
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
    fontSize: 105,
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
    borderWidth: 2.4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.95,
    shadowRadius: 18,
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
    top: -56,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 70,
  },
  royalWinnerTitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 3,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  royalWinnerTitleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  crownContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlowCore: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  glossHighlightTop: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  centerCoreText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14.5,
  },
  movingSpotlightNode: {
    position: 'absolute',
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  targetLockOuterRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(5, 8, 18, 0.78)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCornerTL: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 10,
    height: 10,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#ffffff',
  },
  targetCornerTR: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#ffffff',
  },
  targetCornerBL: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 10,
    height: 10,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#ffffff',
  },
  targetCornerBR: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#ffffff',
  },
  targetLockInnerCompass: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    borderStyle: 'dashed',
  },
  targetLockObsidianCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  targetLockCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  shockwaveRingSilver1: {
    position: 'absolute',
    width: NODE_SIZE * 1.6,
    height: NODE_SIZE * 1.6,
    borderRadius: (NODE_SIZE * 1.6) / 2,
    borderWidth: 3.5,
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  shockwaveRingCyan: {
    position: 'absolute',
    width: NODE_SIZE * 2.2,
    height: NODE_SIZE * 2.2,
    borderRadius: (NODE_SIZE * 2.2) / 2,
    borderWidth: 2.5,
    borderColor: '#00f5d4',
    shadowColor: '#00f5d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  shockwaveRingSilver3: {
    position: 'absolute',
    width: NODE_SIZE * 2.8,
    height: NODE_SIZE * 2.8,
    borderRadius: (NODE_SIZE * 2.8) / 2,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  winnerBreathingHalo: {
    position: 'absolute',
    width: NODE_SIZE + 34,
    height: NODE_SIZE + 34,
    borderRadius: (NODE_SIZE + 34) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  sunburstRotatingRays: {
    position: 'absolute',
    width: NODE_SIZE + 24,
    height: NODE_SIZE + 24,
    borderRadius: (NODE_SIZE + 24) / 2,
    borderWidth: 2.2,
    borderColor: '#ffffff',
    borderStyle: 'dotted',
  },
  outerDiamondRuneRing: {
    position: 'absolute',
    width: NODE_SIZE + 44,
    height: NODE_SIZE + 44,
    borderRadius: (NODE_SIZE + 44) / 2,
    borderWidth: 1.5,
    borderColor: '#00f5d4',
    borderStyle: 'dashed',
  },
  scanTargetAura: {
    position: 'absolute',
    width: NODE_SIZE + 14,
    height: NODE_SIZE + 14,
    borderRadius: (NODE_SIZE + 14) / 2,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  winnerBottomPillWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 55,
  },
  winnerBottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1.8,
    gap: 14,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 14,
  },
  winnerBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  winnerBannerTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  winnerRerollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  winnerRerollBtnText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
