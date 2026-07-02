import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlowButton } from '../common/GlowButton';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { hapticsService } from '../../services/hapticsService';
import { Sparkles, Eye, Zap, RotateCcw } from 'lucide-react-native';

export function OracleDecisionCard({
  options = [],
  onDecisionMade,
}) {
  const { activeTheme } = useTheme();
  const { t } = useLanguage();

  const [stage, setStage] = useState('idle'); // idle | analyzing | scanning | decided
  const [decision, setDecision] = useState(null);

  const startOracleProcess = () => {
    if (!options || options.length < 2) {
      hapticsService.warning();
      return;
    }

    setDecision(null);
    setStage('analyzing');
    hapticsService.impactLight();

    setTimeout(() => {
      setStage('scanning');
      hapticsService.impactMedium();

      setTimeout(() => {
        const picked = options[Math.floor(Math.random() * options.length)];
        setDecision(picked);
        setStage('decided');
        hapticsService.success();
        if (onDecisionMade) onDecisionMade(picked);
      }, 1000);
    }, 1000);
  };

  const handleReset = () => {
    setStage('idle');
    setDecision(null);
    hapticsService.impactLight();
  };

  return (
    <View style={styles.container}>
      {/* Main Oracle Action / Scanning Status Box */}
      {stage === 'idle' && (
        <GlowButton
          variant="primary"
          title={t.oracle.ctaDecide}
          icon={Eye}
          size="lg"
          onPress={startOracleProcess}
          style={styles.mainBtn}
        />
      )}

      {(stage === 'analyzing' || stage === 'scanning') && (
        <View
          style={[
            styles.scanningCard,
            {
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.borderFocus,
            },
          ]}
        >
          <Sparkles size={28} color={activeTheme.accentColor} style={styles.spinIcon} />
          <Text style={[styles.stageText, { color: activeTheme.textPrimary }]}>
            {stage === 'analyzing' ? t.oracle.step1 : t.oracle.step2}
          </Text>
          <View style={styles.scanBarTrack}>
            <LinearGradient
              colors={activeTheme.gradientColors || ['#7c3aed', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.scanBar,
                { width: stage === 'analyzing' ? '50%' : '90%' },
              ]}
            />
          </View>
        </View>
      )}

      {/* Final Decision Dramatic Card */}
      {stage === 'decided' && decision && (
        <View style={styles.decidedContainer}>
          <LinearGradient
            colors={activeTheme.cardGradient || ['rgba(35, 25, 75, 0.9)', 'rgba(15, 17, 41, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.decisionCard,
              {
                borderColor: activeTheme.borderFocus,
                shadowColor: activeTheme.accentColor,
                shadowOpacity: 0.6,
                shadowRadius: 20,
              },
            ]}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: `${activeTheme.accentColor}25` },
              ]}
            >
              <Zap size={32} color={activeTheme.accentColor} />
            </View>

            <Text style={[styles.decisionHeading, { color: activeTheme.textSecondary }]}>
              {t.oracle.decisionTitle}
            </Text>

            <Text style={[styles.decisionText, { color: '#ffffff' }]}>
              {decision}
            </Text>

            <GlowButton
              variant="secondary"
              title={t.oracle.decideAgain}
              icon={RotateCcw}
              onPress={handleReset}
              style={{ marginTop: 12 }}
            />
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mainBtn: {
    width: '100%',
  },
  scanningCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  spinIcon: {
    marginBottom: 4,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  scanBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginTop: 6,
  },
  scanBar: {
    height: '100%',
    borderRadius: 3,
  },
  decidedContainer: {
    width: '100%',
  },
  decisionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 10,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  decisionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  decisionText: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 4,
    letterSpacing: 0.5,
  },
});
