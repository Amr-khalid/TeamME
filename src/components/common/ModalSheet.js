import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { hapticsService } from '../../services/hapticsService';

const { height: SCREEN_H } = Dimensions.get('window');

export function ModalSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}) {
  const { activeTheme } = useTheme();
  const [keyboardSpace, setKeyboardSpace] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardSpace(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardSpace(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleClose = () => {
    hapticsService.impactLight();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        {/* Click outside to dismiss backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: activeTheme.bgSurface || '#0b0f19',
              borderColor: activeTheme.borderFocus || 'rgba(255, 255, 255, 0.16)',
              marginBottom: keyboardSpace > 0 ? (Platform.OS === 'ios' ? keyboardSpace : keyboardSpace * 0.35) : 0,
              maxHeight: keyboardSpace > 0 ? SCREEN_H * 0.78 : SCREEN_H * 0.92,
            },
          ]}
        >
          {/* Top 3D Specular Highlight Line */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.topHighlight}
            pointerEvents="none"
          />

          {/* Drag Handle Bar */}
          <View
            style={[
              styles.handleBar,
              { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
            ]}
          />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: activeTheme.textPrimary }]}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: activeTheme.textSecondary }]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleClose}
              style={[
                styles.closeBtn,
                { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: activeTheme.borderSubtle },
              ]}
            >
              <Text style={[styles.closeText, { color: activeTheme.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={true}
            bounces={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
    justifyContent: 'flex-end',
    zIndex: 99999,
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingHorizontal: 16,
    elevation: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 17.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 28,
    flexGrow: 1,
  },
});
