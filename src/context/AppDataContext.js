import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateTeamsByMode, computeTeamStats } from '../services/generatorEngine';
import { hapticsService } from '../services/hapticsService';

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  // Start with 100% clean empty state (No mock/default dummy data)
  const [members, setMembers] = useState([]);
  const [currentTeams, setCurrentTeams] = useState([]);
  const [history, setHistory] = useState([]);
  const [sessionConfig, setSessionConfig] = useState({
    numTeams: 2,
    algorithm: 'balanced',
    allowSwap: false,
    showTimer: false,
    showSound: true,
    showScoreboard: false,
    showStats: true,
    autoConfetti: true,
  });

  const [activeTab, setActiveTab] = useState('home');
  const [swapSelection, setSwapSelection] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [champion, setChampion] = useState(null);

  // Load from AsyncStorage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [savedMembers, savedTeams, savedHist, savedTour] = await Promise.all([
          AsyncStorage.getItem('tf_members'),
          AsyncStorage.getItem('tf_current_teams'),
          AsyncStorage.getItem('tf_history'),
          AsyncStorage.getItem('tf_tournament'),
        ]);

        if (savedMembers) setMembers(JSON.parse(savedMembers));
        if (savedTeams) setCurrentTeams(JSON.parse(savedTeams));
        if (savedHist) setHistory(JSON.parse(savedHist));
        if (savedTour) setTournament(JSON.parse(savedTour));
      } catch (e) {
        console.warn('Error loading storage', e);
      }
    }
    loadData();
  }, []);

  // Save to AsyncStorage on change
  useEffect(() => {
    AsyncStorage.setItem('tf_members', JSON.stringify(members)).catch(() => {});
  }, [members]);

  useEffect(() => {
    AsyncStorage.setItem('tf_current_teams', JSON.stringify(currentTeams)).catch(() => {});
  }, [currentTeams]);

  useEffect(() => {
    AsyncStorage.setItem('tf_history', JSON.stringify(history)).catch(() => {});
  }, [history]);

  useEffect(() => {
    if (tournament) {
      AsyncStorage.setItem('tf_tournament', JSON.stringify(tournament)).catch(() => {});
    } else {
      AsyncStorage.removeItem('tf_tournament').catch(() => {});
    }
  }, [tournament]);

  // Member CRUD
  const addMember = (memberData) => {
    const newMember = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: memberData.name.trim(),
      role: memberData.role || 'striker',
      level: Number(memberData.level) || 7,
      notes: memberData.notes || '',
    };
    setMembers((prev) => [newMember, ...prev]);
    hapticsService.impactLight();
    return newMember;
  };

  const updateMember = (id, updatedData) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m))
    );
    hapticsService.impactLight();
  };

  const deleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    hapticsService.impactMedium();
  };

  const bulkImportMembers = (text, options = {}) => {
    if (!text || !text.trim()) return 0;
    const lines = text.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);
    const newMembers = lines.map((name) => ({
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      role: options.defaultRole || 'striker',
      level: options.defaultLevel || 7,
      notes: '',
    }));

    setMembers((prev) => [...newMembers, ...prev]);
    hapticsService.success();
    return newMembers.length;
  };

  // Team Generation
  const generateTeams = (overrides = {}) => {
    const config = { ...sessionConfig, ...overrides };
    if (!members || members.length < 2) return [];

    const generated = generateTeamsByMode(
      members,
      config.numTeams,
      config.algorithm
    );

    setCurrentTeams(generated);
    setSwapSelection(null);
    hapticsService.success();
    return generated;
  };

  // Swap Players between teams
  const handlePlayerSwap = (teamId, member) => {
    if (!swapSelection) {
      setSwapSelection({ teamId, member });
      hapticsService.selection();
      return;
    }

    if (swapSelection.teamId === teamId && swapSelection.member.id === member.id) {
      setSwapSelection(null);
      hapticsService.impactLight();
      return;
    }

    setCurrentTeams((prev) => {
      const updated = prev.map((t) => {
        if (t.id === swapSelection.teamId) {
          const newMembers = t.members.map((m) =>
            m.id === swapSelection.member.id ? member : m
          );
          return {
            ...t,
            members: newMembers,
            stats: computeTeamStats(newMembers),
          };
        }
        if (t.id === teamId) {
          const newMembers = t.members.map((m) =>
            m.id === member.id ? swapSelection.member : m
          );
          return {
            ...t,
            members: newMembers,
            stats: computeTeamStats(newMembers),
          };
        }
        return t;
      });
      return updated;
    });

    setSwapSelection(null);
    hapticsService.success();
  };

  // Score Tracking
  const updateTeamScore = (teamId, delta) => {
    setCurrentTeams((prev) => {
      return prev.map((t) => {
        if (t.id === teamId) {
          const newScore = Math.max(0, (t.score || 0) + delta);
          return { ...t, score: newScore };
        }
        return t;
      });
    });
    hapticsService.impactLight();
  };

  const resetMatchScores = () => {
    setCurrentTeams((prev) =>
      prev.map((t) => ({ ...t, score: 0 }))
    );
    hapticsService.impactMedium();
  };

  // History CRUD
  const saveCurrentToHistory = () => {
    if (!currentTeams || currentTeams.length === 0) return null;

    const newRecord = {
      id: `hist_${Date.now()}`,
      timestamp: Date.now(),
      teams: currentTeams,
      config: sessionConfig,
      totalPlayers: currentTeams.reduce((sum, t) => sum + t.members.length, 0),
    };

    setHistory((prev) => [newRecord, ...prev]);
    hapticsService.success();
    return newRecord;
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    hapticsService.impactMedium();
  };

  const clearHistory = () => {
    setHistory([]);
    hapticsService.impactHeavy();
  };

  const restoreHistoryItem = (historyItem) => {
    if (!historyItem || !historyItem.teams) return;
    setCurrentTeams(historyItem.teams);
    if (historyItem.config) {
      setSessionConfig(historyItem.config);
    }
    setActiveTab('generate');
    hapticsService.success();
  };

  // Tournament
  const initTournamentFromTeams = () => {
    if (!currentTeams || currentTeams.length < 2) return null;

    const teams = [...currentTeams];
    const matches = [];

    if (teams.length <= 4) {
      if (teams.length === 4) {
        matches.push(
          {
            id: 'm_semi_1',
            round: 2,
            titleAr: 'نصف النهائي (1)',
            titleEn: 'Semi-Final 1',
            team1: teams[0],
            team2: teams[1],
            score1: 0,
            score2: 0,
            winner: null,
          },
          {
            id: 'm_semi_2',
            round: 2,
            titleAr: 'نصف النهائي (2)',
            titleEn: 'Semi-Final 2',
            team1: teams[2],
            team2: teams[3],
            score1: 0,
            score2: 0,
            winner: null,
          }
        );
      } else {
        matches.push({
          id: 'm_semi_1',
          round: 2,
          titleAr: 'نصف النهائي',
          titleEn: 'Semi-Final',
          team1: teams[0],
          team2: teams[1],
          score1: 0,
          score2: 0,
          winner: null,
        });
      }

      matches.push({
        id: 'm_final',
        round: 3,
        titleAr: 'النهائي الكبير',
        titleEn: 'Grand Final',
        team1: teams.length === 2 ? teams[0] : null,
        team2: teams.length === 2 ? teams[1] : null,
        score1: 0,
        score2: 0,
        winner: null,
      });
    } else {
      const qCount = Math.floor(teams.length / 2);
      for (let i = 0; i < qCount; i++) {
        matches.push({
          id: `m_q_${i + 1}`,
          round: 1,
          titleAr: `ربع النهائي (${i + 1})`,
          titleEn: `Quarter-Final ${i + 1}`,
          team1: teams[i * 2],
          team2: teams[i * 2 + 1] || null,
          score1: 0,
          score2: 0,
          winner: null,
        });
      }
      matches.push(
        {
          id: 'm_semi_1',
          round: 2,
          titleAr: 'نصف النهائي (1)',
          titleEn: 'Semi-Final 1',
          team1: null,
          team2: null,
          score1: 0,
          score2: 0,
          winner: null,
        },
        {
          id: 'm_semi_2',
          round: 2,
          titleAr: 'نصف النهائي (2)',
          titleEn: 'Semi-Final 2',
          team1: null,
          team2: null,
          score1: 0,
          score2: 0,
          winner: null,
        },
        {
          id: 'm_final',
          round: 3,
          titleAr: 'النهائي الكبير',
          titleEn: 'Grand Final',
          team1: null,
          team2: null,
          score1: 0,
          score2: 0,
          winner: null,
        }
      );
    }

    const newTour = {
      id: `tour_${Date.now()}`,
      createdAt: Date.now(),
      teams,
      matches,
      champion: null,
    };

    setTournament(newTour);
    setChampion(null);
    setActiveTab('tournament');
    hapticsService.success();
    return newTour;
  };

  const updateMatchScore = (matchId, teamIndex, delta) => {
    setTournament((prev) => {
      if (!prev) return null;
      const updatedMatches = prev.matches.map((m) => {
        if (m.id === matchId) {
          if (teamIndex === 1) {
            return { ...m, score1: Math.max(0, (m.score1 || 0) + delta) };
          } else {
            return { ...m, score2: Math.max(0, (m.score2 || 0) + delta) };
          }
        }
        return m;
      });
      return { ...prev, matches: updatedMatches };
    });
    hapticsService.impactLight();
  };

  const advanceTournamentWinner = (matchId, winnerTeam) => {
    if (!winnerTeam || !tournament) return;

    setTournament((prev) => {
      if (!prev) return null;
      let nextChampion = null;

      const updatedMatches = prev.matches.map((m) => {
        if (m.id === matchId) {
          return { ...m, winner: winnerTeam };
        }
        return m;
      });

      if (matchId === 'm_final') {
        nextChampion = winnerTeam;
        setChampion(winnerTeam);
      }

      if (matchId === 'm_semi_1') {
        const finalM = updatedMatches.find((m) => m.id === 'm_final');
        if (finalM) finalM.team1 = winnerTeam;
      } else if (matchId === 'm_semi_2') {
        const finalM = updatedMatches.find((m) => m.id === 'm_final');
        if (finalM) finalM.team2 = winnerTeam;
      }

      if (matchId === 'm_q_1') {
        const semi1 = updatedMatches.find((m) => m.id === 'm_semi_1');
        if (semi1) semi1.team1 = winnerTeam;
      } else if (matchId === 'm_q_2') {
        const semi1 = updatedMatches.find((m) => m.id === 'm_semi_1');
        if (semi1) semi1.team2 = winnerTeam;
      } else if (matchId === 'm_q_3') {
        const semi2 = updatedMatches.find((m) => m.id === 'm_semi_2');
        if (semi2) semi2.team1 = winnerTeam;
      } else if (matchId === 'm_q_4') {
        const semi2 = updatedMatches.find((m) => m.id === 'm_semi_2');
        if (semi2) semi2.team2 = winnerTeam;
      }

      return {
        ...prev,
        matches: updatedMatches,
        champion: nextChampion || prev.champion,
      };
    });

    hapticsService.success();
  };

  const resetTournament = () => {
    setTournament(null);
    setChampion(null);
    hapticsService.impactMedium();
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'tf_members',
        'tf_current_teams',
        'tf_history',
        'tf_tournament',
      ]);
      setMembers([]);
      setCurrentTeams([]);
      setHistory([]);
      setTournament(null);
      setChampion(null);
      hapticsService.impactHeavy();
    } catch (e) {}
  };

  const renameTeam = (teamId, newName) => {
    if (!newName || !newName.trim()) return;
    setCurrentTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, nameAr: newName.trim(), nameEn: newName.trim() }
          : t
      )
    );
    hapticsService.impactLight();
  };

  return (
    <AppDataContext.Provider
      value={{
        members,
        currentTeams,
        history,
        sessionConfig,
        setSessionConfig,
        activeTab,
        setActiveTab,
        swapSelection,
        setSwapSelection,
        tournament,
        champion,
        setChampion,
        addMember,
        updateMember,
        deleteMember,
        bulkImportMembers,
        generateTeams,
        handlePlayerSwap,
        handlePlayerSwapTap: handlePlayerSwap,
        renameTeam,
        updateTeamScore,
        resetMatchScores,
        saveCurrentToHistory,
        restoreHistoryItem,
        deleteHistoryItem,
        clearHistory,
        clearAllHistory: clearHistory,
        initTournamentFromTeams,
        updateMatchScore,
        advanceTournamentWinner,
        resetTournament,
        resetAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
