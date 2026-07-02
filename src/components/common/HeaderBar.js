import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { hapticsService } from '../../services/hapticsService';
import {
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Globe,
  Zap,
  ArrowRight,
  ArrowLeft,
  Settings,
  Home,
} from 'lucide-react-native';

export function HeaderBar() {
  const { activeTheme, themeId, selectTheme, allThemes } = useTheme();
  const { lang, toggleLanguage, isRTL } = useLanguage();
  const { activeTab, setActiveTab } = useAppData();
  const [soundOn, setSoundOn] = useState(hapticsService.isSoundEnabled());

  const handleToggleSound = async () => {
    const newState = await hapticsService.toggleSound();
    setSoundOn(newState);
  };

  const handleCycleTheme = () => {
    hapticsService.impactLight();
    const themeKeys = Object.keys(allThemes);
    const currentIndex = themeKeys.indexOf(themeId);
    const nextKey = themeKeys[(currentIndex + 1) % themeKeys.length];
    selectTheme(nextKey);
  };

  const handleToggleLanguage = () => {
    hapticsService.impactLight();
    toggleLanguage();
  };

  const handleGoHome = () => {
    hapticsService.impactLight();
    setActiveTab('home');
  };

  const handleOpenSettings = () => {
    hapticsService.impactLight();
    setActiveTab('settings');
  };

  const isHome = activeTab === 'home';

  const SCREEN_TITLES = {
    members: lang === 'ar' ? 'قائمة اللاعبين' : 'Player Roster',
    generate: lang === 'ar' ? 'توليد التشكيلات' : 'Team Generator',
    tournament: lang === 'ar' ? 'نظام البطولات' : 'Tournaments',
    finger: lang === 'ar' ? 'قرعة الأصابع' : 'Finger Arena',
    oracle: lang === 'ar' ? 'عراف القرارات' : 'Decision Oracle',
    history: lang === 'ar' ? 'سجل التشكيلات' : 'History',
    settings: lang === 'ar' ? 'مركز الإعدادات' : 'Settings',
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeTheme.navBg,
          borderBottomColor: activeTheme.borderSubtle,
        },
      ]}
    >
      {/* Left: Brand or Back to Home Button */}
      {isHome ? (
        <View style={styles.brandRow}>
          <LinearGradient
            colors={activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Zap size={18} color="#ffffff" />
          </LinearGradient>
          <View style={styles.brandText}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: activeTheme.textPrimary }]}>
                TEAM ME
              </Text>
              <View style={[styles.proBadge, { backgroundColor: activeTheme.accentColor }]}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={[styles.tagline, { color: activeTheme.textMuted }]}>
              {lang === 'ar' ? 'منظومة التشكيلات الرياضية' : 'Sports Intelligence'}
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleGoHome}
          style={[
            styles.backHomeBtn,
            { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: activeTheme.borderSubtle },
          ]}
        >
          {isRTL ? <ArrowRight size={16} color={activeTheme.accentColor} /> : <ArrowLeft size={16} color={activeTheme.accentColor} />}
          <Text style={[styles.backHomeText, { color: activeTheme.textPrimary }]}>
            {SCREEN_TITLES[activeTab] || (lang === 'ar' ? 'الرئيسية' : 'Home')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Right: Quick Action Controls */}
      <View style={styles.actionsRow}>
        {/* If not on home, show direct Home icon */}
        {!isHome && (
          <TouchableOpacity
            onPress={handleGoHome}
            style={[
              styles.actionBtn,
              { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: activeTheme.borderSubtle },
            ]}
          >
            <Home size={15} color={activeTheme.accentColor} />
          </TouchableOpacity>
        )}

        {/* Sound Toggle */}
        <TouchableOpacity
          onPress={handleToggleSound}
          style={[
            styles.actionBtn,
            { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: activeTheme.borderSubtle },
          ]}
        >
          {soundOn ? (
            <Volume2 size={15} color={activeTheme.accentColor} />
          ) : (
            <VolumeX size={15} color={activeTheme.textMuted} />
          )}
        </TouchableOpacity>

        {/* Theme Quick Cycle */}
        <TouchableOpacity
          onPress={handleCycleTheme}
          style={[
            styles.actionBtn,
            { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: activeTheme.borderSubtle },
          ]}
        >
          <Sparkles size={15} color={activeTheme.accentSecondary} />
        </TouchableOpacity>

        {/* Language Toggle */}
        <TouchableOpacity
          onPress={handleToggleLanguage}
          style={[
            styles.langBtn,
            { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: activeTheme.borderSubtle },
          ]}
        >
          <Globe size={12} color={activeTheme.textPrimary} />
          <Text style={[styles.langText, { color: activeTheme.textPrimary }]}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </Text>
        </TouchableOpacity>

        {/* Settings button if on home */}
        {isHome && (
          <TouchableOpacity
            onPress={handleOpenSettings}
            style={[
              styles.actionBtn,
              { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: activeTheme.borderSubtle },
            ]}
          >
            <Settings size={15} color={activeTheme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  brandText: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  proBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  backHomeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtn: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
