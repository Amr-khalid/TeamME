import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  style,
}) {
  const { activeTheme } = useTheme();
  const accent = color || activeTheme.accentColor;

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderSubtle,
        },
        style,
      ]}
    >
      <View style={styles.statHeader}>
        <Text style={[styles.statTitle, { color: activeTheme.textMuted }]}>{title}</Text>
        {Icon && (
          <View style={[styles.iconBox, { backgroundColor: `${accent}20` }]}>
            <Icon size={16} color={accent} />
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: activeTheme.textPrimary }]}>{value}</Text>
      {subtitle ? (
        <Text style={[styles.statSubtitle, { color: activeTheme.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statTitle: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  iconBox: {
    padding: 6,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statSubtitle: {
    fontSize: 10.5,
    marginTop: 2,
  },
});
