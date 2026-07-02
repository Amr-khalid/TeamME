import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { hapticsService } from '../../services/hapticsService';

export function GlowButton({
  title,
  children,
  onPress,
  variant = 'primary', // primary | secondary | danger | gold | ghost
  size = 'md', // sm | md | lg
  icon: Icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const { activeTheme } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    hapticsService.impactLight();
    if (onPress) onPress();
  };

  const getPadding = () => {
    if (size === 'sm') return { paddingVertical: 8, paddingHorizontal: 12 };
    if (size === 'lg') return { paddingVertical: 15, paddingHorizontal: 24 };
    return { paddingVertical: 12, paddingHorizontal: 18 };
  };

  const getFontSize = () => {
    if (size === 'sm') return 12.5;
    if (size === 'lg') return 16;
    return 14.5;
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.container,
          {
            opacity: disabled ? 0.5 : 1,
            shadowColor: activeTheme.accentColor,
            shadowOpacity: 0.45,
            shadowRadius: 10,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, getPadding()]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View style={styles.row}>
              {Icon && <Icon size={size === 'sm' ? 14 : 18} color="#ffffff" style={styles.icon} />}
              <Text style={[styles.primaryText, { fontSize: getFontSize() }, textStyle]}>
                {title || children}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'gold') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.container,
          {
            opacity: disabled ? 0.5 : 1,
            shadowColor: '#f59e0b',
            shadowOpacity: 0.45,
            shadowRadius: 10,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, getPadding()]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <View style={styles.row}>
              {Icon && <Icon size={size === 'sm' ? 14 : 18} color="#000000" style={styles.icon} />}
              <Text style={[styles.goldText, { fontSize: getFontSize() }, textStyle]}>
                {title || children}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary / Ghost / Danger
  let bg = 'rgba(255, 255, 255, 0.08)';
  let borderColor = activeTheme.borderSubtle;
  let textColor = activeTheme.textPrimary;

  if (variant === 'danger') {
    bg = 'rgba(239, 68, 68, 0.15)';
    borderColor = 'rgba(239, 68, 68, 0.4)';
    textColor = '#f87171';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    borderColor = 'transparent';
    textColor = activeTheme.textSecondary;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.simpleButton,
        {
          backgroundColor: bg,
          borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        getPadding(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.row}>
          {Icon && <Icon size={size === 'sm' ? 14 : 18} color={textColor} style={styles.icon} />}
          <Text style={[styles.secondaryText, { color: textColor, fontSize: getFontSize() }, textStyle]}>
            {title || children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  simpleButton: {
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 2,
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
  },
  goldText: {
    color: '#0c0a09',
    fontWeight: '900',
    textAlign: 'center',
  },
  secondaryText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
