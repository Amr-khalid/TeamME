import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { hapticsService } from '../../services/hapticsService';

export function SkillSlider({
  value = 7,
  onChange,
  label = 'مستوى المهارة',
}) {
  const { activeTheme } = useTheme();

  const handleSelectLevel = (lvl) => {
    hapticsService.impactLight();
    onChange(lvl);
  };

  const getTierBadge = (lvl) => {
    if (lvl >= 9) return '  أسطورة (Legend)';
    if (lvl >= 8) return '🔥 محترف (Master)';
    if (lvl >= 6) return '⭐ متمرس (Pro)';
    if (lvl >= 4) return '🎯 جيد (Solid)';
    return '🌱 مستجد (Rookie)';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: activeTheme.textSecondary }]}>{label}</Text>
        <Text style={[styles.score, { color: activeTheme.accentColor }]}>
          {value} <Text style={{ fontSize: 11, color: activeTheme.textMuted }}>/ 10</Text>
        </Text>
      </View>

      {/* Number Selectors 1-10 */}
      <View style={styles.numbersGrid}>
        {Array.from({ length: 10 }).map((_, i) => {
          const num = i + 1;
          const isSelected = num === value;
          const isBelow = num <= value;

          return (
            <TouchableOpacity
              key={num}
              activeOpacity={0.7}
              onPress={() => handleSelectLevel(num)}
              style={[
                styles.numberBox,
                {
                  backgroundColor: isSelected
                    ? activeTheme.accentColor
                    : isBelow
                    ? `${activeTheme.accentColor}25`
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: isSelected
                    ? activeTheme.borderFocus
                    : isBelow
                    ? `${activeTheme.accentColor}50`
                    : activeTheme.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.numberText,
                  {
                    color: isSelected ? '#ffffff' : isBelow ? activeTheme.textPrimary : activeTheme.textMuted,
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

      {/* Tier Label + Star Gauge */}
      <View style={styles.footer}>
        <Text style={[styles.tier, { color: activeTheme.accentSecondary }]}>
          {getTierBadge(value)}
        </Text>
        <View style={styles.starsRow}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Text
              key={i}
              style={{
                fontSize: 12,
                color: i < value ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)',
              }}
            >
              ★
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  score: {
    fontSize: 16,
    fontWeight: '900',
  },
  numbersGrid: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'space-between',
  },
  numberBox: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  tier: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1.5,
  },
});
