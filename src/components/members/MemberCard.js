import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Polygon,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Line,
  Circle,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ROLES } from '../../theme/constants';
import { hapticsService } from '../../services/hapticsService';
import {
  Crown,
  Zap,
  Shield,
  HeartHandshake,
  Sparkles,
  Target,
  Edit3,
  Trash2,
  Star,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 42) / 2;
const CARD_H = 158;

const ROLE_ICONS = {
  Crown,
  Zap,
  Shield,
  HeartHandshake,
  Sparkles,
  Target,
};

export function MemberCard({
  member,
  index = 0,
  viewMode = 'grid', // 'grid' | 'list'
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) {
  const { activeTheme, themeId } = useTheme();
  const { lang } = useLanguage();

  const roleConfig = ROLES[member.role] || ROLES.rookie;
  const RoleIcon = ROLE_ICONS[roleConfig.icon] || Shield;
  const level = Number(member.level) || 7;
  const starCount = Math.max(1, Math.min(10, level));

  // Interlocking Chamfer Geometry for Grid
  const isOdd = index % 2 === 1;
  const CUT = 20;

  const points = isOdd
    ? `0,0 ${CARD_W - CUT},0 ${CARD_W},${CUT} ${CARD_W},${CARD_H} ${CUT},${CARD_H} 0,${CARD_H - CUT}`
    : `0,${CUT} ${CUT},0 ${CARD_W},0 ${CARD_W},${CARD_H - CUT} ${CARD_W - CUT},${CARD_H} 0,${CARD_H}`;

  // Theme Adaptations
  const isLight = themeId === 'manga_white' || themeId === 'frost';
  const bgStart = isLight ? '#ffffff' : '#0f172a';
  const bgEnd = isLight ? '#f1f5f9' : '#030511';
  const borderColorStart = isSelected
    ? activeTheme.accentColor
    : isLight
    ? 'rgba(0, 0, 0, 0.2)'
    : (activeTheme.borderFocus || '#ffffff');
  const lineCol = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)';

  const roleGradients = {
    captain: ['#fbbf24', '#d97706'],
    striker: ['#f43f5e', '#be185d'],
    tank: ['#3b82f6', '#1d4ed8'],
    playmaker: ['#a855f7', '#6d28d9'],
    rookie: ['#10b981', '#059669'],
  };

  const currentGradient = roleGradients[member.role] || roleGradients.rookie;

  const handlePress = () => {
    if (onSelect) {
      hapticsService.selection();
      onSelect();
    } else if (onEdit) {
      hapticsService.impactLight();
      onEdit(member);
    }
  };

  // --- 1. LIST VIEW MODE (Full-Width Horizontal Row) ---
  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.listCard,
          {
            backgroundColor: isSelected
              ? `${activeTheme.accentColor}25`
              : isLight
              ? 'rgba(255, 255, 255, 0.48)'
              : 'rgba(15, 23, 42, 0.42)',
            borderColor: isSelected
              ? activeTheme.accentColor
              : isLight
              ? 'rgba(0, 0, 0, 0.08)'
              : `${roleConfig.color}40`,
          },
        ]}
      >
        {/* Diamond OVR Gem */}
        <LinearGradient
          colors={currentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.listOvrGem}
        >
          <Text style={styles.listOvrNum}>{level}</Text>
          <Text style={styles.listOvrStar}>★</Text>
        </LinearGradient>

        {/* Player Details */}
        <View style={styles.listDetails}>
          <View style={styles.listNameRow}>
            <Text numberOfLines={1} style={[styles.listPlayerName, { color: activeTheme.textPrimary }]}>
              {member.name}
            </Text>
            <View style={[styles.rolePill, { backgroundColor: `${roleConfig.color}25`, borderColor: roleConfig.color }]}>
              <RoleIcon size={9} color={roleConfig.color} />
              <Text style={[styles.rolePillText, { color: roleConfig.color }]}>
                {lang === 'ar' ? roleConfig.nameAr : roleConfig.nameEn}
              </Text>
            </View>
          </View>

          <View style={styles.listBottomRow}>
            {/* Stars Row */}
            <View style={styles.listStarsWrap}>
              {Array.from({ length: starCount }).map((_, i) => (
                <Star key={i} size={8.5} color="#fbbf24" fill="#fbbf24" />
              ))}
            </View>

            {member.notes ? (
              <Text numberOfLines={1} style={[styles.listNotes, { color: activeTheme.textMuted }]}>
                {member.notes}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.miniActionsRow}>
          {onEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                hapticsService.impactLight();
                onEdit(member);
              }}
              style={[
                styles.actionBtn,
                {
                  borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)',
                  backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                },
              ]}
            >
              <Edit3 size={11} color={isLight ? '#334155' : '#94a3b8'} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                hapticsService.impactMedium();
                onDelete(member.id);
              }}
              style={[styles.actionBtn, styles.deleteBtn]}
            >
              <Trash2 size={11} color="#f87171" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // --- 2. GRID VIEW MODE (Polymorphic Interlocking Shards with Transparent Glass) ---
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[styles.shardWrapper, { width: CARD_W, height: CARD_H }]}
    >
      {/* Geometric SVG Shard Background - Crystal Glass Translucency */}
      <Svg width={CARD_W} height={CARD_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id={`gradBg_${member.id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={bgStart} stopOpacity={isLight ? "0.45" : "0.36"} />
            <Stop offset="100%" stopColor={bgEnd} stopOpacity={isLight ? "0.55" : "0.46"} />
          </SvgGradient>

          <SvgGradient id={`gradBorder_${member.id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={borderColorStart} stopOpacity="0.85" />
            <Stop offset="50%" stopColor={roleConfig.color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={isLight ? '#64748b' : '#334155'} stopOpacity="0.35" />
          </SvgGradient>
        </Defs>

        {/* Shard Base Polygon */}
        <Polygon
          points={points}
          fill={`url(#gradBg_${member.id})`}
          stroke={`url(#gradBorder_${member.id})`}
          strokeWidth="1.4"
        />

        {/* Diagonal Tech Hatching Lines */}
        <Line
          x1={isOdd ? CARD_W - CUT : 0}
          y1={isOdd ? 0 : CUT}
          x2={isOdd ? CARD_W : CUT}
          y2={isOdd ? CUT : 0}
          stroke={lineCol}
          strokeWidth="1.2"
          strokeOpacity={isLight ? 0.35 : 0.6}
        />
        <Line
          x1={isOdd ? CUT : CARD_W}
          y1={isOdd ? CARD_H : CARD_H - CUT}
          x2={isOdd ? 0 : CARD_W - CUT}
          y2={isOdd ? CARD_H - CUT : CARD_H}
          stroke={lineCol}
          strokeWidth="1.2"
          strokeOpacity={isLight ? 0.35 : 0.6}
        />

        {/* Vertex Studs */}
        <Circle cx={isOdd ? CUT : CARD_W - CUT} cy={CARD_H} r="2" fill={lineCol} />
        <Circle cx={isOdd ? CARD_W - CUT : CUT} cy="0" r="2" fill={lineCol} />
      </Svg>

      {/* Shard Content Overlay */}
      <View style={styles.contentContainer}>
        {/* Top Header: Diamond OVR Gem + Role Badge + Action Controls */}
        <View style={styles.topHeaderRow}>
          {/* Diamond OVR Crystal */}
          <View style={styles.diamondOuter}>
            <LinearGradient
              colors={currentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.diamondInner}
            >
              <Text style={styles.diamondOvrText}>{level}</Text>
            </LinearGradient>
          </View>

          {/* Role Pill */}
          <View
            style={[
              styles.rolePill,
              { backgroundColor: `${roleConfig.color}25`, borderColor: roleConfig.color },
            ]}
          >
            <RoleIcon size={9} color={roleConfig.color} />
            <Text style={[styles.rolePillText, { color: roleConfig.color }]}>
              {lang === 'ar' ? roleConfig.nameAr : roleConfig.nameEn}
            </Text>
          </View>

          {/* Edit/Trash Actions */}
          <View style={styles.miniActionsRow}>
            {onEdit && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  hapticsService.impactLight();
                  onEdit(member);
                }}
                style={[
                  styles.actionBtn,
                  {
                    borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)',
                    backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                  },
                ]}
              >
                <Edit3 size={11} color={isLight ? '#334155' : '#94a3b8'} />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  hapticsService.impactMedium();
                  onDelete(member.id);
                }}
                style={[styles.actionBtn, styles.deleteBtn]}
              >
                <Trash2 size={11} color="#f87171" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Center: Polymorphic Avatar & Player Name */}
        <View style={styles.centerSection}>
          {/* Diamond Avatar Frame */}
          <View style={[styles.avatarDiamond, { borderColor: roleConfig.color }]}>
            <LinearGradient
              colors={isLight ? ['rgba(241, 245, 249, 0.7)', 'rgba(203, 213, 225, 0.7)'] : ['rgba(30, 41, 59, 0.7)', 'rgba(2, 6, 23, 0.7)']}
              style={styles.avatarGradient}
            >
              <Text style={[styles.avatarInitial, { color: roleConfig.color }]}>
                {member.name ? member.name.charAt(0).toUpperCase() : 'P'}
              </Text>
            </LinearGradient>
          </View>

          {/* Player Name */}
          <Text
            numberOfLines={1}
            style={[styles.playerName, { color: activeTheme.textPrimary }]}
          >
            {member.name}
          </Text>

          {/* Curved Winged Arc of Exact Stars */}
          <View style={styles.starWingedArcRow}>
            {Array.from({ length: starCount }).map((_, idx) => {
              const offset = idx - (starCount - 1) / 2;
              const translateY = Math.abs(offset) * 1.5;
              const rotate = `${offset * 3.5}deg`;

              return (
                <View
                  key={idx}
                  style={{
                    transform: [{ translateY }, { rotate }],
                    marginHorizontal: starCount > 7 ? 0.6 : 1.2,
                  }}
                >
                  <Star
                    size={starCount > 7 ? 7.5 : starCount > 5 ? 8.5 : 9.5}
                    color="#fbbf24"
                    fill="#fbbf24"
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom: Notes / Tag */}
        {member.notes ? (
          <Text
            numberOfLines={1}
            style={[styles.notesText, { color: activeTheme.textMuted }]}
          >
            {member.notes}
          </Text>
        ) : (
          <View style={styles.bottomPlaceholder} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid Shard Styles
  shardWrapper: {
    position: 'relative',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginBottom: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  diamondOuter: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamondInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  diamondOvrText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }],
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 8.5,
    fontWeight: '900',
  },
  miniActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionBtn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: -2,
  },
  avatarDiamond: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }],
    overflow: 'hidden',
    marginBottom: 4,
    elevation: 3,
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }],
  },
  playerName: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  starWingedArcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
    marginTop: 1,
  },
  notesText: {
    fontSize: 9.5,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomPlaceholder: {
    height: 6,
  },

  // List Row Styles
  listCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.2,
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 10,
    elevation: 3,
    marginBottom: 4,
  },
  listOvrGem: {
    width: 38,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  listOvrNum: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
  },
  listOvrStar: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 8.5,
    fontWeight: '900',
  },
  listDetails: {
    flex: 1,
    gap: 2,
  },
  listNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  listPlayerName: {
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  listBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listStarsWrap: {
    flexDirection: 'row',
    gap: 1.5,
  },
  listNotes: {
    fontSize: 10.5,
    fontStyle: 'italic',
    flex: 1,
  },
});
