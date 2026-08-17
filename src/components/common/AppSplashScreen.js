import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPLASH_ART = require('../../../assets/images/splash_art.jpg');

export function AppSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Initial spring pop-in & breathing animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 0.95,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0.45,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Cinematic fade-out & reveal after 1.8s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) onFinish();
      });
    }, 1800);

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
      {/* 1. Deep Obsidian Black Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />

      {/* 2. Large High-Definition Splash Art */}
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={SPLASH_ART}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 3. Ambient Pulsing Radial Aura */}
      <Animated.View
        style={[
          styles.glowAuraContainer,
          {
            opacity: glowPulse,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(0, 240, 255, 0.18)', 'rgba(0, 240, 255, 0.05)', 'transparent']}
          style={styles.glowAura}
        />
      </Animated.View>

      {/* 4. Sleek Futuristic Progress Shimmer Bar */}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: SCREEN_WIDTH * 0.94,
    height: SCREEN_HEIGHT * 0.88,
  },
  glowAuraContainer: {
    position: 'absolute',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  glowAura: {
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  loadingBarTrack: {
    position: 'absolute',
    bottom: 50,
    width: SCREEN_WIDTH * 0.45,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
