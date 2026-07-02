import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
  Circle,
} from 'react-native-svg';
import { MangaFortuneWheel } from '../components/oracle/MangaFortuneWheel';
import { OracleDecisionCard } from '../components/oracle/OracleDecisionCard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { hapticsService } from '../services/hapticsService';
import {
  Plus,
  RotateCcw,
  Sparkles,
  Dices,
  Layers,
  Compass,
} from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ORACLE_ART = require('../../assets/images/oracle_art.jpg');

export function OracleScreen() {
  const { activeTheme, themeId } = useTheme();
  const { lang, isRTL } = useLanguage();
  const scrollViewRef = useRef(null);

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  const [activeMode, setActiveMode] = useState('wheel'); // 'wheel' | 'scanner'
  const [inputVal, setInputVal] = useState('');

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

  // Concise default choices
  const [options, setOptions] = useState([
    'الفريق الأزرق',
    'الفريق الأبيض',
    'الفريق الأسود',
    'الفريق البنفسجي',
  ]);

  const handleAddOption = () => {
    if (!inputVal.trim()) return;
    hapticsService.impactLight();
    setOptions((prev) => [...prev, inputVal.trim()]);
    setInputVal('');
  };

  const handleDeleteOption = (idx) => {
    hapticsService.impactLight();
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleResetDefaults = () => {
    hapticsService.impactMedium();
    setOptions([
      lang === 'ar' ? 'الفريق الأزرق' : 'Blue Team',
      lang === 'ar' ? 'الفريق الأبيض' : 'White Team',
      lang === 'ar' ? 'الفريق الأسود' : 'Black Team',
      lang === 'ar' ? 'الفريق البنفسجي' : 'Purple Team',
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      style={{ flex: 1 }}
    >
      <View style={[styles.rootContainer, { backgroundColor: isLightMode ? '#f8fafc' : '#030511' }]}>
        {/* 1. Legendary Fixed Backdrop Layer */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isLightMode ? '#f8fafc' : '#030511' },
            ]}
          />

          {/* Hero Oracle Artwork */}
          <Image
            source={ORACLE_ART}
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

          {/* Svg Arcane Mystical Glow Orbs */}
          <Svg style={StyleSheet.absoluteFill} width={SCREEN_W} height={SCREEN_H}>
            <Defs>
              <SvgRadial id="oracleFlare1" cx="20%" cy="15%" r="55%">
                <Stop
                  offset="0%"
                  stopColor={activeTheme.accentColor || '#a855f7'}
                  stopOpacity={isLightMode ? 0.3 : 0.45}
                />
                <Stop
                  offset="55%"
                  stopColor={activeTheme.accentSecondary || '#ec4899'}
                  stopOpacity={isLightMode ? 0.1 : 0.16}
                />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </SvgRadial>

              <SvgRadial id="oracleFlareGold" cx="82%" cy="40%" r="50%">
                <Stop
                  offset="0%"
                  stopColor="#fbbf24"
                  stopOpacity={isLightMode ? 0.2 : 0.3}
                />
                <Stop
                  offset="60%"
                  stopColor={activeTheme.accentColor || '#a855f7'}
                  stopOpacity={isLightMode ? 0.05 : 0.09}
                />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </SvgRadial>
            </Defs>

            <Rect x="0" y="0" width="100%" height="100%" fill="url(#oracleFlare1)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#oracleFlareGold)" />

            {/* Mystic Concentric Rings */}
            <Circle
              cx={SCREEN_W / 2}
              cy={SCREEN_H * 0.45}
              r={SCREEN_W * 0.42}
              stroke={isLightMode ? '#cbd5e1' : activeTheme.accentColor}
              strokeWidth="1.2"
              strokeDasharray="6, 12"
              strokeOpacity={isLightMode ? 0.25 : 0.18}
              fill="none"
            />
            <Circle
              cx={SCREEN_W / 2}
              cy={SCREEN_H * 0.45}
              r={SCREEN_W * 0.48}
              stroke={isLightMode ? '#cbd5e1' : '#8b5cf6'}
              strokeWidth="1"
              strokeDasharray="4, 16"
              strokeOpacity={isLightMode ? 0.2 : 0.12}
              fill="none"
            />
          </Svg>

          {/* Pulsing Energy Aura */}
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

        {/* 2. Scrollable Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* 1. Header & Title Banner */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Compass size={22} color={activeTheme.accentColor} />
              <Text style={[styles.title, { color: activeTheme.textPrimary }]}>
                {lang === 'ar' ? 'عجلة الحظ والقرعة' : 'Fortune Wheel'}
              </Text>
            </View>
            <Text style={[styles.subtitle, { color: activeTheme.textSecondary }]}>
              {lang === 'ar' ? 'القرعة السحرية لحسم أي قرار أو اختيار' : 'Instant decision maker & random selector'}
            </Text>
          </View>

          {/* 2. Simplified Mode Switcher */}
          <View style={[styles.modeTabsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => {
                hapticsService.impactLight();
                setActiveMode('wheel');
              }}
              style={[
                styles.modeTabBtn,
                {
                  backgroundColor:
                    activeMode === 'wheel'
                      ? activeTheme.accentColor
                      : isLightMode
                      ? 'rgba(255, 255, 255, 0.48)'
                      : 'rgba(15, 23, 42, 0.42)',
                  borderColor:
                    activeMode === 'wheel'
                      ? '#ffffff'
                      : isLightMode
                      ? 'rgba(0, 0, 0, 0.08)'
                      : 'rgba(255, 255, 255, 0.12)',
                  elevation: activeMode === 'wheel' ? 4 : 0,
                },
              ]}
            >
              <Dices size={16} color={activeMode === 'wheel' ? '#ffffff' : activeTheme.textSecondary} />
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: activeMode === 'wheel' ? '#ffffff' : activeTheme.textSecondary,
                    fontWeight: activeMode === 'wheel' ? '900' : '700',
                  },
                ]}
              >
                {lang === 'ar' ? 'عجلة الحظ' : 'Fortune Wheel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => {
                hapticsService.impactLight();
                setActiveMode('scanner');
              }}
              style={[
                styles.modeTabBtn,
                {
                  backgroundColor:
                    activeMode === 'scanner'
                      ? activeTheme.accentColor
                      : isLightMode
                      ? 'rgba(255, 255, 255, 0.48)'
                      : 'rgba(15, 23, 42, 0.42)',
                  borderColor:
                    activeMode === 'scanner'
                      ? '#ffffff'
                      : isLightMode
                      ? 'rgba(0, 0, 0, 0.08)'
                      : 'rgba(255, 255, 255, 0.12)',
                  elevation: activeMode === 'scanner' ? 4 : 0,
                },
              ]}
            >
              <Sparkles size={16} color={activeMode === 'scanner' ? '#ffffff' : activeTheme.textSecondary} />
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: activeMode === 'scanner' ? '#ffffff' : activeTheme.textSecondary,
                    fontWeight: activeMode === 'scanner' ? '900' : '700',
                  },
                ]}
              >
                {lang === 'ar' ? 'سحب سريع' : 'Quick Pick'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. Top Input Bar */}
          <View
            style={[
              styles.inputContainerCard,
              {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                borderColor: inputVal
                  ? activeTheme.accentColor
                  : isLightMode
                  ? 'rgba(0, 0, 0, 0.08)'
                  : `${activeTheme.accentColor}35`,
              },
            ]}
          >
            <View style={[styles.inputRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                onSubmitEditing={handleAddOption}
                returnKeyType="done"
                placeholder={lang === 'ar' ? 'اكتب اختياراً أو اسماً جديداً...' : 'Type an option or name...'}
                placeholderTextColor={activeTheme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0.25)',
                    borderColor: inputVal ? activeTheme.accentColor : isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                    color: activeTheme.textPrimary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              />
              {inputVal ? (
                <TouchableOpacity
                  onPress={() => setInputVal('')}
                  style={[styles.clearBtn, isRTL ? { left: 95 } : { right: 95 }]}
                >
                  <Text style={{ color: activeTheme.textMuted, fontSize: 13, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleAddOption}
                style={styles.addBtnTouchable}
              >
                <LinearGradient
                  colors={activeTheme.gradientColors || ['#38bdf8', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addBtnGradient}
                >
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.addBtnText}>
                    {lang === 'ar' ? 'إضافة' : 'Add'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Wheel / Scanner Interactive Stage */}
          {activeMode === 'wheel' ? (
            <View style={styles.wheelWrapper}>
              <MangaFortuneWheel options={options} />
            </View>
          ) : (
            <OracleDecisionCard options={options} />
          )}

          {/* 5. Clean Options Pool List - Transparent Glass */}
          <View
            style={[
              styles.optionsCard,
              {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
              },
            ]}
          >
            <View style={[styles.optionsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.optionsTitleGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Layers size={15} color={activeTheme.accentColor} />
                <Text style={[styles.optionsTitle, { color: activeTheme.textPrimary }]}>
                  {lang === 'ar' ? `الخيارات المتاحة (${options.length})` : `Available Options (${options.length})`}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleResetDefaults}
                style={[
                  styles.resetBtn,
                  {
                    backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                  },
                ]}
              >
                <RotateCcw size={13} color={activeTheme.textSecondary} />
              </TouchableOpacity>
            </View>

            {options.length > 0 ? (
              <View style={[styles.optionsWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {options.map((opt, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                        borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Text style={[styles.optionChipIndex, { color: activeTheme.accentColor }]}>{idx + 1}.</Text>
                    <Text numberOfLines={1} style={[styles.optionChipText, { color: activeTheme.textPrimary }]}>
                      {opt}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleDeleteOption(idx)}
                      style={styles.deleteBtn}
                    >
                      <Text style={{ color: '#f87171', fontSize: 13, fontWeight: '900' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyHint, { color: activeTheme.textMuted }]}>
                {lang === 'ar' ? 'أضف اختيارين على الأقل عشان تلف العجلة' : 'Add at least 2 options to spin'}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 36,
    gap: 12,
  },
  header: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
  },
  modeTabsRow: {
    gap: 8,
  },
  modeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  modeTabText: {
    fontSize: 13,
  },
  inputContainerCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 8,
    position: 'relative',
    elevation: 3,
  },
  inputRow: {
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    minHeight: 42,
  },
  clearBtn: {
    position: 'absolute',
    padding: 6,
    zIndex: 10,
  },
  addBtnTouchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  wheelWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  optionsCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    gap: 10,
    elevation: 3,
  },
  optionsHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionsTitleGroup: {
    alignItems: 'center',
    gap: 6,
  },
  optionsTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  resetBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsWrap: {
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    gap: 6,
  },
  optionChipIndex: {
    fontSize: 11,
    fontWeight: '900',
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    paddingHorizontal: 2,
  },
  emptyHint: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 6,
  },
});
