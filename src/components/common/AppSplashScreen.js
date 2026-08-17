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
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const glowPulse = useRef(new Animated.Value(0.45)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Initial spring pop-in & breathing animation
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 0.95,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0.45,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Cinematic fade-out & reveal after 2.0s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 550,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1.05,
          duration: 550,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) onFinish();
      });
    }, 2000);

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
      {/* 1. Deep Ink Obsidian Black Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />

      {/* 2. Ambient Radiant Silver / White Glow behind the Manga Card */}
      <Animated.View
        style={[
          styles.glowAuraContainer,
          {
            opacity: glowPulse,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.22)', 'rgba(0, 240, 255, 0.08)', 'transparent']}
          style={styles.glowAura}
        />
      </Animated.View>

      {/* 3. Floating Rectangular Anime Manga Poster Card */}
      <Animated.View
        style={[
          styles.mangaCardContainer,
          {
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        {/* Double-border manga frame */}
        <View style={styles.mangaFrameBorder}>
          <Image
            source={MANGA_POSTER}
            style={styles.mangaPosterImage}
            resizeMode="cover"
          />

          {/* Smooth bottom vignette inside the card */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.85)']}
            locations={[0.6, 0.8, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </Animated.View>

      {/* 4. Bold Anime Manga Branding Typography */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitleText}>TEAM ME PRO</Text>
        <Text style={styles.brandSubtitleText}>
          صَانِعُ التَّشْكِيلَاتِ وَالْبُطُولَاتِ الذَّكِيُّ
        </Text>
      </View>

      {/* 5. Minimalist Monochrome Progress Shimmer Bar */}
      <View style={styles.loadingBarTrack}>
        <Animated.View style={[styles.loadingBarFill, { width: progressWidth }]}>
          <LinearGradient
            colors={['#ffffff', '#cbd5e1', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 360);
const CARD_HEIGHT = CARD_WIDTH * 1.33; // Classic 3:4 Manga Poster Ratio

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowAuraContainer: {
    position: 'absolute',
    width: CARD_WIDTH + 60,
    height: CARD_HEIGHT + 60,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  glowAura: {
    width: CARD_WIDTH + 60,
    height: CARD_HEIGHT + 60,
    borderRadius: 30,
  },
  mangaCardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 24,
    elevation: 20,
  },
  mangaFrameBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 2.2,
    borderColor: '#ffffff',
    overflow: 'hidden',
    backgroundColor: '#050505',
  },
  mangaPosterImage: {
    width: '100%',
    height: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  brandTitleText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3.5,
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    fontFamily: Platform.select({ ios: 'Impact', android: 'sans-serif-black' }),
  },
  brandSubtitleText: {
    color: '#cbd5e1',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  loadingBarTrack: {
    position: 'absolute',
    bottom: 42,
    width: SCREEN_WIDTH * 0.42,
    height: 3.2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
