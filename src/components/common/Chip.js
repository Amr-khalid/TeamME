import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { hapticsService } from '../../services/hapticsService';

export function Chip({
  label,
  icon: Icon,
  active = false,
  onPress,
  onDelete,
  color,
  size = 'md',
  style,
}) {
  const { activeTheme } = useTheme();

  const handlePress = () => {
    if (onPress) {
      hapticsService.selection();
      onPress();
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      activeOpacity={0.75}
      onPress={handlePress}
      style={[
        styles.chip,
        {
          paddingVertical: size === 'sm' ? 4 : 6,
          paddingHorizontal: size === 'sm' ? 8 : 12,
          backgroundColor: active
            ? activeTheme.accentColor
            : color
            ? `${color}20`
            : 'rgba(255, 255, 255, 0.07)',
          borderColor: active
            ? activeTheme.borderFocus
            : color
            ? `${color}50`
            : activeTheme.borderSubtle,
        },
        style,
      ]}
    >
      {Icon && (
        <Icon
          size={size === 'sm' ? 12 : 14}
          color={active ? '#ffffff' : color || activeTheme.textSecondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            fontSize: size === 'sm' ? 11 : 12.5,
            color: active ? '#ffffff' : color || activeTheme.textSecondary,
            fontWeight: active ? '800' : '600',
          },
        ]}
      >
        {label}
      </Text>
      {onDelete && (
        <TouchableOpacity
          onPress={() => {
            hapticsService.impactLight();
            onDelete();
          }}
          style={styles.deleteBtn}
        >
          <Text style={[styles.deleteText, { color: active ? '#ffffff' : activeTheme.textMuted }]}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    gap: 5,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    textAlign: 'center',
  },
  deleteBtn: {
    marginLeft: 4,
    paddingHorizontal: 2,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
