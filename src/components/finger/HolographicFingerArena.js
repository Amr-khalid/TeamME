import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { hapticsService } from '../../services/hapticsService';
import { Crown, Users, Sparkles, RefreshCw, Touchpad } from 'lucide-react-native';

const NODE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#e11d48', '#84cc16'];

export function HolographicFingerArena({
  mode = 'winners', // winners | pairs | teams
  winnersCount = 1,
  teamsCount = 2,
}) {
  const { activeTheme } = useTheme();
  const { t } = useLanguage();

  const [touches, setTouches] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [results, setResults] = useState(null); // { winners: [], pairs: [], teams: [] }

  const countdownTimer = useRef(null);

  // Clear when mode changes
  useEffect(() => {
    resetArena();
  }, [mode, winnersCount, teamsCount]);

  // Monitor touches for auto-countdown trigger
  useEffect(() => {
    if (results) return;

    if (touches.length >= 2) {
      if (countdown === null) {
        setCountdown(3);
        hapticsService.impactMedium();
      }
    } else {
      if (countdown !== null) {
        clearInterval(countdownTimer.current);
        setCountdown(null);
      }
    }
  }, [touches.length, results]);

  // Handle countdown interval
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownTimer.current = setTimeout(() => {
        hapticsService.impactLight();
        setCountdown((prev) => prev - 1);
      }, 800);
    } else if (countdown === 0) {
      finalizeDecision();
    }
    return () => clearTimeout(countdownTimer.current);
  }, [countdown]);

  const finalizeDecision = () => {
    hapticsService.success();
    setCountdown(null);

    const touchList = [...touches];
    if (touchList.length < 2) return;

    if (mode === 'winners') {
      const shuffled = [...touchList].sort(() => Math.random() - 0.5);
      const count = Math.min(winnersCount, touchList.length);
      const selectedWinners = shuffled.slice(0, count).map((t) => t.id);
      setResults({ winners: selectedWinners });
    } else if (mode === 'pairs') {
      const shuffled = [...touchList].sort(() => Math.random() - 0.5);
      const pairs = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
          pairs.push([shuffled[i], shuffled[i + 1]]);
        }
      }
      setResults({ pairs });
    } else if (mode === 'teams') {
      const shuffled = [...touchList].sort(() => Math.random() - 0.5);
      const teamMap = {};
      shuffled.forEach((touch, idx) => {
        const teamIdx = idx % teamsCount;
        teamMap[touch.id] = teamIdx;
      });
      setResults({ teams: teamMap });
    }
  };

  const resetArena = () => {
    setTouches([]);
    setCountdown(null);
    setResults(null);
    clearInterval(countdownTimer.current);
    hapticsService.impactLight();
  };

  // Simulated multi-finger generator for testing
  const simulateFingers = (count = 4) => {
    resetArena();
    const screenWidth = Dimensions.get('window').width;
    const simTouches = [];
    for (let i = 0; i < count; i++) {
      const x = 50 + Math.random() * (screenWidth - 100);
      const y = 80 + Math.random() * 220;
      simTouches.push({
        id: `sim_${i}`,
        x,
        y,
        color: NODE_COLORS[i % NODE_COLORS.length],
        label: i + 1,
      });
    }
    setTouches(simTouches);
  };

  // Touch handlers for screen
  const handleTouchStart = (evt) => {
    if (results) return;
    const nativeTouches = evt.nativeEvent.touches || [];
    const formatted = Array.from(nativeTouches).map((t, idx) => ({
      id: String(t.identifier || idx),
      x: t.locationX || t.pageX,
      y: t.locationY || t.pageY,
      color: NODE_COLORS[idx % NODE_COLORS.length],
      label: idx + 1,
    }));
    if (formatted.length > 0) {
      setTouches(formatted);
    }
  };

  const handleTouchMove = (evt) => {
    if (results) return;
    const nativeTouches = evt.nativeEvent.touches || [];
    const formatted = Array.from(nativeTouches).map((t, idx) => ({
      id: String(t.identifier || idx),
      x: t.locationX || t.pageX,
      y: t.locationY || t.pageY,
      color: NODE_COLORS[idx % NODE_COLORS.length],
      label: idx + 1,
    }));
    if (formatted.length > 0) {
      setTouches(formatted);
    }
  };

  const handleTouchEnd = (evt) => {
    if (results) return;
    const nativeTouches = evt.nativeEvent.touches || [];
    const formatted = Array.from(nativeTouches).map((t, idx) => ({
      id: String(t.identifier || idx),
      x: t.locationX || t.pageX,
      y: t.locationY || t.pageY,
      color: NODE_COLORS[idx % NODE_COLORS.length],
      label: idx + 1,
    }));
    setTouches(formatted);
  };

  return (
    <View style={styles.container}>
      {/* Interactive Arena Board */}
      <View
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={[
          styles.arenaBoard,
          {
            backgroundColor: 'rgba(5, 8, 20, 0.85)',
            borderColor: results ? activeTheme.accentColor : activeTheme.borderSubtle,
          },
        ]}
      >
        {/* Waiting Message if no fingers */}
        {touches.length === 0 && (
          <View style={styles.waitingOverlay}>
            <View
              style={[
                styles.pulseIcon,
                { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: activeTheme.borderSubtle },
              ]}
            >
              <Touchpad size={42} color={activeTheme.accentColor} />
            </View>
            <Text style={[styles.waitingTitle, { color: activeTheme.textPrimary }]}>
              {t.finger.waitingMessage}
            </Text>
            <Text style={[styles.waitingSubtitle, { color: activeTheme.textMuted }]}>
              {t.finger.waitingHint}
            </Text>
          </View>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={[styles.countdownText, { color: activeTheme.accentColor }]}>
              {countdown === 0 ? ' ' : countdown}
            </Text>
            <Text style={[styles.countdownLabel, { color: activeTheme.textSecondary }]}>
              {t.finger.countdown}
            </Text>
          </View>
        )}

        {/* SVG Laser Lines for Pairs mode */}
        {results?.pairs && (
          <Svg style={StyleSheet.absoluteFill}>
            {results.pairs.map((pair, idx) => (
              <Line
                key={idx}
                x1={pair[0].x}
                y1={pair[0].y}
                x2={pair[1].x}
                y2={pair[1].y}
                stroke={NODE_COLORS[idx % NODE_COLORS.length]}
                strokeWidth="4"
                strokeDasharray="6, 4"
              />
            ))}
          </Svg>
        )}

        {/* Holographic Nodes for each Touch Point */}
        {touches.map((touch) => {
          const isWinner = results?.winners?.includes(touch.id);
          const teamIdx = results?.teams ? results.teams[touch.id] : null;
          const nodeColor = teamIdx !== null && teamIdx !== undefined
            ? NODE_COLORS[teamIdx % NODE_COLORS.length]
            : touch.color;

          return (
            <View
              key={touch.id}
              style={[
                styles.touchNode,
                {
                  left: touch.x - 36,
                  top: touch.y - 36,
                  borderColor: isWinner ? '#fbbf24' : nodeColor,
                  shadowColor: isWinner ? '#fbbf24' : nodeColor,
                  shadowOpacity: 0.8,
                  shadowRadius: 16,
                },
              ]}
            >
              {isWinner && (
                <View style={styles.crownTag}>
                  <Crown size={18} color="#fbbf24" />
                </View>
              )}

              <View
                style={[
                  styles.nodeCore,
                  {
                    backgroundColor: isWinner ? '#fbbf24' : nodeColor,
                  },
                ]}
              >
                <Text style={styles.nodeText}>
                  {teamIdx !== null && teamIdx !== undefined
                    ? `${t.finger.teamBadge} ${teamIdx + 1}`
                    : touch.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Simulator / Reset Control Buttons */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => simulateFingers(4)}
          style={[styles.simBtn, { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: activeTheme.borderSubtle }]}
        >
          <Sparkles size={16} color={activeTheme.accentColor} />
          <Text style={[styles.simText, { color: activeTheme.textPrimary }]}>
            {t.finger.simulateBtn}
          </Text>
        </TouchableOpacity>

        {touches.length > 0 && (
          <TouchableOpacity
            onPress={resetArena}
            style={[styles.resetBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' }]}
          >
            <RefreshCw size={15} color="#f87171" />
            <Text style={styles.resetText}>{t.finger.clearTouches}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  arenaBoard: {
    height: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  pulseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  waitingTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  waitingSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  countdownOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: '900',
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  touchNode: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  nodeCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  crownTag: {
    position: 'absolute',
    top: -18,
    alignSelf: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  simText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  resetText: {
    color: '#f87171',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
