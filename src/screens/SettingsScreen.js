import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Image,
  Dimensions,
  Animated,
  Easing,
  Switch,
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
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import { audioService } from '../services/audioService';
import {
  Palette,
  Volume2,
  VolumeX,
  Smartphone,
  Globe,
  Download,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings,
  Shield,
  Info,
} from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SETTINGS_ART = require('../../assets/images/settings_art.jpg');

export function SettingsScreen() {
  const { activeTheme, themeId, selectTheme, allThemes } = useTheme();
  const { lang, toggleLanguage } = useLanguage();
  const { members, history, currentTeams, resetAllData } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  const [soundEnabled, setSoundEnabled] = useState(audioService.isEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState(hapticsService.isEnabled());

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

  const handleToggleSound = async () => {
    const next = await audioService.toggle();
    setSoundEnabled(next);
  };

  const handleToggleHaptics = async () => {
    const next = await hapticsService.toggle();
    setHapticsEnabled(next);
  };

  const handleExportJson = async () => {
    const backupData = {
      app: 'TEAM ME PRO',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      members,
      currentTeams,
      history,
    };

    try {
      await Share.share({
        title: 'TEAM ME PRO Backup',
        message: JSON.stringify(backupData, null, 2),
      });
      hapticsService.success();
      audioService.playSuccess();
    } catch (e) {}
  };

  const handleConfirmReset = () => {
    Alert.alert(
      lang === 'ar' ? 'مسح كافة البيانات' : 'Reset All Data',
      lang === 'ar'
        ? 'هل تريد حذف كافة التشكيلات واللاعبين والبدء من الصفر؟'
        : 'Are you sure you want to clear all data and start fresh?',
      [
        { text: lang === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: lang === 'ar' ? 'مسح البيانات' : 'Clear Data',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            audioService.playDelete();
          },
        },
      ]
    );
  };

  const isRtl = lang === 'ar';
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <View style={[styles.rootContainer, { backgroundColor: isLightMode ? '#f8fafc' : '#030511' }]}>
      {/* 1. Legendary Fixed Backdrop Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isLightMode ? '#f8fafc' : '#030511' },
          ]}
        />

        {/* Hero Settings Artwork */}
        <Image
          source={SETTINGS_ART}
          style={styles.heroBackdropArt}
          resizeMode="cover"
        />

        {/* Multi-Stop Cinematic Vignette Gradient Overlay */}
        <LinearGradient
          colors={
            isLightMode
              ? [
                  'rgba(248, 250, 252, 0.45)',
                  'rgba(248, 250, 252, 0.85)',
                  'rgba(248, 250, 252, 0.96)',
                  '#f8fafc',
                ]
              : [
                  'rgba(3, 5, 17, 0.48)',
                  'rgba(3, 5, 17, 0.78)',
                  'rgba(3, 5, 17, 0.94)',
                  '#030511',
                ]
          }
          locations={[0, 0.22, 0.52, 0.92]}
          style={StyleSheet.absoluteFill}
        />

        {/* Svg Tactical Glow Flares */}
        <Svg style={StyleSheet.absoluteFill} width={SCREEN_W} height={SCREEN_H}>
          <Defs>
            <SvgRadial id="setFlare1" cx="20%" cy="15%" r="55%">
              <Stop
                offset="0%"
                stopColor={activeTheme.accentColor || '#38bdf8'}
                stopOpacity={isLightMode ? 0.28 : 0.4}
              />
              <Stop
                offset="55%"
                stopColor={activeTheme.accentSecondary || '#818cf8'}
                stopOpacity={isLightMode ? 0.1 : 0.15}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>

            <SvgRadial id="setFlareGold" cx="85%" cy="38%" r="48%">
              <Stop
                offset="0%"
                stopColor="#fbbf24"
                stopOpacity={isLightMode ? 0.18 : 0.28}
              />
              <Stop
                offset="60%"
                stopColor={activeTheme.accentColor || '#38bdf8'}
                stopOpacity={isLightMode ? 0.05 : 0.08}
              />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgRadial>
          </Defs>

          <Rect x="0" y="0" width="100%" height="100%" fill="url(#setFlare1)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#setFlareGold)" />

          {/* High-Tech Grid Lines */}
          <Line
            x1="0"
            y1="90"
            x2={SCREEN_W}
            y2="90"
            stroke={isLightMode ? '#94a3b8' : '#334155'}
            strokeWidth="1"
            strokeDasharray="6, 8"
            strokeOpacity={isLightMode ? 0.3 : 0.45}
          />
          <Line
            x1="0"
            y1="240"
            x2={SCREEN_W}
            y2="240"
            stroke={isLightMode ? '#94a3b8' : '#334155'}
            strokeWidth="1"
            strokeDasharray="10, 10"
            strokeOpacity={isLightMode ? 0.25 : 0.35}
          />
        </Svg>

        {/* Pulsing Energy Wave */}
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

      {/* 2. Scrollable Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <View style={[styles.header, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.headerIconCircle, { backgroundColor: `${activeTheme.accentColor}20`, borderColor: `${activeTheme.accentColor}40` }]}>
            <Settings size={20} color={activeTheme.accentColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: activeTheme.textPrimary, textAlign: isRtl ? 'right' : 'left' }]}>
              {lang === 'ar' ? 'الإعدادات العامة' : 'Settings & Preferences'}
            </Text>
            <Text style={[styles.subtitle, { color: activeTheme.textSecondary, textAlign: isRtl ? 'right' : 'left' }]}>
              {lang === 'ar' ? 'تخصيص المظهر والصوت والنسخ الاحتياطي' : 'Customize theme, audio, and backups'}
            </Text>
          </View>
        </View>

        {/* 2. Section 1: Themes Swatches Carousel */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 23, 42, 0.72)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}30`,
            },
          ]}
        >
          <View style={[styles.sectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Palette size={16} color={activeTheme.accentColor} />
            <Text style={[styles.sectionTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'المظهر والثيم البصري' : 'Visual Theme'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.themesRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            {Object.keys(allThemes).map((key) => {
              const th = allThemes[key];
              const isCurrent = themeId === key;

              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.82}
                  onPress={() => {
                    hapticsService.impactLight();
                    selectTheme(key);
                  }}
                  style={[
                    styles.themeSwatchCard,
                    {
                      backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.85)',
                      borderColor: isCurrent ? th.accentColor : isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                      borderWidth: isCurrent ? 2 : 1,
                      elevation: isCurrent ? 5 : 0,
                    },
                  ]}
                >
                  {/* 3D Color Orb */}
                  <LinearGradient
                    colors={th.gradientColors || ['#ffffff', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.themeOrb,
                      {
                        borderColor: isCurrent ? th.accentColor : 'rgba(255, 255, 255, 0.25)',
                      },
                    ]}
                  >
                    {isCurrent && (
                      <View style={styles.activeCheck}>
                        <Check size={12} color="#ffffff" strokeWidth={3} />
                      </View>
                    )}
                  </LinearGradient>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.themeName,
                      {
                        color: isCurrent ? th.accentColor : activeTheme.textPrimary,
                        fontWeight: isCurrent ? '900' : '700',
                      },
                    ]}
                  >
                    {lang === 'ar' ? th.nameAr : th.nameEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Section 2: Audio, Haptics & Language Controls */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 23, 42, 0.72)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}30`,
            },
          ]}
        >
          <View style={[styles.sectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Sparkles size={16} color={activeTheme.accentColor} />
            <Text style={[styles.sectionTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'التأثيرات واللغة' : 'Sensory & Language'}
            </Text>
          </View>

          {/* Sound Toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleSound}
            style={[styles.settingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.settingRowLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.settingIconBox, { backgroundColor: soundEnabled ? `${activeTheme.accentColor}25` : 'rgba(255, 255, 255, 0.06)' }]}>
                {soundEnabled ? (
                  <Volume2 size={16} color={activeTheme.accentColor} />
                ) : (
                  <VolumeX size={16} color={activeTheme.textMuted} />
                )}
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: activeTheme.textPrimary }]}>
                  {lang === 'ar' ? 'المؤثرات الصوتية' : 'Sound Effects'}
                </Text>
                <Text style={[styles.settingDesc, { color: activeTheme.textMuted }]}>
                  {soundEnabled ? (lang === 'ar' ? 'مفعلة 🔊' : 'Enabled 🔊') : (lang === 'ar' ? 'مكتومة 🔇' : 'Muted 🔇')}
                </Text>
              </View>
            </View>

            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: activeTheme.accentColor }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Haptics Toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleHaptics}
            style={[styles.settingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.settingRowLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.settingIconBox, { backgroundColor: hapticsEnabled ? `${activeTheme.accentColor}25` : 'rgba(255, 255, 255, 0.06)' }]}>
                <Smartphone size={16} color={hapticsEnabled ? activeTheme.accentColor : activeTheme.textMuted} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: activeTheme.textPrimary }]}>
                  {lang === 'ar' ? 'الاهتزاز التفاعلي (Haptic)' : 'Haptic Vibration'}
                </Text>
                <Text style={[styles.settingDesc, { color: activeTheme.textMuted }]}>
                  {hapticsEnabled ? (lang === 'ar' ? 'مفعل 📳' : 'Enabled 📳') : (lang === 'ar' ? 'معطل' : 'Disabled')}
                </Text>
              </View>
            </View>

            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: activeTheme.accentColor }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Language Switcher */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticsService.impactMedium();
              toggleLanguage();
            }}
            style={[styles.settingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
          >
            <View style={[styles.settingRowLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.settingIconBox, { backgroundColor: `${activeTheme.accentColor}25` }]}>
                <Globe size={16} color={activeTheme.accentColor} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: activeTheme.textPrimary }]}>
                  {lang === 'ar' ? 'لغة التطبيق' : 'App Language'}
                </Text>
                <Text style={[styles.settingDesc, { color: activeTheme.textMuted }]}>
                  {lang === 'ar' ? 'العربية (Arabic)' : 'English (الإنجليزية)'}
                </Text>
              </View>
            </View>

            <View style={[styles.langBadgePill, { backgroundColor: activeTheme.accentColor }]}>
              <Text style={styles.langBadgeText}>{lang === 'ar' ? 'English' : 'عربي'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Section 3: Data Management & Backup */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 23, 42, 0.72)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}30`,
            },
          ]}
        >
          <View style={[styles.sectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Download size={16} color={activeTheme.accentColor} />
            <Text style={[styles.sectionTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'البيانات والنسخ الاحتياطي' : 'Data & Backup'}
            </Text>
          </View>

          {/* Export JSON Button */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={handleExportJson}
            style={[
              styles.actionItemBtn,
              {
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={[styles.actionItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Download size={16} color={activeTheme.accentColor} />
              <Text style={[styles.actionItemLabel, { color: activeTheme.textPrimary }]}>
                {lang === 'ar' ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup (JSON)'}
              </Text>
            </View>
            <ChevronIcon size={16} color={activeTheme.textMuted} />
          </TouchableOpacity>

          {/* Reset All Data Button */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={handleConfirmReset}
            style={[
              styles.actionItemBtn,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={[styles.actionItemLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Trash2 size={16} color="#f87171" />
              <Text style={[styles.actionItemLabel, { color: '#f87171', fontWeight: '800' }]}>
                {lang === 'ar' ? 'مسح كافة البيانات وإعادة الضبط' : 'Clear All Data & Reset'}
              </Text>
            </View>
            <ChevronIcon size={16} color="#f87171" />
          </TouchableOpacity>
        </View>

        {/* 5. App Info Footer Card */}
        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 23, 42, 0.72)',
              borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}30`,
            },
          ]}
        >
          <View style={[styles.footerLogoBadge, { backgroundColor: `${activeTheme.accentColor}25` }]}>
            <Shield size={24} color={activeTheme.accentColor} />
          </View>
          <Text style={[styles.footerAppName, { color: activeTheme.textPrimary }]}>
            TEAM ME PRO
          </Text>
          <Text style={[styles.footerAppVersion, { color: activeTheme.textMuted }]}>
            Version 2.5.0 • Ultimate Tactical Edition  
          </Text>
        </View>
      </ScrollView>
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
    height: Math.max(380, SCREEN_H * 0.45),
    opacity: 0.35,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  headerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    gap: 12,
    elevation: 3,
  },
  sectionHeader: {
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  themesRow: {
    gap: 10,
    paddingVertical: 4,
  },
  themeSwatchCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 8,
    minWidth: 84,
  },
  themeOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontSize: 11,
    textAlign: 'center',
  },
  settingRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingRowLeft: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  langBadgePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  langBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  actionItemBtn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionItemLeft: {
    alignItems: 'center',
    gap: 8,
  },
  actionItemLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  footerLogoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  footerAppName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerAppVersion: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
