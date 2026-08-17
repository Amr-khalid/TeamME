import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MANGA_POSTER = require('../../../assets/images/manga_splash_poster.jpg');

export function AppSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1.15)).current;
  const imageTranslateY = useRef(new Animated.Value(10)).current;
  const badgeScale = useRef(new Animated.Value(0.85)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const slashAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Cinematic Ken Burns slow zoom & floating motion
    Animated.parallel([
      Animated.timing(imageScale, {
        toValue: 1.0,
        duration: 2200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imageTranslateY, {
        toValue: 0,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Dramatic Laser Slash Streak
      Animated.timing(slashAnim, {
        toValue: SCREEN_WIDTH * 1.5,
        duration: 900,
        delay: 200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      // Floating Hero Badge Pop-in
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 700,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        delay: 300,
        useNativeDriver: true,
      }),
      // Laser Progress Fill
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Hollywood cinematic fade-out & smooth transition into MainApp
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1.08,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) onFinish();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.splashContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* 1. Full-Bleed Edge-to-Edge Manga Poster Layer with Ken Burns Zoom */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { scale: imageScale },
              { translateY: imageTranslateY },
            ],
          },
        ]}
      >
        <Image
          source={MANGA_POSTER}
          style={styles.fullScreenImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* 2. Multi-Stop Cinematic Vignette Gradient Overlays */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.72)',
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.55)',
          'rgba(0, 0, 0, 0.94)',
        ]}
        locations={[0, 0.22, 0.55, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. Dramatic Dynamic Light Slash Line on Entrance */}
      <Animated.View
        style={[
          styles.slashLineWrapper,
          {
            transform: [
              { translateX: slashAnim },
              { rotate: '-35deg' },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.8)', '#ffffff', 'rgba(0, 240, 255, 0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.slashLine}
        />
      </Animated.View>

      {/* 4. Floating Luxury Frosted Obsidian Hero Capsule */}
      <Animated.View
        style={[
          styles.heroBadgeContainer,
          {
            opacity: badgeOpacity,
            transform: [{ scale: badgeScale }],
          },
        ]}
      >
        <View style={styles.frostedBadge}>
          {/* Subtle Glass Highlight */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'transparent']}
            style={styles.glassHighlight}
          />

          <Text style={styles.brandTitleText}>TEAM ME PRO</Text>
          <Text style={styles.brandSubtitleText}>
            صَانِعُ التَّشْكِيلَاتِ وَالْبُطُولَاتِ الذَّكِيُّ
          </Text>

          {/* Sleek Laser Shimmer Progress Bar */}
          <View style={styles.loadingBarTrack}>
            <Animated.View style={[styles.loadingBarFill, { width: progressWidth }]}>
              <LinearGradient
                colors={['#00f0ff', '#ffffff', '#00f5d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  slashLineWrapper: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.2,
    bottom: -SCREEN_HEIGHT * 0.2,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  slashLine: {
    width: 90,
    height: SCREEN_HEIGHT * 1.5,
    opacity: 0.85,
  },
  heroBadgeContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  frostedBadge: {
    width: '100%',
    maxWidth: 380,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 9, 20, 0.82)',
    borderWidth: 1.8,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
  },
  brandTitleText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    fontFamily: Platform.select({ ios: 'Impact', android: 'sans-serif-black' }),
    marginBottom: 4,
  },
  brandSubtitleText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 14,
  },
  loadingBarTrack: {
    width: '75%',
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

