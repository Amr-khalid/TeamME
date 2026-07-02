import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioService } from './audioService';

let hapticsEnabled = true;

// Preload settings safely
(async () => {
  try {
    const saved = await AsyncStorage.getItem('tf_haptics');
    if (saved !== null) {
      hapticsEnabled = saved === 'true';
    }
  } catch (e) {}
})();

export const hapticsService = {
  isEnabled: () => hapticsEnabled,

  toggle: async () => {
    hapticsEnabled = !hapticsEnabled;
    try {
      await AsyncStorage.setItem('tf_haptics', String(hapticsEnabled));
    } catch (e) {}
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
    return hapticsEnabled;
  },

  selection: () => {
    if (hapticsEnabled) {
      try {
        Haptics.selectionAsync();
      } catch (e) {}
    }
    audioService.playTab();
  },

  impactLight: () => {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    audioService.playClick();
  },

  impactMedium: () => {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
    audioService.playClick();
  },

  impactHeavy: () => {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (e) {}
    }
    audioService.playCharge();
  },

  success: () => {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
    audioService.playSuccess();
  },

  warning: () => {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
    }
  },

  error: () => {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {}
    }
    audioService.playDelete();
  },
};
