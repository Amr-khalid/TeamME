import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

let soundEnabled = true;
let isAudioModeSet = false;
let audioCtx = null;

// Preload settings safely
(async () => {
  try {
    const saved = await AsyncStorage.getItem('tf_sound');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  } catch (e) {}
})();

// Helper to generate in-memory WAV Base64 Sound Effects
function generateWavDataUri(sampleRate, durationMs, generatorFn) {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2; // 16-bit mono
  const fileSize = 44 + dataSize;
  
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // Write WAV RIFF Header
  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM Samples
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.max(-1, Math.min(1, generatorFn(i, numSamples, sampleRate)));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(44 + i * 2, intSample, true);
  }

  // Base64 encoding
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(binary, 'binary').toString('base64');

  return `data:audio/wav;base64,${base64}`;
}

// 1. Crisp UI Button Click (High definition)
const CLICK_URI = generateWavDataUri(22050, 45, (i, total, rate) => {
  const t = i / rate;
  const decay = Math.exp(-t * 80);
  return (Math.sin(2 * Math.PI * 1200 * t) + 0.5 * Math.sin(2 * Math.PI * 2400 * t)) * decay * 0.5;
});

// 2. Soft Navigation / Tab Switch
const TAB_URI = generateWavDataUri(22050, 35, (i, total, rate) => {
  const t = i / rate;
  const decay = Math.exp(-t * 110);
  return Math.sin(2 * Math.PI * 1500 * t) * decay * 0.4;
});

// 3. Victory / Generation Success Chime
const SUCCESS_URI = generateWavDataUri(22050, 300, (i, total, rate) => {
  const t = i / rate;
  const decay = Math.exp(-t * 8);
  const f = t < 0.09 ? 659.25 : t < 0.18 ? 830.61 : 1046.5; // E5 -> G#5 -> C6
  return (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * decay * 0.45;
});

// 4. Grand Champion Trophy Fanfare
const TROPHY_URI = generateWavDataUri(22050, 500, (i, total, rate) => {
  const t = i / rate;
  const decay = Math.exp(-t * 5);
  const f = t < 0.12 ? 523.25 : t < 0.24 ? 659.25 : t < 0.36 ? 783.99 : 1046.5; // C5 -> E5 -> G5 -> C6
  return (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 1.5 * t)) * decay * 0.5;
});

// 5. Charge / Power Sweep
const CHARGE_URI = generateWavDataUri(22050, 320, (i, total, rate) => {
  const t = i / rate;
  const f = 250 + (t / 0.32) * 1100;
  const decay = Math.sin((i / total) * Math.PI);
  return Math.sin(2 * Math.PI * f * t) * decay * 0.4;
});

// 6. Delete / Remove Thump
const DELETE_URI = generateWavDataUri(22050, 60, (i, total, rate) => {
  const t = i / rate;
  const decay = Math.exp(-t * 60);
  return Math.sin(2 * Math.PI * 180 * t) * decay * 0.5;
});

// 7. Fortune Wheel Rapid Tick
const TICK_URI = generateWavDataUri(22050, 22, (i, total, rate) => {
  const t = i / rate;
  const decay = Math.exp(-t * 160);
  return (Math.sin(2 * Math.PI * 1900 * t) + 0.4 * Math.sin(2 * Math.PI * 3800 * t)) * decay * 0.35;
});

// Web Audio API Synthesizer (Fallback for Web)
function getWebAudioContext() {
  if (typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
  }
  return null;
}

// Master Native Sound Dispatcher
async function playNativeSound(uri, volume = 0.6) {
  if (!soundEnabled) return;
  
  // 1. Try Native Mobile Sound with expo-audio
  try {
    if (!isAudioModeSet) {
      setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      }).catch(() => {});
      isAudioModeSet = true;
    }

    const player = createAudioPlayer(uri);
    player.volume = volume;
    player.play();
    return;
  } catch (e) {}

  // 2. Web Audio API Fallback
  try {
    const ctx = getWebAudioContext();
    if (ctx) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {}
}

export const audioService = {
  isEnabled: () => soundEnabled,

  toggle: async () => {
    soundEnabled = !soundEnabled;
    try {
      await AsyncStorage.setItem('tf_sound', String(soundEnabled));
    } catch (e) {}
    if (soundEnabled) {
      audioService.playClick();
    }
    return soundEnabled;
  },

  playClick: () => playNativeSound(CLICK_URI, 0.55),
  playTab: () => playNativeSound(TAB_URI, 0.45),
  playSuccess: () => playNativeSound(SUCCESS_URI, 0.65),
  playTrophy: () => playNativeSound(TROPHY_URI, 0.75),
  playCharge: () => playNativeSound(CHARGE_URI, 0.55),
  playDelete: () => playNativeSound(DELETE_URI, 0.5),
  playTick: () => playNativeSound(TICK_URI, 0.4),
};
