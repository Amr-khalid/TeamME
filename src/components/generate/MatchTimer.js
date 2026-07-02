import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { hapticsService } from '../../services/hapticsService';
import { Clock, Play, Pause, RotateCcw, Plus, Minus, Edit3, Check } from 'lucide-react-native';

const PRESETS = [5, 10, 15, 20, 30, 45, 60];

export function MatchTimer() {
  const { activeTheme } = useTheme();
  const { lang, isRTL } = useLanguage();

  const [duration, setDuration] = useState(15 * 60); // Default 15 mins
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('15');
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            hapticsService.success();
            return 0;
          }
          if (prev <= 4) {
            hapticsService.impactLight();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleSetDuration = (minutes) => {
    setIsRunning(false);
    setIsCustomMode(false);
    const clamped = Math.max(1, Math.min(180, minutes));
    setDuration(clamped * 60);
    setTimeLeft(clamped * 60);
    setCustomInput(String(clamped));
    hapticsService.impactLight();
  };

  const handleAdjustMinutes = (delta) => {
    setIsRunning(false);
    const currentMins = Math.round(duration / 60);
    const newMins = Math.max(1, Math.min(180, currentMins + delta));
    setDuration(newMins * 60);
    setTimeLeft(newMins * 60);
    setCustomInput(String(newMins));
    hapticsService.impactLight();
  };

  const handleCustomSubmit = () => {
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      handleSetDuration(parsed);
      setIsCustomMode(false);
    }
  };

  const handleToggle = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
    }
    setIsRunning(!isRunning);
    hapticsService.impactMedium();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    hapticsService.impactLight();
  };

  const totalMinutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const durationMins = Math.round(duration / 60);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderSubtle,
        },
      ]}
    >
      {/* Header with Title & Custom Time Input Toggle */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Clock size={16} color={activeTheme.accentColor} />
          <Text style={[styles.title, { color: activeTheme.textPrimary }]}>
            {lang === 'ar' ? 'ساعة الماتش' : 'Match Timer'}
          </Text>
        </View>

        {/* Stepper & Custom Input Badge */}
        <View style={[styles.stepperContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleAdjustMinutes(-1)}
            disabled={durationMins <= 1}
            style={[
              styles.stepBtn,
              { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: activeTheme.borderSubtle },
            ]}
          >
            <Minus size={13} color={durationMins <= 1 ? activeTheme.textMuted : activeTheme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsCustomMode(!isCustomMode)}
            style={[
              styles.stepperBadge,
              {
                backgroundColor: isCustomMode ? activeTheme.accentColor : `${activeTheme.accentColor}20`,
                borderColor: isCustomMode ? '#ffffff' : activeTheme.borderSubtle,
              },
            ]}
          >
            <Text
              style={[
                styles.stepperBadgeText,
                { color: isCustomMode ? '#ffffff' : activeTheme.accentColor },
              ]}
            >
              {durationMins}m ✍️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleAdjustMinutes(1)}
            disabled={durationMins >= 180}
            style={[
              styles.stepBtn,
              { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: activeTheme.borderSubtle },
            ]}
          >
            <Plus size={13} color={durationMins >= 180 ? activeTheme.textMuted : activeTheme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Direct Custom Minute Number Input Box (When activated) */}
      {isCustomMode && (
        <View style={[styles.customInputRow, { backgroundColor: activeTheme.inputBg, borderColor: activeTheme.borderFocus }]}>
          <Text style={[styles.customInputLabel, { color: activeTheme.textSecondary }]}>
            {lang === 'ar' ? 'حدد الدقائق يدوياً:' : 'Enter Minutes:'}
          </Text>
          <TextInput
            value={customInput}
            onChangeText={(t) => setCustomInput(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={3}
            autoFocus
            onSubmitEditing={handleCustomSubmit}
            style={[styles.customTextInput, { color: activeTheme.textPrimary, borderColor: activeTheme.accentColor }]}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCustomSubmit}
            style={[styles.customApplyBtn, { backgroundColor: activeTheme.accentColor }]}
          >
            <Check size={14} color="#ffffff" />
            <Text style={styles.customApplyBtnText}>
              {lang === 'ar' ? 'تطبيق' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Horizontal Presets Ribbon */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.presetsScroll, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      >
        {PRESETS.map((m) => {
          const isSelected = durationMins === m && !isCustomMode;
          return (
            <TouchableOpacity
              key={m}
              activeOpacity={0.8}
              onPress={() => handleSetDuration(m)}
              style={[
                styles.presetBtn,
                {
                  backgroundColor: isSelected ? activeTheme.accentColor : 'rgba(255, 255, 255, 0.06)',
                  borderColor: isSelected ? '#ffffff' : activeTheme.borderSubtle,
                  borderWidth: isSelected ? 1.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  {
                    color: isSelected ? '#ffffff' : activeTheme.textSecondary,
                    fontWeight: isSelected ? '900' : '700',
                  },
                ]}
              >
                {m === 60 ? (lang === 'ar' ? 'ساعة (60m)' : '1 Hr (60m)') : `${m}m`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Countdown Digital Display */}
      <View
        style={[
          styles.displayBox,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderColor: activeTheme.borderSubtle,
          },
        ]}
      >
        <Text
          style={[
            styles.timeText,
            {
              color: timeLeft < 30 && timeLeft > 0 ? '#f87171' : activeTheme.textPrimary,
              textShadowColor: timeLeft < 30 ? 'rgba(239, 68, 68, 0.6)' : activeTheme.accentColor,
              textShadowRadius: 12,
            },
          ]}
        >
          {String(totalMinutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>

        {/* Progress Line */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
                backgroundColor: timeLeft < 30 ? '#ef4444' : activeTheme.accentColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Action Controls */}
      <View style={[styles.controlsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleToggle}
          style={styles.toggleBtnWrapper}
        >
          <LinearGradient
            colors={isRunning ? ['#ef4444', '#dc2626'] : activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.toggleBtnGradient}
          >
            {isRunning ? <Pause size={17} color="#ffffff" /> : <Play size={17} color="#ffffff" />}
            <Text style={styles.toggleBtnText}>
              {isRunning
                ? (lang === 'ar' ? 'إيقاف مؤقت' : 'Pause Timer')
                : (timeLeft === 0 ? (lang === 'ar' ? 'إعادة وتشغيل' : 'Restart Timer') : (lang === 'ar' ? 'بدء الوقت' : 'Start Timer'))}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleReset}
          style={[
            styles.resetBtn,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderColor: activeTheme.borderSubtle,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <RotateCcw size={15} color={activeTheme.textSecondary} />
          <Text style={[styles.resetText, { color: activeTheme.textSecondary }]}>
            {lang === 'ar' ? 'إعادة ضبط' : 'Reset'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
  },
  stepperContainer: {
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  stepperBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  customInputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  customTextInput: {
    width: 60,
    height: 34,
    borderWidth: 1.5,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  customApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  customApplyBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '900',
  },
  presetsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  presetBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetText: {
    fontSize: 11,
  },
  displayBox: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  timeText: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressBar: {
    height: '100%',
  },
  controlsRow: {
    gap: 8,
    marginTop: 2,
  },
  toggleBtnWrapper: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  toggleBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  resetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
