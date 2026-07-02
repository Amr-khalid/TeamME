import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export function GlassCard({
  children,
  style,
  interactive = false,
  onPress,
  glow = false,
  gradient = false,
  glowColor,
}) {
  const { activeTheme } = useTheme();

  const ContainerComponent = interactive ? TouchableOpacity : View;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: activeTheme.bgCard,
      borderColor: glow ? activeTheme.borderFocus : activeTheme.borderSubtle,
      shadowColor: glowColor || (glow ? activeTheme.accentColor : '#000000'),
      shadowOpacity: glow ? 0.45 : 0.2,
      shadowRadius: glow ? 12 : 6,
    },
    style,
  ];

  if (gradient) {
    return (
      <ContainerComponent
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.overflowHidden, style]}
      >
        <LinearGradient
          colors={activeTheme.cardGradient || ['rgba(35, 25, 75, 0.7)', 'rgba(15, 17, 41, 0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            {
              borderColor: glow ? activeTheme.borderFocus : activeTheme.borderSubtle,
            },
          ]}
        >
          {children}
        </LinearGradient>
      </ContainerComponent>
    );
  }

  return (
    <ContainerComponent
      activeOpacity={0.85}
      onPress={onPress}
      style={cardStyle}
    >
      {children}
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  overflowHidden: {
    borderRadius: 18,
    overflow: 'hidden',
  },
});
