import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Svg, {
  G,
  Path,
  Circle,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { hapticsService } from '../../services/hapticsService';
import { audioService } from '../../services/audioService';
import { RotateCw, Sparkles, Zap, Flame, Trophy } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 44, 320);
const RADIUS = WHEEL_SIZE / 2;

// Manga Comic Palette for Wheel Slices
const SLICE_PALETTE = [
  { bg: '#090d16', text: '#ffffff', border: '#38bdf8' },
  { bg: '#18181b', text: '#ffffff', border: '#fbbf24' },
  { bg: '#0f172a', text: '#ffffff', border: '#34d399' },
  { bg: '#1e1b4b', text: '#ffffff', border: '#c084fc' },
  { bg: '#172554', text: '#ffffff', border: '#60a5fa' },
  { bg: '#2e1065', text: '#ffffff', border: '#f472b6' },
  { bg: '#042f2e', text: '#ffffff', border: '#2dd4bf' },
  { bg: '#31102b', text: '#ffffff', border: '#f87171' },
];

export function MangaFortuneWheel({ options = [], onSelectWinner }) {
  const { activeTheme } = useTheme();
  const { lang } = useLanguage();

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [comicFx, setComicFx] = useState('SPIN!');

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const currentAngleRef = useRef(0);

  // Fallback if options < 2
  const effectiveOptions =
    options && options.length >= 2
      ? options
      : [
          lang === 'ar' ? 'الأول' : 'First',
          lang === 'ar' ? 'الثاني' : 'Second',
        ];

  const numSlices = effectiveOptions.length;
  const sliceAngle = 360 / numSlices;

  // Pulse animation for button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Helper to build SVG Pie Slice Path
  const makeSlicePath = (index) => {
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);

    const x1 = RADIUS + (RADIUS - 10) * Math.cos(startAngle);
    const y1 = RADIUS + (RADIUS - 10) * Math.sin(startAngle);
    const x2 = RADIUS + (RADIUS - 10) * Math.cos(endAngle);
    const y2 = RADIUS + (RADIUS - 10) * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    return `M ${RADIUS} ${RADIUS} L ${x1} ${y1} A ${RADIUS - 10} ${RADIUS - 10} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setComicFx(lang === 'ar' ? '  دوران سريع!' : '  SUPER SPIN!!');
    hapticsService.impactHeavy();

    // 1. Pick winning index
    const winningIndex = Math.floor(Math.random() * numSlices);

    // 2. Exact mathematical alignment for target slice center under the top arrow
    const targetSliceCenter = (winningIndex + 0.5) * sliceAngle;
    const targetMod = (360 - (targetSliceCenter % 360)) % 360;
    const currentMod = currentAngleRef.current % 360;
    let diff = targetMod - currentMod;
    if (diff < 0) diff += 360;

    // 3. High revolutions: 8 to 12 full 360 degree spins for long dramatic spin
    const fullSpins = 8 + Math.floor(Math.random() * 4);
    const totalRotation = currentAngleRef.current + fullSpins * 360 + diff;

    // Fast ticking haptics and sound throughout the spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      if (tickCount % 3 === 0) {
        hapticsService.impactLight();
        audioService.playTick();
      }
      if (tickCount > 40) clearInterval(tickInterval);
    }, 100);

    Animated.timing(spinAnim, {
      toValue: totalRotation,
      duration: 4600,
      easing: Easing.bezier(0.12, 0.82, 0.22, 1), // Cinematic manga curve
      useNativeDriver: true,
    }).start(() => {
      clearInterval(tickInterval);
      currentAngleRef.current = totalRotation;
      setIsSpinning(false);
      
      const winningOption = effectiveOptions[winningIndex];
      setWinner(winningOption);
      setComicFx(lang === 'ar' ? '💥 حُسم القرار!' : '💥 VICTORY!!');
      hapticsService.success();
      audioService.playSuccess();
      if (onSelectWinner) onSelectWinner(winningOption);
    });
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Manga Comic Header Badge */}
      <View style={styles.mangaHeaderBadge}>
        <Flame size={14} color="#fbbf24" />
        <Text style={styles.mangaBadgeText}>{comicFx}</Text>
        <Sparkles size={14} color="#38bdf8" />
      </View>

      {/* Wheel Frame */}
      <View style={[styles.wheelFrame, { width: WHEEL_SIZE + 20, height: WHEEL_SIZE + 20 }]}>
        
        {/* Glow Ring */}
        <View style={[styles.glowRing, { borderColor: isSpinning ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)' }]} />

        {/* The Animated Spinning Wheel (SVG Slice Layers + Native High-Res Arabic Text Layer) */}
        <Animated.View
          style={{
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            transform: [{ rotate: spinInterpolate }],
          }}
        >
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
            <Defs>
              <LinearGradient id="mangaRim" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="50%" stopColor="#64748b" stopOpacity="1" />
                <Stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
              </LinearGradient>
              <LinearGradient id="centerCore" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Outer Beveled Rim */}
            <Circle
              cx={RADIUS}
              cy={RADIUS}
              r={RADIUS - 2}
              fill="#03050c"
              stroke="url(#mangaRim)"
              strokeWidth="5"
            />

            {/* Slices Graphics */}
            {effectiveOptions.map((_, i) => {
              const colorConfig = SLICE_PALETTE[i % SLICE_PALETTE.length];

              return (
                <G key={i}>
                  {/* Slice Wedge */}
                  <Path
                    d={makeSlicePath(i)}
                    fill={colorConfig.bg}
                    stroke="#ffffff"
                    strokeWidth="1.6"
                  />

                  {/* Radial Divider Line */}
                  <Line
                    x1={RADIUS}
                    y1={RADIUS}
                    x2={RADIUS + (RADIUS - 10) * Math.cos((i * sliceAngle - 90) * (Math.PI / 180))}
                    y2={RADIUS + (RADIUS - 10) * Math.sin((i * sliceAngle - 90) * (Math.PI / 180))}
                    stroke="#ffffff"
                    strokeWidth="1.6"
                  />
                </G>
              );
            })}

            {/* Decorative Rim Studs */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx * 30 * Math.PI) / 180;
              const sx = RADIUS + (RADIUS - 5) * Math.cos(angle);
              const sy = RADIUS + (RADIUS - 5) * Math.sin(angle);
              return <Circle key={idx} cx={sx} cy={sy} r="2" fill="#ffffff" />;
            })}

            {/* Center Comic Hub */}
            <Circle cx={RADIUS} cy={RADIUS} r="24" fill="#000000" stroke="#ffffff" strokeWidth="2.5" />
            <Circle cx={RADIUS} cy={RADIUS} r="13" fill="url(#centerCore)" />
            <Circle cx={RADIUS} cy={RADIUS} r="4" fill="#ffffff" />
          </Svg>

          {/* Native High-Definition Arabic Text Layer (100% Connected, Proper HarfBuzz RTL Font Shaping) */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {effectiveOptions.map((opt, i) => {
              const rotationAngle = (i + 0.5) * sliceAngle;
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: WHEEL_SIZE,
                    height: WHEEL_SIZE,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    transform: [{ rotate: `${rotationAngle}deg` }],
                  }}
                >
                  <View style={{ marginTop: Math.max(22, RADIUS * 0.16), width: '62%', alignItems: 'center' }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#ffffff',
                        fontSize: numSlices > 6 ? 11 : numSlices > 4 ? 12.5 : 14,
                        fontWeight: '900',
                        textAlign: 'center',
                        textShadowColor: 'rgba(0, 0, 0, 0.95)',
                        textShadowOffset: { width: 0, height: 1.5 },
                        textShadowRadius: 4,
                        letterSpacing: 0.3,
                      }}
                    >
                      {opt}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Top Indicator Dagger */}
        <View style={styles.topPointerContainer}>
          <Svg width="32" height="34" viewBox="0 0 32 34">
            <Polygon points="16,32 3,4 29,4" fill="#000000" />
            <Polygon points="16,28 6,7 26,7" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.8" />
            <Circle cx="16" cy="11" r="2.5" fill="#ffffff" />
          </Svg>
        </View>
      </View>

      {/* Action Spin Button */}
      <Animated.View style={{ transform: [{ scale: isSpinning ? 0.97 : pulseAnim }], width: '100%', marginTop: 10 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSpinning}
          onPress={handleSpin}
          style={[
            styles.mangaSpinBtn,
            {
              backgroundColor: isSpinning ? '#1e293b' : activeTheme.accentColor,
              borderColor: isSpinning ? '#64748b' : activeTheme.borderFocus,
            },
          ]}
        >
          <RotateCw size={16} color="#ffffff" />
          <Text style={[styles.mangaSpinBtnText, { color: '#ffffff' }]}>
            {isSpinning
              ? (lang === 'ar' ? 'بتلف...' : 'SPINNING...')
              : (lang === 'ar' ? 'لف العجلة' : 'SPIN WHEEL')}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Clean Winner Result Card */}
      {winner && (
        <View style={[styles.winnerMangaCard, { backgroundColor: activeTheme.bgCard, borderColor: activeTheme.borderFocus }]}>
          <Text style={[styles.winnerBannerTitle, { color: activeTheme.accentColor }]}>
            {lang === 'ar' ? 'الاختيار وقع على:' : 'WINNER:'}
          </Text>
          <Text style={[styles.winnerText, { color: activeTheme.textPrimary }]}>{winner}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mangaHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(5, 8, 20, 0.55)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 4,
  },
  mangaBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  wheelFrame: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: WHEEL_SIZE + 12,
    height: WHEEL_SIZE + 12,
    borderRadius: (WHEEL_SIZE + 12) / 2,
    borderWidth: 1.8,
    borderStyle: 'dashed',
  },
  topPointerContainer: {
    position: 'absolute',
    top: -4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  mangaSpinBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.8,
    gap: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  mangaSpinBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  winnerMangaCard: {
    width: '100%',
    backgroundColor: 'rgba(5, 8, 20, 0.55)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fbbf24',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    elevation: 8,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  winnerGlowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  winnerBannerTitle: {
    color: '#fbbf24',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  winnerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
