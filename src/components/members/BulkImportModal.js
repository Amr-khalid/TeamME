import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalSheet } from '../common/ModalSheet';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { hapticsService } from '../../services/hapticsService';
import {
  Users,
  Shuffle,
  Shield,
  Zap,
  Check,
} from 'lucide-react-native';

export function BulkImportModal({
  visible,
  onClose,
  onImport,
}) {
  const { activeTheme } = useTheme();
  const { lang } = useLanguage();

  const [text, setText] = useState('');
  const [importMode, setImportMode] = useState('unified'); // 'unified' | 'random'
  const [error, setError] = useState('');

  // Calculate detected names count
  const detectedCount = useMemo(() => {
    if (!text || !text.trim()) return 0;
    return text.split(/[\n,،]+/).map((s) => s.trim()).filter(Boolean).length;
  }, [text]);

  const handleImport = () => {
    if (detectedCount === 0) {
      hapticsService.warning();
      setError(lang === 'ar' ? 'يرجى لصق أسماء اللاعبين أولاً' : 'Please paste player names first');
      return;
    }

    const count = onImport(text, {
      mode: importMode,
    });

    if (count > 0) {
      setText('');
      setError('');
      onClose();
    }
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={lang === 'ar' ? 'استيراد جماعي للاعبين' : 'Bulk Player Import'}
      subtitle={lang === 'ar' ? 'الصق قائمة أسماء وسيقوم النظام بإضافتهم فوراً' : 'Paste names list to import instantly'}
    >
      <View style={styles.container}>
        {/* 1. Mode Selector (Unified 7-stars vs Smart Random) */}
        <View style={styles.modeSelectorCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticsService.impactLight();
              setImportMode('unified');
            }}
            style={[
              styles.modeTab,
              importMode === 'unified'
                ? { backgroundColor: activeTheme.accentColor, borderColor: activeTheme.borderFocus }
                : { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: activeTheme.borderSubtle },
            ]}
          >
            <Shield size={18} color={importMode === 'unified' ? '#ffffff' : activeTheme.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.modeTabTitle,
                  { color: importMode === 'unified' ? '#ffffff' : activeTheme.textPrimary },
                ]}
              >
                {lang === 'ar' ? 'تقييم موحد (7 نجوم)' : 'Unified Rating (7 Stars)'}
              </Text>
              <Text
                style={[
                  styles.modeTabSub,
                  { color: importMode === 'unified' ? 'rgba(255, 255, 255, 0.85)' : activeTheme.textMuted },
                ]}
              >
                {lang === 'ar' ? 'تقييم افتراضي 7 نجوم لجميع اللاعبين' : 'Default 7-star rating for all'}
              </Text>
            </View>
            {importMode === 'unified' && (
              <View style={styles.modeCheckCircle}>
                <Check size={12} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticsService.impactLight();
              setImportMode('random');
            }}
            style={[
              styles.modeTab,
              importMode === 'random'
                ? { backgroundColor: activeTheme.accentColor, borderColor: activeTheme.borderFocus }
                : { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: activeTheme.borderSubtle },
            ]}
          >
            <Shuffle size={18} color={importMode === 'random' ? '#ffffff' : activeTheme.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.modeTabTitle,
                  { color: importMode === 'random' ? '#ffffff' : activeTheme.textPrimary },
                ]}
              >
                {lang === 'ar' ? 'توزيع عشوائي ذكي 🎲' : 'Smart Randomize 🎲'}
              </Text>
              <Text
                style={[
                  styles.modeTabSub,
                  { color: importMode === 'random' ? 'rgba(255, 255, 255, 0.85)' : activeTheme.textMuted },
                ]}
              >
                {lang === 'ar' ? 'توزيع تلقائي للمراكز والمهارة (6 - 10)' : 'Auto-randomize roles & ratings (6-10)'}
              </Text>
            </View>
            {importMode === 'random' && (
              <View style={styles.modeCheckCircle}>
                <Check size={12} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Text Area for Pasting Names */}
        <View style={styles.subField}>
          <View style={styles.labelWithRating}>
            <Text style={[styles.fieldLabel, { color: activeTheme.textPrimary }]}>
              {lang === 'ar' ? 'قائمة الأسماء (سطر لكل اسم أو فواصل)' : 'Names List (Line by line or commas)'}
            </Text>
            {detectedCount > 0 && (
              <View style={[styles.detectedBadge, { backgroundColor: `${activeTheme.accentColor}25` }]}>
                <Users size={12} color={activeTheme.accentColor} />
                <Text style={[styles.detectedBadgeText, { color: activeTheme.accentColor }]}>
                  {detectedCount} {lang === 'ar' ? 'لاعبين مكتشفين' : 'Players'}
                </Text>
              </View>
            )}
          </View>

          <TextInput
            multiline
            numberOfLines={7}
            value={text}
            onChangeText={(txt) => {
              setText(txt);
              if (error) setError('');
            }}
            placeholder={
              lang === 'ar'
                ? 'الصق الأسماء هنا:\nكريم الساحر\nطارق الهداف\nأحمد القائد\nيوسف الصخرة...'
                : 'Paste names here:\nAlex\nDavid\nLeo\nCristiano...'
            }
            placeholderTextColor={activeTheme.textMuted}
            style={[
              styles.textarea,
              {
                backgroundColor: activeTheme.inputBg,
                borderColor: error ? '#f87171' : activeTheme.borderSubtle,
                color: activeTheme.textPrimary,
              },
            ]}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* 3. Action Buttons */}
        <View style={styles.buttonsRow}>
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
            onPress={handleImport}
            style={styles.importBtnTouchable}
          >
            <LinearGradient
              colors={activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.importBtnGradient}
            >
              <Zap size={17} color="#ffffff" />
              <Text style={styles.importBtnText}>
                {lang === 'ar'
                  ? `استيراد (${detectedCount}) لاعباً  `
                  : `Import (${detectedCount}) Players  `}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  modeSelectorCard: {
    gap: 8,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  modeTabTitle: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  modeTabSub: {
    fontSize: 11,
    marginTop: 1,
  },
  modeCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  labelWithRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  detectedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    height: 140,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 22,
  },
  errorText: {
    color: '#f87171',
    fontSize: 11.5,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    paddingBottom: 6,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  importBtnTouchable: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  importBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
  },
  importBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '900',
  },
});
