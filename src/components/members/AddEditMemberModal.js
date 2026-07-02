import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalSheet } from '../common/ModalSheet';
import { ROLES } from '../../theme/constants';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { hapticsService } from '../../services/hapticsService';
import { audioService } from '../../services/audioService';
import {
  Crown,
  Zap,
  Shield,
  HeartHandshake,
  Sparkles,
  Target,
  User,
  Star,
  Plus,
} from 'lucide-react-native';

const ROLE_ICONS = {
  Crown,
  Zap,
  Shield,
  HeartHandshake,
  Sparkles,
  Target,
};

export function AddEditMemberModal({
  visible,
  onClose,
  onSave,
  initialData = null,
}) {
  const { activeTheme } = useTheme();
  const { lang } = useLanguage();

  const [name, setName] = useState('');
  const [role, setRole] = useState('striker');
  const [level, setLevel] = useState(8);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setRole(initialData.role || 'striker');
      setLevel(Number(initialData.level) || 8);
    } else {
      setName('');
      setRole('striker');
      setLevel(8);
    }
    setError('');
  }, [initialData, visible]);

  const currentRole = ROLES[role] || ROLES.striker;
  const RoleIcon = ROLE_ICONS[currentRole.icon] || Shield;

  const handleSubmit = () => {
    if (!name.trim()) {
      hapticsService.warning();
      setError(lang === 'ar' ? 'يرجى كتابة اسم اللاعب' : 'Player name is required');
      return;
    }
    hapticsService.success();
    audioService.playSuccess();
    onSave({
      name: name.trim(),
      role,
      level,
      notes: initialData?.notes || '',
    });
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={initialData ? (lang === 'ar' ? 'تعديل بيانات اللاعب' : 'Edit Player') : (lang === 'ar' ? 'إضافة لاعب للتشكيلة' : 'Add New Player')}
      subtitle={lang === 'ar' ? 'حدد الاسم والدور ومستوى المهارة' : 'Configure name, position, and skill level'}
    >
      <View style={styles.container}>
        {/* 1. Live Player Hologram Card Preview */}
        <View
          style={[
            styles.liveCardPreview,
            {
              backgroundColor: activeTheme.bgCard,
              borderColor: currentRole.color,
            },
          ]}
        >
          {/* Diamond OVR Gem */}
          <LinearGradient
            colors={[currentRole.color, currentRole.bg || '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ovrGem}
          >
            <Text style={styles.ovrNum}>{level}</Text>
            <Text style={styles.ovrSub}>★</Text>
          </LinearGradient>

          {/* Info Details */}
          <View style={styles.liveCardInfo}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={[styles.liveCardName, { color: activeTheme.textPrimary }]}>
                {name.trim() || (lang === 'ar' ? 'اسم اللاعب...' : 'Player Name...')}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: `${currentRole.color}25`, borderColor: currentRole.color }]}>
                <RoleIcon size={10} color={currentRole.color} />
                <Text style={[styles.roleBadgeText, { color: currentRole.color }]}>
                  {lang === 'ar' ? currentRole.nameAr : currentRole.nameEn}
                </Text>
              </View>
            </View>

            {/* Stars Arc */}
            <View style={styles.starsPreviewRow}>
              {Array.from({ length: level }).map((_, i) => (
                <Star key={i} size={11} color="#fbbf24" fill="#fbbf24" />
              ))}
            </View>
          </View>
        </View>

        {/* 2. Direct Name Input */}
        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldTitle, { color: activeTheme.textPrimary }]}>
            {lang === 'ar' ? 'اسم اللاعب *' : 'Player Name *'}
          </Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: activeTheme.inputBg,
                borderColor: error ? '#f87171' : activeTheme.borderSubtle,
              },
            ]}
          >
            <User size={16} color={activeTheme.textMuted} />
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError('');
              }}
              placeholder={lang === 'ar' ? 'اكتب اسم اللاعب هنا...' : 'Enter player name...'}
              placeholderTextColor={activeTheme.textMuted}
              style={[styles.textInput, { color: activeTheme.textPrimary }]}
              autoFocus={!initialData}
            />
            {name ? (
              <TouchableOpacity onPress={() => setName('')}>
                <Text style={{ color: activeTheme.textMuted, fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {error ? <Text style={styles.errorLabel}>{error}</Text> : null}
        </View>

        {/* 3. Simplified Tactical Roles Selector (Horizontal Ribbon) */}
        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldTitle, { color: activeTheme.textPrimary }]}>
            {lang === 'ar' ? 'المركز والدور التكتيكي' : 'Tactical Position'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleChipsRow}
          >
            {Object.keys(ROLES).map((roleKey) => {
              const r = ROLES[roleKey];
              const isSelected = role === roleKey;
              const Icon = ROLE_ICONS[r.icon] || Shield;

              return (
                <TouchableOpacity
                  key={roleKey}
                  activeOpacity={0.82}
                  onPress={() => {
                    hapticsService.impactLight();
                    setRole(roleKey);
                  }}
                  style={[
                    styles.roleCapsule,
                    {
                      backgroundColor: isSelected ? r.color : activeTheme.bgCard,
                      borderColor: isSelected ? '#ffffff' : activeTheme.borderSubtle,
                      borderWidth: isSelected ? 1.6 : 1,
                    },
                  ]}
                >
                  <Icon size={14} color={isSelected ? '#ffffff' : r.color} />
                  <Text
                    style={[
                      styles.roleCapsuleText,
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
        </View>

        {/* 4. Streamlined Rating Bar (1 to 10) */}
        <View style={styles.fieldBlock}>
          <View style={styles.fieldTitleRow}>
            <Text style={[styles.fieldTitle, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'مستوى المهارة' : 'Skill Level'}
            </Text>
            <Text style={styles.levelIndicatorBadge}>
              {level} / 10 ★
            </Text>
          </View>

          <View style={styles.levelButtonsGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = level === num;
              return (
                <TouchableOpacity
                  key={num}
                  activeOpacity={0.75}
                  onPress={() => {
                    hapticsService.impactLight();
                    setLevel(num);
                  }}
                  style={[
                    styles.levelBox,
                    {
                      backgroundColor: isSelected ? activeTheme.accentColor : activeTheme.bgCard,
                      borderColor: isSelected ? '#ffffff' : activeTheme.borderSubtle,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelBoxText,
                      {
                        color: isSelected ? '#ffffff' : activeTheme.textSecondary,
                        fontWeight: isSelected ? '900' : '600',
                      },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Action Submit Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={[styles.cancelBtn, { borderColor: activeTheme.borderSubtle }]}
          >
            <Text style={[styles.cancelBtnText, { color: activeTheme.textSecondary }]}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            style={[styles.saveBtn, { backgroundColor: activeTheme.accentColor }]}
          >
            <Plus size={16} color="#ffffff" />
            <Text style={styles.saveBtnText}>
              {initialData ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'إضافة اللاعب' : 'Add Player')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 16,
  },
  liveCardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    elevation: 3,
  },
  ovrGem: {
    width: 40,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovrNum: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  ovrSub: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  liveCardInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  liveCardName: {
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  starsPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  fieldBlock: {
    gap: 5,
  },
  fieldTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  fieldTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelIndicatorBadge: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '900',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  errorLabel: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '600',
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  roleCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  roleCapsuleText: {
    fontSize: 11,
  },
  levelButtonsGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  levelBox: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBoxText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '900',
  },
});
