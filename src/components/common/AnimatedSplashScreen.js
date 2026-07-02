import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient as SvgGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { useLanguage } from '../../context/LanguageContext';
import { hapticsService } from '../../services/hapticsService';
import { audioService } from '../../services/audioService';

const { width: W, height: H } = Dimensions.get('window');
const LOGO_SIZE = Math.min(W * 0.88, 380);

export function AnimatedSplashScreen({ onFinish }) {
  const { lang } = useLanguage();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.25)).current;
  const rotateAnim = useRef(new Animated.Value(-0.15)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim1 = useRef(new Animated.Value(0)).current;
  const rippleAnim2 = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(20)).current;
  const fullFadeAnim = useRef(new Animated.Value(1)).current;
  const shimmerSweep = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // 1. Initial Impact Haptic & Audio
    hapticsService.impactHeavy();
    audioService.playCharge();

    // 2. Full-Screen Concentric Shockwave / Ripple Rings
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rippleAnim1, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(450),
            Animated.timing(rippleAnim2, {
              toValue: 1,
              duration: 1800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(rippleAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 3. Continuous Gentle Breathing Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Shimmer Sweep across full screen
    Animated.loop(
      Animated.timing(shimmerSweep, {
        toValue: 2,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 5. Main Hero Logo Entrance
    Animated.parallel([
      // Spring pop
      Animated.spring(scaleAnim, {
        toValue: 1.0,
        friction: 5,
        tension: 45,
        useNativeDriver: true,
      }),
      // Spin into level alignment
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      // Fade in Logo
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 6. Secondary Haptic on Settle & Text Reveal
      hapticsService.success();
      audioService.playSuccess();

      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(textSlideAnim, {
          toValue: 0,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // 7. Auto Transition / Fade Out after 2.1s
    const timer = setTimeout(() => {
      Animated.timing(fullFadeAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2100);

    return () => clearTimeout(timer);
  }, []);

  const spinInterpolation = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-360deg', '0deg', '360deg'],
  });

  const ripple1Scale = rippleAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 2.4],
  });
  const ripple1Opacity = rippleAnim1.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.45, 0.2, 0],
  });

  const ripple2Scale = rippleAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 2.6],
  });
  const ripple2Opacity = rippleAnim2.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.4, 0.15, 0],
  });

  const shimmerTranslateX = shimmerSweep.interpolate({
    inputRange: [-1, 2],
    outputRange: [-W * 1.2, W * 1.2],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fullFadeAnim }]}>
      {/* 1. Full-Screen Radiant Deep Background */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient
              id="bgRadial"
              cx="50%"
              cy="50%"
              rx="65%"
              ry="55%"
              fx="50%"
              fy="50%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <Stop offset="45%" stopColor="#090d16" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </RadialGradient>

            <RadialGradient
              id="coreBloom"
              cx="50%"
              cy="50%"
              rx="45%"
              ry="45%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
              <Stop offset="40%" stopColor="#6366f1" stopOpacity="0.16" />
              <Stop offset="80%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Deep Ambient Fill */}
          <Rect x="0" y="0" width={W} height={H} fill="url(#bgRadial)" />

          {/* Luminous Center Core Bloom */}
          <Circle cx={W / 2} cy={H * 0.44} r={W * 0.55} fill="url(#coreBloom)" />
        </Svg>
      </View>

      {/* 2. Full-Screen Concentric Expanding Shockwave Rings */}
      <View style={[styles.ringsContainer, { top: H * 0.44 - (W * 0.8) / 2 }]}>
        {/* Ring 1 */}
        <Animated.View
          style={[
            styles.shockwaveRing,
            {
              opacity: ripple1Opacity,
              transform: [{ scale: ripple1Scale }],
              borderColor: '#38bdf8',
            },
          ]}
        />
        {/* Ring 2 */}
        <Animated.View
          style={[
            styles.shockwaveRing,
            {
              opacity: ripple2Opacity,
              transform: [{ scale: ripple2Scale }],
              borderColor: '#818cf8',
            },
          ]}
        />
      </View>

      {/* 3. Full-Screen Diagonal Light Shimmer Ray */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmerRayWrapper,
          {
            transform: [{ translateX: shimmerTranslateX }, { rotate: '25deg' }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.08)',
            'rgba(56, 189, 248, 0.15)',
            'rgba(255, 255, 255, 0.08)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerRay}
        />
      </Animated.View>

      {/* 4. Center Content (Enlarged Logo + Dynamic Text) */}
      <View style={styles.centerContent}>
        {/* Logo Luminous Halo Plate */}
        <Animated.View
          style={[
            styles.logoAuraHalo,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Main Enlarged Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: opacityAnim,
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
                { rotate: spinInterpolation },
              ],
            },
          ]}
        >
          <Image
            source={require('../../../assets/logo_transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Brand Title & Tagline */}
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textSlideAnim }],
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>
              {lang === 'ar' ? 'تـيـم مـي بـرو' : 'TEAM ME PRO'}
            </Text>
            <View style={styles.proPill}>
              <Text style={styles.proPillText}>
                {lang === 'ar' ? 'الذكي' : 'V2.5'}
              </Text>
            </View>
          </View>

          <View style={styles.taglineBadge}>
            <LinearGradient
              colors={['rgba(56, 189, 248, 0.15)', 'rgba(99, 102, 241, 0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.taglineGradient}
            >
              <Text style={styles.taglineText}>
                {lang === 'ar'
                  ? 'محرك التشكيلات والبطولات الذكية'
                  : 'Smart Team Matchmaking & Tournament Draft'}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    overflow: 'hidden',
  },
  ringsContainer: {
    position: 'absolute',
    left: (W - W * 0.8) / 2,
    width: W * 0.8,
    height: W * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  shockwaveRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 1.8,
  },
  shimmerRayWrapper: {
    position: 'absolute',
    top: -H * 0.2,
    bottom: -H * 0.2,
    width: W * 0.6,
    pointerEvents: 'none',
  },
  shimmerRay: {
    width: '100%',
    height: '140%',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: W,
    paddingHorizontal: 20,
  },
  logoAuraHalo: {
    position: 'absolute',
    width: LOGO_SIZE * 0.92,
    height: LOGO_SIZE * 0.92,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 36,
    elevation: 25,
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  textWrapper: {
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 2.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textShadowColor: 'rgba(56, 189, 248, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  proPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#0284c7',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  proPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  taglineBadge: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  taglineGradient: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taglineText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
