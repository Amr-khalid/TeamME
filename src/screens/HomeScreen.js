import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Polygon,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  ClipPath,
  Image as SvgImage,
  G,
} from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import {
  Zap,
  Users,
  Trophy,
  Touchpad,
  History,
  Settings,
  Dices,
} from 'lucide-react-native';

const { width: W, height: SCREEN_H } = Dimensions.get('window');
const NAV_H = Platform.OS === 'ios' ? 42 : 40;
const TOTAL_H = Math.max(SCREEN_H - NAV_H, 660);

// Local Art Assets for all 7 Shards
const GENERATOR_ART = require('../../assets/images/generator_art.jpg');
const ROSTER_ART = require('../../assets/images/roster_art.jpg');
const TOURNAMENT_ART = require('../../assets/images/tournament_art.jpg');
const FINGER_ART = require('../../assets/images/finger_art.jpg');
const ORACLE_ART = require('../../assets/images/oracle_art.jpg');
const HISTORY_ART = require('../../assets/images/history_art.jpg');
const SETTINGS_ART = require('../../assets/images/settings_art.jpg');

export function HomeScreen() {
  const { activeTheme } = useTheme();
  const { lang } = useLanguage();
  const { setActiveTab } = useAppData();

  // Subtle entrance & continuous oscillating silver-black shimmer wave
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerWave = useRef(new Animated.Value(0)).current;
  const subtleGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Silky Clean Entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // 2. Dynamic Continuous Shimmer Wave (Silver <-> Black oscillating cycle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerWave, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerWave, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Subtle Orb Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(subtleGlow, {
          toValue: 1.04,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(subtleGlow, {
          toValue: 1.0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleNavigate = (tabId) => {
    hapticsService.impactMedium();
    setActiveTab(tabId);
  };

  const MID = W / 2;
  const Y1 = TOTAL_H * 0.28;
  const Y1_APEX = TOTAL_H * 0.32;
  const Y2 = TOTAL_H * 0.52;
  const Y2_APEX = TOTAL_H * 0.55;
  const Y3 = TOTAL_H * 0.74;
  const Y3_APEX = TOTAL_H * 0.77;
  const Y4 = TOTAL_H;

  return (
    <ScrollView
      style={styles.fullScreenContainer}
      contentContainerStyle={styles.fullBleedContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* Animated Edge-to-Edge 3D Crystal Button Matrix */}
      <Animated.View
        style={[
          styles.canvasContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Base Layer: Images + Base Shading */}
        <Svg width={W} height={TOTAL_H} viewBox={`0 0 ${W} ${TOTAL_H}`}>
          <Defs>
            {/* Top Tile Clip (Hero Generator) */}
            <ClipPath id="clipTileHero">
              <Polygon points={`0,0 ${W},0 ${W},${Y1} ${MID},${Y1_APEX} 0,${Y1}`} />
            </ClipPath>

            {/* Row 2 Left Clip (Squad Roster) */}
            <ClipPath id="clipTileRoster">
              <Polygon points={`0,${Y1} ${MID},${Y1_APEX} ${MID - 15},${Y2_APEX} 0,${Y2}`} />
            </ClipPath>

            {/* Row 2 Right Clip (Finger Chooser) */}
            <ClipPath id="clipTileFinger">
              <Polygon points={`${MID},${Y1_APEX} ${W},${Y1} ${W},${Y2} ${MID - 15},${Y2_APEX}`} />
            </ClipPath>

            {/* Row 3 Left Clip (Oracle Wheel) */}
            <ClipPath id="clipTileOracle">
              <Polygon points={`0,${Y2} ${MID - 15},${Y2_APEX} ${MID + 15},${Y3_APEX} 0,${Y3}`} />
            </ClipPath>

            {/* Row 3 Right Clip (Tournament) */}
            <ClipPath id="clipTileTourn">
              <Polygon points={`${MID - 15},${Y2_APEX} ${W},${Y2} ${W},${Y3} ${MID + 15},${Y3_APEX}`} />
            </ClipPath>

            {/* Row 4 Left Clip (History Vault) */}
            <ClipPath id="clipTileHistory">
              <Polygon points={`0,${Y3} ${MID + 15},${Y3_APEX} ${MID},${Y4} 0,${Y4}`} />
            </ClipPath>

            {/* Row 4 Right Clip (Settings) */}
            <ClipPath id="clipTileSettings">
              <Polygon points={`${MID + 15},${Y3_APEX} ${W},${Y3} ${W},${Y4} ${MID},${Y4}`} />
            </ClipPath>

            {/* 3D Glossy Light Reflection Gradient */}
            <SvgGradient id="glossyHighlight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <Stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
              <Stop offset="75%" stopColor="#000000" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
            </SvgGradient>

            {/* Continuous Gradient A: Top Blazing Silver -> Bottom Deep Obsidian */}
            <SvgGradient id="gradSilverToBlack" x1="0" y1="0" x2="0" y2={TOTAL_H} gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="15%" stopColor="#f8fafc" stopOpacity="1" />
              <Stop offset="35%" stopColor="#cbd5e1" stopOpacity="1" />
              <Stop offset="58%" stopColor="#64748b" stopOpacity="0.95" />
              <Stop offset="80%" stopColor="#1e293b" stopOpacity="0.95" />
              <Stop offset="95%" stopColor="#090d16" stopOpacity="1" />
              <Stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </SvgGradient>

            {/* Continuous Gradient B: Top Deep Obsidian -> Bottom Blazing Silver extending to the absolute bottom */}
            <SvgGradient id="gradBlackToSilver" x1="0" y1="0" x2="0" y2={TOTAL_H} gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#020617" stopOpacity="1" />
              <Stop offset="8%" stopColor="#090d16" stopOpacity="1" />
              <Stop offset="25%" stopColor="#1e293b" stopOpacity="0.95" />
              <Stop offset="48%" stopColor="#64748b" stopOpacity="0.95" />
              <Stop offset="68%" stopColor="#cbd5e1" stopOpacity="1" />
              <Stop offset="84%" stopColor="#f1f5f9" stopOpacity="1" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </SvgGradient>

            {/* Radiant Glowing Bloom Halo (Supercharged Silver Luster extending all the way down) */}
            <SvgGradient id="gradSuperGlowA" x1="0" y1="0" x2="0" y2={TOTAL_H} gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.85" />
              <Stop offset="55%" stopColor="#94a3b8" stopOpacity="0.45" />
              <Stop offset="85%" stopColor="#1e293b" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
            </SvgGradient>

            <SvgGradient id="gradSuperGlowB" x1="0" y1="0" x2="0" y2={TOTAL_H} gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.0" />
              <Stop offset="25%" stopColor="#334155" stopOpacity="0.3" />
              <Stop offset="55%" stopColor="#94a3b8" stopOpacity="0.6" />
              <Stop offset="75%" stopColor="#e0f2fe" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </SvgGradient>
          </Defs>

          {/* 1. Hero Shard Button */}
          <G clipPath="url(#clipTileHero)">
            <SvgImage
              href={GENERATOR_ART}
              width={W}
              height={Y1_APEX + 30}
              preserveAspectRatio="xMidYMid slice"
            />
            <Polygon points={`0,0 ${W},0 ${W},${Y1_APEX + 30} 0,${Y1_APEX + 30}`} fill="url(#glossyHighlight)" />
          </G>

          {/* 2. Squad Roster Shard Button */}
          <G clipPath="url(#clipTileRoster)">
            <SvgImage
              href={ROSTER_ART}
              x="0"
              y={Y1 - 20}
              width={MID}
              height={Y2_APEX - Y1 + 40}
              preserveAspectRatio="xMidYMid slice"
            />
            <Polygon points={`0,${Y1 - 20} ${MID},${Y1 - 20} ${MID},${Y2_APEX + 20} 0,${Y2_APEX + 20}`} fill="url(#glossyHighlight)" />
          </G>

          {/* 3. Finger Chooser Shard Button */}
          <G clipPath="url(#clipTileFinger)">
            <SvgImage
              href={FINGER_ART}
              x={MID - 15}
              y={Y1 - 20}
              width={W - MID + 15}
              height={Y2_APEX - Y1 + 40}
              preserveAspectRatio="xMidYMid slice"
            />
            <Polygon points={`${MID - 15},${Y1 - 20} ${W},${Y1 - 20} ${W},${Y2_APEX + 20} ${MID - 15},${Y2_APEX + 20}`} fill="url(#glossyHighlight)" />
          </G>

          {/* 4. Oracle Wheel Shard Button */}
          <G clipPath="url(#clipTileOracle)">
            <SvgImage
              href={ORACLE_ART}
              x="0"
              y={Y2 - 20}
              width={MID + 15}
              height={Y3_APEX - Y2 + 40}
              preserveAspectRatio="xMidYMid slice"
            />
            <Polygon points={`0,${Y2 - 20} ${MID + 15},${Y2 - 20} ${MID + 15},${Y3_APEX + 20} 0,${Y3_APEX + 20}`} fill="url(#glossyHighlight)" />
          </G>

          {/* 5. Tournament Bracket Shard Button */}
          <G clipPath="url(#clipTileTourn)">
            <SvgImage
              href={TOURNAMENT_ART}
              x={MID - 15}
              y={Y2 - 20}
              width={W - MID + 15}
              height={Y3_APEX - Y2 + 40}
              preserveAspectRatio="xMidYMid slice"
            />
            <Polygon points={`${MID - 15},${Y2 - 20} ${W},${Y2 - 20} ${W},${Y3_APEX + 20} ${MID - 15},${Y3_APEX + 20}`} fill="url(#glossyHighlight)" />
          </G>

          {/* 6. History Vault Shard Button */}
          <G clipPath="url(#clipTileHistory)">
            <SvgImage
              href={HISTORY_ART}
              x="0"
              y={Y3 - 20}
              width={MID + 15}
              height={Y4 - Y3 + 30}
              preserveAspectRatio="xMidYMid slice"
            />
            <Polygon points={`0,${Y3 - 20} ${MID + 15},${Y3 - 20} ${MID + 15},${Y4 + 20} 0,${Y4 + 20}`} fill="url(#glossyHighlight)" />
          </G>

          {/* 7. Settings Shard Button */}
          <G clipPath="url(#clipTileSettings)">
            <SvgImage
              href={SETTINGS_ART}
              x={MID - 10}
              y={Y3 - 20}
              width={W - MID + 20}
              height={Y4 - Y3 + 30}
              preserveAspectRatio="xMidYMid slice"
            />
            <Polygon points={`${MID - 10},${Y3 - 20} ${W},${Y3 - 20} ${W},${Y4 + 20} ${MID - 10},${Y4 + 20}`} fill="url(#glossyHighlight)" />
          </G>

          {/* Supercharged Glowing Halo Bloom Layer A */}
          <Polygon
            points={`0,0 ${W},0 ${W},${Y1} ${MID},${Y1_APEX} 0,${Y1}`}
            stroke="url(#gradSuperGlowA)"
            strokeWidth="7"
            fill="none"
          />
          <Polygon
            points={`0,${Y1} ${MID},${Y1_APEX} ${MID - 15},${Y2_APEX} 0,${Y2}`}
            stroke="url(#gradSuperGlowA)"
            strokeWidth="6.5"
            fill="none"
          />
          <Polygon
            points={`${MID},${Y1_APEX} ${W},${Y1} ${W},${Y2} ${MID - 15},${Y2_APEX}`}
            stroke="url(#gradSuperGlowA)"
            strokeWidth="6.5"
            fill="none"
          />
          <Polygon
            points={`0,${Y2} ${MID - 15},${Y2_APEX} ${MID + 15},${Y3_APEX} 0,${Y3}`}
            stroke="url(#gradSuperGlowA)"
            strokeWidth="6.5"
            fill="none"
          />
          <Polygon
            points={`${MID - 15},${Y2_APEX} ${W},${Y2} ${W},${Y3} ${MID + 15},${Y3_APEX}`}
            stroke="url(#gradSuperGlowA)"
            strokeWidth="6.5"
            fill="none"
          />
          <Polygon
            points={`0,${Y3} ${MID + 15},${Y3_APEX} ${MID},${Y4} 0,${Y4}`}
            stroke="url(#gradSuperGlowA)"
            strokeWidth="6.5"
            fill="none"
          />
          <Polygon
            points={`${MID + 15},${Y3_APEX} ${W},${Y3} ${W},${Y4} ${MID},${Y4}`}
            stroke="url(#gradSuperGlowA)"
            strokeWidth="6.5"
            fill="none"
          />

          {/* Primary Sharp Silver Core Stroke */}
          <Polygon
            points={`0,0 ${W},0 ${W},${Y1} ${MID},${Y1_APEX} 0,${Y1}`}
            stroke="url(#gradSilverToBlack)"
            strokeWidth="3.8"
            fill="none"
          />
          <Polygon
            points={`0,${Y1} ${MID},${Y1_APEX} ${MID - 15},${Y2_APEX} 0,${Y2}`}
            stroke="url(#gradSilverToBlack)"
            strokeWidth="3.5"
            fill="none"
          />
          <Polygon
            points={`${MID},${Y1_APEX} ${W},${Y1} ${W},${Y2} ${MID - 15},${Y2_APEX}`}
            stroke="url(#gradSilverToBlack)"
            strokeWidth="3.5"
            fill="none"
          />
          <Polygon
            points={`0,${Y2} ${MID - 15},${Y2_APEX} ${MID + 15},${Y3_APEX} 0,${Y3}`}
            stroke="url(#gradSilverToBlack)"
            strokeWidth="3.5"
            fill="none"
          />
          <Polygon
            points={`${MID - 15},${Y2_APEX} ${W},${Y2} ${W},${Y3} ${MID + 15},${Y3_APEX}`}
            stroke="url(#gradSilverToBlack)"
            strokeWidth="3.5"
            fill="none"
          />
          <Polygon
            points={`0,${Y3} ${MID + 15},${Y3_APEX} ${MID},${Y4} 0,${Y4}`}
            stroke="url(#gradSilverToBlack)"
            strokeWidth="3.5"
            fill="none"
          />
          <Polygon
            points={`${MID + 15},${Y3_APEX} ${W},${Y3} ${W},${Y4} ${MID},${Y4}`}
            stroke="url(#gradSilverToBlack)"
            strokeWidth="3.5"
            fill="none"
          />
        </Svg>

        {/* Dynamic Oscillating Shimmer Wave Layer: Inverts from Black-to-Silver with Supercharged Radiant Luminous Glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: shimmerWave,
            },
          ]}
        >
          <Svg width={W} height={TOTAL_H} viewBox={`0 0 ${W} ${TOTAL_H}`}>
            {/* Supercharged Glowing Halo Bloom Layer B */}
            <Polygon
              points={`0,0 ${W},0 ${W},${Y1} ${MID},${Y1_APEX} 0,${Y1}`}
              stroke="url(#gradSuperGlowB)"
              strokeWidth="7"
              fill="none"
            />
            <Polygon
              points={`0,${Y1} ${MID},${Y1_APEX} ${MID - 15},${Y2_APEX} 0,${Y2}`}
              stroke="url(#gradSuperGlowB)"
              strokeWidth="6.5"
              fill="none"
            />
            <Polygon
              points={`${MID},${Y1_APEX} ${W},${Y1} ${W},${Y2} ${MID - 15},${Y2_APEX}`}
              stroke="url(#gradSuperGlowB)"
              strokeWidth="6.5"
              fill="none"
            />
            <Polygon
              points={`0,${Y2} ${MID - 15},${Y2_APEX} ${MID + 15},${Y3_APEX} 0,${Y3}`}
              stroke="url(#gradSuperGlowB)"
              strokeWidth="6.5"
              fill="none"
            />
            <Polygon
              points={`${MID - 15},${Y2_APEX} ${W},${Y2} ${W},${Y3} ${MID + 15},${Y3_APEX}`}
              stroke="url(#gradSuperGlowB)"
              strokeWidth="6.5"
              fill="none"
            />
            <Polygon
              points={`0,${Y3} ${MID + 15},${Y3_APEX} ${MID},${Y4} 0,${Y4}`}
              stroke="url(#gradSuperGlowB)"
              strokeWidth="6.5"
              fill="none"
            />
            <Polygon
              points={`${MID + 15},${Y3_APEX} ${W},${Y3} ${W},${Y4} ${MID},${Y4}`}
              stroke="url(#gradSuperGlowB)"
              strokeWidth="6.5"
              fill="none"
            />

            {/* Inverted Silver Core Stroke */}
            <Polygon
              points={`0,0 ${W},0 ${W},${Y1} ${MID},${Y1_APEX} 0,${Y1}`}
              stroke="url(#gradBlackToSilver)"
              strokeWidth="4.6"
              fill="none"
            />
            <Polygon
              points={`0,${Y1} ${MID},${Y1_APEX} ${MID - 15},${Y2_APEX} 0,${Y2}`}
              stroke="url(#gradBlackToSilver)"
              strokeWidth="4.2"
              fill="none"
            />
            <Polygon
              points={`${MID},${Y1_APEX} ${W},${Y1} ${W},${Y2} ${MID - 15},${Y2_APEX}`}
              stroke="url(#gradBlackToSilver)"
              strokeWidth="4.2"
              fill="none"
            />
            <Polygon
              points={`0,${Y2} ${MID - 15},${Y2_APEX} ${MID + 15},${Y3_APEX} 0,${Y3}`}
              stroke="url(#gradBlackToSilver)"
              strokeWidth="4.2"
              fill="none"
            />
            <Polygon
              points={`${MID - 15},${Y2_APEX} ${W},${Y2} ${W},${Y3} ${MID + 15},${Y3_APEX}`}
              stroke="url(#gradBlackToSilver)"
              strokeWidth="4.2"
              fill="none"
            />
            <Polygon
              points={`0,${Y3} ${MID + 15},${Y3_APEX} ${MID},${Y4} 0,${Y4}`}
              stroke="url(#gradBlackToSilver)"
              strokeWidth="4.2"
              fill="none"
            />
            <Polygon
              points={`${MID + 15},${Y3_APEX} ${W},${Y3} ${W},${Y4} ${MID},${Y4}`}
              stroke="url(#gradBlackToSilver)"
              strokeWidth="4.2"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Dynamic Storytelling Typography Placements (Invariant Positions & Ornate Manga Font) */}

        {/* 1. Hero Shard: Top Left (Story Chapter Opener) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('generate')}
          style={[styles.touchAreaHero, { height: Y1_APEX }]}
        >
          <Text style={styles.pureTextHero}>
            {lang === 'ar' ? '' : 'MATCH DRAFT'}
          </Text>
        </TouchableOpacity>

        {/* 2. Roster Shard: Bottom Left */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('members')}
          style={[styles.touchAreaRoster, { top: Y1, height: Y2_APEX - Y1 }]}
        >
          <Text style={styles.pureTextShard}>
            {lang === 'ar' ? '' : 'SQUAD ROSTER'}
          </Text>
        </TouchableOpacity>

        {/* 3. Finger Shard: Top Right */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('finger')}
          style={[styles.touchAreaFinger, { top: Y1, height: Y2_APEX - Y1 }]}
        >
          <Text style={styles.pureTextShard}>
            {lang === 'ar' ? '' : 'FINGER ARENA'}
          </Text>
        </TouchableOpacity>

        {/* 4. Oracle Shard: Top Left */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('oracle')}
          style={[styles.touchAreaOracle, { top: Y2, height: Y3_APEX - Y2 }]}
        >
          <Text style={styles.pureTextShard}>
            {lang === 'ar' ? '' : 'ORACLE WHEEL'}
          </Text>
        </TouchableOpacity>

        {/* 5. Tournament Shard: Bottom Right */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('tournament')}
          style={[styles.touchAreaTourn, { top: Y2, height: Y3_APEX - Y2 }]}
        >
          <Text style={styles.pureTextShard}>
            {lang === 'ar' ? '' : 'TOURNAMENT'}
          </Text>
        </TouchableOpacity>

        {/* 6. History Shard: Bottom Left */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('history')}
          style={[styles.touchAreaHistory, { top: Y3, height: Y4 - Y3 }]}
        >
          <Text style={styles.pureTextShard}>
            {lang === 'ar' ? '' : 'HISTORY VAULT'}
          </Text>
        </TouchableOpacity>

        {/* 7. Settings Shard: Bottom Right */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleNavigate('settings')}
          style={[styles.touchAreaSettings, { top: Y3, height: Y4 - Y3 }]}
        >
          <Text style={styles.pureTextShard}>
            {lang === 'ar' ? '' : 'SETTINGS'}
          </Text>
        </TouchableOpacity>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullBleedContent: {
    padding: 0,
    margin: 0,
  },
  canvasContainer: {
    width: W,
    height: TOTAL_H,
    position: 'relative',
    overflow: 'hidden',
  },
  touchAreaHero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingLeft: 22,
  },
  pureTextHero: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.98)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  touchAreaRoster: {
    position: 'absolute',
    left: 0,
    width: '50%',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingLeft: 16,
  },
  touchAreaFinger: {
    position: 'absolute',
    right: 0,
    width: '50%',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 18,
    paddingRight: 16,
  },
  touchAreaOracle: {
    position: 'absolute',
    left: 0,
    width: '50%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 18,
    paddingLeft: 16,
  },
  touchAreaTourn: {
    position: 'absolute',
    right: 0,
    width: '50%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingRight: 16,
  },
  touchAreaHistory: {
    position: 'absolute',
    left: 0,
    width: '50%',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 22,
    paddingLeft: 16,
  },
  touchAreaSettings: {
    position: 'absolute',
    right: 0,
    width: '50%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 22,
    paddingRight: 16,
  },
  pureTextShard: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 1.0,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textShadowColor: 'rgba(0, 0, 0, 0.98)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
