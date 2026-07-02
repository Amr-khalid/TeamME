import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { hapticsService } from '../../services/hapticsService';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Users,
  Settings,
  Zap,
} from 'lucide-react-native';

export function SmallTopNavbar() {
  const { activeTheme } = useTheme();
  const { lang, isRTL } = useLanguage();
  const { activeTab, setActiveTab, members } = useAppData();

  // Hide on full-screen multi-touch finger arena
  if (activeTab === 'finger') {
    return null;
  }

  const handleGoHome = () => {
    hapticsService.impactLight();
    setActiveTab('home');
  };

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'members':
        return lang === 'ar' ? 'تشكيلة الأعضاء' : 'Squad Roster';
      case 'generate':
        return lang === 'ar' ? 'توليد الفرق الذكي' : 'Team Generator';
      case 'tournament':
        return lang === 'ar' ? 'شجرة البطولات' : 'Tournament Bracket';
      case 'oracle':
        return lang === 'ar' ? 'عرّاف القرعة' : 'Oracle of Destiny';
      case 'history':
        return lang === 'ar' ? 'سجل التشكيلات' : 'Squad History';
      case 'settings':
        return lang === 'ar' ? 'الإعدادات والمظهر' : 'Settings & Themes';
      default:
        return 'TEAM ME PRO';
    }
  };

  const isHome = activeTab === 'home';

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: activeTheme.bgCard || '#090b24',
          borderBottomColor: activeTheme.borderSubtle,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {isHome ? (
        /* Home State: Branding + Quick Squad Pill */
        <>
          <View style={[styles.brandGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.brandText, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'تـيـم مـي' : 'TEAM ME'}
            </Text>
            <View style={[styles.proBadge, { backgroundColor: activeTheme.accentColor }]}>
              <Text style={[styles.proBadgeText, { color: '#ffffff' }]}>
                {lang === 'ar' ? 'بـرو' : 'PRO'}
              </Text>
            </View>
          </View>

          <View style={[styles.rightActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hapticsService.impactLight();
                setActiveTab('members');
              }}
              style={[styles.squadCountPill, { borderColor: activeTheme.borderSubtle, backgroundColor: activeTheme.inputBg, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <Users size={12} color={activeTheme.accentColor} />
              <Text style={[styles.squadCountText, { color: activeTheme.textPrimary }]}>
                {members.length} {lang === 'ar' ? 'لاعب' : 'Squad'}
              </Text>
            </TouchableOpacity>

          </View>
        </>
      ) : (
        /* Sub-Screen State: Back Button + Screen Title */
        <>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleGoHome}
            style={[styles.backBtn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {isRTL ? <ArrowRight size={16} color={activeTheme.accentColor} /> : <ArrowLeft size={16} color={activeTheme.accentColor} />}
            <Text style={[styles.backBtnText, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Text>
          </TouchableOpacity>

          <Text numberOfLines={1} style={[styles.screenTitleText, { color: activeTheme.textPrimary }]}>
            {getScreenTitle()}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticsService.impactLight();
              setActiveTab('settings');
            }}
            style={styles.settingsIconBtn}
          >
            <Settings size={15} color={activeTheme.textSecondary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    zIndex: 40,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  proBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  proBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  squadCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  squadCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  settingsIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  screenTitleText: {
    fontSize: 13.5,
    fontWeight: '900',
    textAlign: 'center',
  },
});
