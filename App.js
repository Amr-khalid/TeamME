import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { AppDataProvider, useAppData } from './src/context/AppDataContext';

import { SmallTopNavbar } from './src/components/layout/SmallTopNavbar';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';

import { HomeScreen } from './src/screens/HomeScreen';
import { MembersScreen } from './src/screens/MembersScreen';
import { GenerateScreen } from './src/screens/GenerateScreen';
import { TournamentScreen } from './src/screens/TournamentScreen';
import { FingerChooserScreen } from './src/screens/FingerChooserScreen';
import { OracleScreen } from './src/screens/OracleScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

function MainApp() {
  const { activeTheme, themeId } = useTheme();
  const { isRTL } = useLanguage();
  const { activeTab } = useAppData();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'members':
        return <MembersScreen />;
      case 'generate':
        return <GenerateScreen />;
      case 'tournament':
        return <TournamentScreen />;
      case 'finger':
        return <FingerChooserScreen />;
      case 'oracle':
        return <OracleScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.fullRoot, { backgroundColor: activeTheme.bgBase }]}>
      <StatusBar hidden={true} />
      <SmallTopNavbar />
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>
      <BottomTabNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppDataProvider>
            <MainApp />
          </AppDataProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fullRoot: {
    flex: 1,
    paddingTop: 0,
    margin: 0,
  },
  screenContainer: {
    flex: 1,
  },
});
