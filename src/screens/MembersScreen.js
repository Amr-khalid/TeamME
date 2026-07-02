import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
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
import { MemberCard } from '../components/members/MemberCard';
import { AddEditMemberModal } from '../components/members/AddEditMemberModal';
import { BulkImportModal } from '../components/members/BulkImportModal';
import { ROLES } from '../theme/constants';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppData } from '../context/AppDataContext';
import { hapticsService } from '../services/hapticsService';
import {
  Search,
  UserPlus,
  FileSpreadsheet,
  Users,
  Flame,
  LayoutGrid,
  List,
  Sparkles,
  Crown,
  Zap,
  Shield,
  HeartHandshake,
  Target,
  Layers,
} from 'lucide-react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ROSTER_ART = require('../../assets/images/roster_art.jpg');

const ROLE_ICONS = {
  captain: Crown,
  striker: Zap,
  tank: Shield,
  support: HeartHandshake,
  playmaker: Sparkles,
  rookie: Target,
  Crown,
  Zap,
  Shield,
  HeartHandshake,
  Sparkles,
  Target,
};

export function MembersScreen() {
  const { activeTheme, themeId } = useTheme();
  const { lang, isRTL } = useLanguage();
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    bulkImportMembers,
  } = useAppData();

  const isLightMode = themeId === 'manga_white' || themeId === 'frost';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Extract distinct tactical roles present in existing members
  const existingRoles = useMemo(() => {
    const roleSet = new Set(members.map((m) => m.role).filter(Boolean));
    return Array.from(roleSet);
  }, [members]);

  // Only show role filter if there are players with more than 1 distinct role
  const showRoleFilter = existingRoles.length > 1;

  // Auto-reset role filter if the selected role is no longer present
  useEffect(() => {
    if (!showRoleFilter && selectedRole !== 'all') {
      setSelectedRole('all');
    }
  }, [showRoleFilter, selectedRole]);

  // Ambient pulsing glow wave
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

  // Squad average skill calculation
  const squadAvgSkill = useMemo(() => {
    if (!members.length) return '0.0';
    const total = members.reduce((sum, m) => sum + (Number(m.level) || 5), 0);
    return (total / members.length).toFixed(1);
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchRole =
        !showRoleFilter || selectedRole === 'all' || m.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [members, searchQuery, selectedRole, showRoleFilter]);

  const handleEdit = (member) => {
    setEditingMember(member);
    setIsAddModalOpen(true);
  };

  const handleSaveMember = (memberData) => {
    if (editingMember) {
      updateMember(editingMember.id, memberData);
      setEditingMember(null);
    } else {
      addMember(memberData);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[styles.rootContainer, { backgroundColor: isLightMode ? '#f8fafc' : '#030511' }]}>
        {/* 1. Legendary Cinematic Fixed Backdrop Layer */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Base Theme Color Layer */}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isLightMode ? '#f8fafc' : '#030511' },
            ]}
          />

          {/* Hero Artwork with Cinematic Blending */}
          <Image
            source={ROSTER_ART}
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

          {/* Tactical Pitch Geometry & Cyber Glow Flares */}
          <Svg style={StyleSheet.absoluteFill} width={SCREEN_W} height={SCREEN_H}>
            <Defs>
              <SvgRadial id="rosterFlarePrimary" cx="15%" cy="12%" r="55%">
                <Stop
                  offset="0%"
                  stopColor={activeTheme.accentColor || '#38bdf8'}
                  stopOpacity={isLightMode ? 0.3 : 0.42}
                />
                <Stop
                  offset="55%"
                  stopColor={activeTheme.accentSecondary || '#818cf8'}
                  stopOpacity={isLightMode ? 0.1 : 0.15}
                />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </SvgRadial>

              <SvgRadial id="rosterFlareGold" cx="88%" cy="32%" r="48%">
                <Stop
                  offset="0%"
                  stopColor="#fbbf24"
                  stopOpacity={isLightMode ? 0.2 : 0.3}
                />
                <Stop
                  offset="60%"
                  stopColor={activeTheme.accentColor || '#38bdf8'}
                  stopOpacity={isLightMode ? 0.05 : 0.09}
                />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </SvgRadial>
            </Defs>

            {/* Ambient Glows */}
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#rosterFlarePrimary)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#rosterFlareGold)" />

            {/* High-Tech Tactical Pitch Hatching & Lines */}
            <Line
              x1="0"
              y1="80"
              x2={SCREEN_W}
              y2="80"
              stroke={isLightMode ? '#94a3b8' : '#334155'}
              strokeWidth="1"
              strokeDasharray="6, 8"
              strokeOpacity={isLightMode ? 0.3 : 0.45}
            />
            <Line
              x1="0"
              y1="220"
              x2={SCREEN_W}
              y2="220"
              stroke={isLightMode ? '#94a3b8' : '#334155'}
              strokeWidth="1"
              strokeDasharray="10, 10"
              strokeOpacity={isLightMode ? 0.25 : 0.35}
            />
            <Circle
              cx={SCREEN_W / 2}
              cy="150"
              r="110"
              stroke={isLightMode ? '#cbd5e1' : activeTheme.accentColor}
              strokeWidth="1.2"
              strokeDasharray="4, 10"
              strokeOpacity={isLightMode ? 0.25 : 0.22}
              fill="none"
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
              colors={['transparent', `${activeTheme.accentColor}12`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* 2. Scrollable Foreground Content */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* 1. Artistic Squad Overview Banner - Transparent Glassmorphic Hub */}
          <View
            style={[
              styles.artisticSquadBanner,
              {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
              },
            ]}
          >
            {/* Stats Overview Row */}
            <View style={styles.bannerTopRow}>
              {/* Total Members Stat */}
              <View style={styles.statGroup}>
                <Text style={[styles.statValueText, { color: activeTheme.textPrimary }]}>
                  {members.length}
                </Text>
                <Text style={[styles.statLabelText, { color: activeTheme.textMuted }]}>
                  {lang === 'ar' ? 'إجمالي اللاعبين' : 'Total Squad'}
                </Text>
              </View>

              {/* Glowing Divider */}
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' },
                ]}
              />

              {/* Squad Average Rating Stat */}
              <View style={styles.statGroup}>
                <View style={styles.ovrRow}>
                  <Flame size={17} color="#fbbf24" />
                  <Text style={styles.ovrValueText}>{squadAvgSkill}</Text>
                </View>
                <Text style={[styles.statLabelText, { color: activeTheme.textMuted }]}>
                  {lang === 'ar' ? 'متوسط القوة' : 'Squad Average'}
                </Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  hapticsService.impactMedium();
                  setEditingMember(null);
                  setIsAddModalOpen(true);
                }}
                style={styles.addBtnFlex}
              >
                <LinearGradient
                  colors={activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addBtnGradient}
                >
                  <UserPlus size={15} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  hapticsService.impactLight();
                  setIsBulkModalOpen(true);
                }}
                style={[
                  styles.bulkBtnFlex,
                  {
                    backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                  },
                ]}
              >
                <FileSpreadsheet size={15} color={activeTheme.accentColor} />
          
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Sleek Search Bar */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                  borderColor: searchQuery
                    ? activeTheme.accentColor
                    : isLightMode
                    ? 'rgba(0, 0, 0, 0.08)'
                    : `${activeTheme.accentColor}30`,
                },
              ]}
            >
              <Search size={16} color={searchQuery ? activeTheme.accentColor : activeTheme.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={lang === 'ar' ? 'ابحث عن لاعب بالاسم...' : 'Search player by name...'}
                placeholderTextColor={activeTheme.textMuted}
                style={[
                  styles.searchInput,
                  {
                    color: activeTheme.textPrimary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.searchClearBtn}
                >
                  <Text style={{ color: activeTheme.textMuted, fontSize: 13, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* 3. Horizontal Tactical Role Ribbons - Clearly visible logos & icons */}
          {showRoleFilter && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roleRibbonScroll}
            >
              {/* All Option */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hapticsService.impactLight();
                  setSelectedRole('all');
                }}
                style={[
                  styles.roleChip,
                  selectedRole === 'all'
                    ? {
                        backgroundColor: activeTheme.accentColor,
                        borderColor: '#ffffff',
                        elevation: 4,
                      }
                    : {
                        backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                        borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)',
                      },
                ]}
              >
                <View
                  style={[
                    styles.roleChipIconBadge,
                    {
                      backgroundColor: selectedRole === 'all' ? 'rgba(0,0,0,0.22)' : `${activeTheme.accentColor}25`,
                    },
                  ]}
                >
                  <Layers size={13} color={selectedRole === 'all' ? '#ffffff' : activeTheme.accentColor} />
                </View>
                <Text
                  style={[
                    styles.roleChipText,
                    {
                      color: selectedRole === 'all' ? '#ffffff' : activeTheme.textPrimary,
                      fontWeight: selectedRole === 'all' ? '900' : '700',
                    },
                  ]}
                >
                  {lang === 'ar' ? 'الكل' : 'All'}
                </Text>
              </TouchableOpacity>

              {/* Roles with Emblems */}
              {existingRoles.map((key) => {
                const r = ROLES[key] || { nameAr: key, nameEn: key, color: activeTheme.accentColor, icon: 'Shield' };
                const RoleIcon = ROLE_ICONS[r.icon] || ROLE_ICONS[key] || Shield;
                const isSelected = selectedRole === key;

                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    onPress={() => {
                      hapticsService.impactLight();
                      setSelectedRole(key);
                    }}
                    style={[
                      styles.roleChip,
                      isSelected
                        ? {
                            backgroundColor: r.color || activeTheme.accentColor,
                            borderColor: '#ffffff',
                            elevation: 4,
                          }
                        : {
                            backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                            borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${r.color}50`,
                          },
                    ]}
                  >
                    <View
                      style={[
                        styles.roleChipIconBadge,
                        {
                          backgroundColor: isSelected ? 'rgba(0,0,0,0.22)' : `${r.color}25`,
                          borderColor: isSelected ? 'rgba(255,255,255,0.4)' : `${r.color}40`,
                        },
                      ]}
                    >
                      <RoleIcon size={13} color={isSelected ? '#ffffff' : r.color} />
                    </View>
                    <Text
                      style={[
                        styles.roleChipText,
                        {
                          color: isSelected ? '#ffffff' : activeTheme.textPrimary,
                          fontWeight: isSelected ? '900' : '700',
                        },
                      ]}
                    >
                      {lang === 'ar' ? r.nameAr : r.nameEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* 4. Mini Layout Switcher Bar (Grid vs List) */}
          <View style={styles.viewModeBar}>
            <View style={styles.countBadgeWrapper}>
              <Sparkles size={13} color={activeTheme.accentColor} />
              <Text style={[styles.viewModeCountText, { color: activeTheme.textSecondary }]}>
                {filteredMembers.length} {lang === 'ar' ? 'لاعب' : 'players'}
              </Text>
            </View>

            <View
              style={[
                styles.modeTogglePill,
                {
                  backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                  borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hapticsService.impactLight();
                  setViewMode('grid');
                }}
                style={[
                  styles.miniToggleBtn,
                  viewMode === 'grid' && {
                    backgroundColor: activeTheme.accentColor,
                    borderColor: '#ffffff',
                  },
                ]}
              >
                <LayoutGrid
                  size={13}
                  color={viewMode === 'grid' ? '#ffffff' : activeTheme.textSecondary}
                />
                <Text
                  style={[
                    styles.miniToggleText,
                    { color: viewMode === 'grid' ? '#ffffff' : activeTheme.textSecondary },
                  ]}
                >
                  {lang === 'ar' ? 'شبكة' : 'Grid'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hapticsService.impactLight();
                  setViewMode('list');
                }}
                style={[
                  styles.miniToggleBtn,
                  viewMode === 'list' && {
                    backgroundColor: activeTheme.accentColor,
                    borderColor: '#ffffff',
                  },
                ]}
              >
                <List
                  size={13}
                  color={viewMode === 'list' ? '#ffffff' : activeTheme.textSecondary}
                />
                <Text
                  style={[
                    styles.miniToggleText,
                    { color: viewMode === 'list' ? '#ffffff' : activeTheme.textSecondary },
                  ]}
                >
                  {lang === 'ar' ? 'قائمة' : 'List'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Player Roster Display (Grid vs List) */}
          {members.length === 0 ? (
            <View
              style={[
                styles.emptySquadCard,
                {
                  backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.42)',
                  borderColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : `${activeTheme.accentColor}35`,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconCircle,
                  {
                    backgroundColor: `${activeTheme.accentColor}18`,
                    borderColor: `${activeTheme.accentColor}40`,
                  },
                ]}
              >
                <Users size={32} color={activeTheme.accentColor} />
              </View>
              <Text style={[styles.emptySquadTitle, { color: activeTheme.textPrimary }]}>
                {lang === 'ar' ? 'مفيش لعيبة متسجلة لسه' : 'Squad is Empty'}
              </Text>
              <Text style={[styles.emptySquadDesc, { color: activeTheme.textSecondary }]}>
                {lang === 'ar'
                  ? 'أضف أول لاعب في قائمتك عشان تبدأ توزع الفرق وتعمل بطولات وقرعة.'
                  : 'Start by adding players to your roster to generate teams and tournaments.'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  hapticsService.impactMedium();
                  setEditingMember(null);
                  setIsAddModalOpen(true);
                }}
                style={[styles.emptyAddBtn, { backgroundColor: activeTheme.accentColor }]}
              >
                <UserPlus size={16} color="#ffffff" />
                <Text style={styles.emptyAddBtnText}>
                  {lang === 'ar' ? '+ ضيف أول لاعب' : 'Add First Player +'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.membersContainer,
                viewMode === 'grid' ? styles.gridContainer : styles.listContainer,
              ]}
            >
              {filteredMembers.map((member, idx) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={idx}
                  viewMode={viewMode}
                  onEdit={handleEdit}
                  onDelete={deleteMember}
                />
              ))}

              {filteredMembers.length === 0 && (
                <View style={styles.emptyWrap}>
                  <Users size={38} color={activeTheme.textMuted} style={{ opacity: 0.5 }} />
                  <Text style={[styles.emptyText, { color: activeTheme.textSecondary }]}>
                    {lang === 'ar' ? 'لا يوجد لاعبين مطابقين للبحث' : 'No players found'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Add / Edit Player Modal */}
          <AddEditMemberModal
            visible={isAddModalOpen}
            initialData={editingMember}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingMember(null);
            }}
            onSave={handleSaveMember}
          />

          {/* Bulk Import Modal */}
          <BulkImportModal
            visible={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            onImport={bulkImportMembers}
          />
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  artisticSquadBanner: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    gap: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statGroup: {
    alignItems: 'center',
    gap: 2,
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ovrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ovrValueText: {
    color: '#fbbf24',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  dividerLine: {
    width: 1,
    height: 32,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtnFlex: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10.5,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  bulkBtnFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  bulkBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  searchContainer: {
    width: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8.5,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  roleRibbonScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 3,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  roleChipIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipText: {
    fontSize: 12,
  },
  viewModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: -2,
  },
  countBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewModeCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modeTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  miniToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  miniToggleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  membersContainer: {
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  listContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  emptyWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptySquadCard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.2,
    gap: 8,
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptySquadTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptySquadDesc: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 14,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    elevation: 4,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '900',
  },
});
