import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import {
  Home,
  Users,
  Zap,
  Trophy,
  Settings,
} from 'lucide-react-native';

export function BottomTabNavigator() {
  const { activeTheme } = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const { activeTab, setActiveTab, members, tournament } = useAppData();
  const insets = useSafeAreaInsets();

  // Hide on full-screen home and full-screen finger arena
  if (activeTab === 'finger' || activeTab === 'home') {
    return null;
  }

  const paddingBottom = insets.bottom ? Math.min(insets.bottom, 6) : (Platform.OS === 'ios' ? 8 : 2);

  const navItems = [
    { id: 'home', label: lang === 'ar' ? 'الرئيسية' : 'Home', icon: Home },
    { id: 'members', label: lang === 'ar' ? 'اللاعبين' : 'Squad', icon: Users, badge: members?.length || 0 },
    { id: 'generate', label: lang === 'ar' ? 'توليد' : 'Draft', icon: Zap, isCenter: true },
    { id: 'tournament', label: lang === 'ar' ? 'البطولة' : 'Bracket', icon: Trophy, hasDot: !!tournament },
    { id: 'settings', label: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    if (tabId !== activeTab) {
      hapticsService.selection();
      setActiveTab(tabId);
    }
  };

  return (
    <View style={styles.navWrapper}>
      {/* Floating 3D Glass Island Container */}
      <View
        style={[
          styles.bottomNavContainer,
          {
            backgroundColor: activeTheme.bgCard || '#0b0f19',
            borderColor: 'rgba(255, 255, 255, 0.14)',
            paddingBottom,
          },
        ]}
      >
        {/* Top Specular 3D Highlight Glow */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.00)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.top3DHighlight}
          pointerEvents="none"
        />

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => handleSelectTab(item.id)}
                style={styles.centerTabWrapper}
              >
                {/* 3D Volumetric Mini Sphere Button */}
                <View style={styles.center3DContainer}>
                  <LinearGradient
                    colors={
                      isActive
                        ? ['#38bdf8', '#2563eb', '#1d4ed8']
                        : activeTheme.gradientColors || ['#7c3aed', '#2563eb']
                    }
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={[
                      styles.center3DSphere,
                      {
                        shadowColor: activeTheme.accentColor,
                        shadowOpacity: isActive ? 0.8 : 0.45,
                      },
                    ]}
                  >
                    <View style={styles.specularTopCrescent} />
                    <Icon size={18} color="#ffffff" />
                  </LinearGradient>
                </View>
                <Text
                  style={[
                    styles.centerLabel,
                    {
                      color: isActive ? activeTheme.accentColor : activeTheme.textSecondary,
                      fontWeight: isActive ? '900' : '700',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => handleSelectTab(item.id)}
              style={[
                styles.tabItem,
                isActive && [
                  styles.tabItemActive3D,
                  { backgroundColor: `${activeTheme.accentColor}18`, borderColor: `${activeTheme.accentColor}40` },
                ],
              ]}
            >
              <View style={styles.iconBox}>
                <Icon
                  size={16}
                  color={isActive ? activeTheme.accentColor : activeTheme.textMuted}
                />
                {item.badge !== undefined && item.badge !== null && item.badge !== 0 ? (
                  <View style={[styles.badgeBubble, { backgroundColor: activeTheme.accentColor }]}>
                    <Text style={styles.badgeBubbleText}>{item.badge}</Text>
                  </View>
                ) : null}
                {item.hasDot ? (
                  <View style={[styles.activeDot, { backgroundColor: activeTheme.accentColor || '#60a5fa' }]} />
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? activeTheme.accentColor : activeTheme.textMuted,
                    fontWeight: isActive ? '900' : '600',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    backgroundColor: 'transparent',
    elevation: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    zIndex: 50,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1.2,
    paddingTop: 5,
    paddingHorizontal: 6,
    position: 'relative',
  },
  top3DHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3.5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 10,
    gap: 2,
  },
  tabItemActive3D: {
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  iconBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  tabLabel: {
    fontSize: 9.5,
    lineHeight: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  centerTabWrapper: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
    gap: 1,
  },
  center3DContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center3DSphere: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
    overflow: 'hidden',
  },
  specularTopCrescent: {
    position: 'absolute',
    top: 2,
    left: 5,
    right: 5,
    height: 9,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  centerLabel: {
    fontSize: 9.5,
    lineHeight: 12,
    textAlign: 'center',
  },
  badgeBubble: {
    position: 'absolute',
    top: -3,
    right: -8,
    borderRadius: 999,
    paddingHorizontal: 3.5,
    paddingVertical: 0.5,
    minWidth: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  badgeBubbleText: {
    color: '#ffffff',
    fontSize: 7.5,
    fontWeight: '900',
  },
  activeDot: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
  },
});
