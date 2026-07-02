import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function Badge({
  children,
  variant = 'default', // default | gold | cyan | green | red
  size = 'md',
  style,
  textStyle,
}) {
  const { activeTheme } = useTheme();

  let color = activeTheme.accentColor;
  let bg = activeTheme.badgeBg;
  let border = activeTheme.borderSubtle;

  if (variant === 'gold') {
    color = '#fbbf24';
    bg = 'rgba(251, 191, 36, 0.15)';
    border = 'rgba(251, 191, 36, 0.4)';
  } else if (variant === 'cyan') {
    color = '#00f0ff';
    bg = 'rgba(0, 240, 255, 0.15)';
    border = 'rgba(0, 240, 255, 0.4)';
  } else if (variant === 'green') {
    color = '#10b981';
    bg = 'rgba(16, 185, 129, 0.15)';
    border = 'rgba(16, 185, 129, 0.4)';
  } else if (variant === 'red') {
    color = '#f43f5e';
    bg = 'rgba(244, 63, 94, 0.15)';
    border = 'rgba(244, 63, 94, 0.4)';
  }

  return (
    <View
      style={[
        styles.badge,
        {
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? 6 : 10,
          backgroundColor: bg,
          borderColor: border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize: size === 'sm' ? 10.5 : 12,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

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
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '800',
  },
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
