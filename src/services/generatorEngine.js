// 20 Unique Team Color Palettes & Identities for Generated Teams
export const TEAM_IDENTITIES = [
  {
    nameAr: 'فريق الصقور الأزرق',
    nameEn: 'Team Blue Falcons',
    color: '#3b82f6',
    secondary: '#1d4ed8',
    glow: 'rgba(59, 130, 246, 0.4)',
    icon: 'Shield',
  },
  {
    nameAr: 'فريق الفرسان البنفسجي',
    nameEn: 'Team Purple Knights',
    color: '#8b5cf6',
    secondary: '#6d28d9',
    glow: 'rgba(139, 92, 246, 0.4)',
    icon: 'Crown',
  },
  {
    nameAr: 'فريق الوحوش الزمردي',
    nameEn: 'Team Emerald Beasts',
    color: '#10b981',
    secondary: '#047857',
    glow: 'rgba(16, 185, 129, 0.4)',
    icon: 'Zap',
  },
  {
    nameAr: 'فريق النيران الكهرماني',
    nameEn: 'Team Amber Flames',
    color: '#f59e0b',
    secondary: '#b45309',
    glow: 'rgba(245, 158, 11, 0.4)',
    icon: 'Flame',
  },
  {
    nameAr: 'فريق الصواعق القرمزي',
    nameEn: 'Team Crimson Sparks',
    color: '#ec4899',
    secondary: '#be185d',
    glow: 'rgba(236, 72, 153, 0.4)',
    icon: 'Sparkles',
  },
  {
    nameAr: 'فريق التيارات السماوية',
    nameEn: 'Team Cyan Storms',
    color: '#06b6d4',
    secondary: '#0e7490',
    glow: 'rgba(6, 182, 212, 0.4)',
    icon: 'Wind',
  },
  {
    nameAr: 'فريق التنانين الياقوتي',
    nameEn: 'Team Ruby Dragons',
    color: '#ef4444',
    secondary: '#b91c1c',
    glow: 'rgba(239, 68, 68, 0.4)',
    icon: 'Flame',
  },
  {
    nameAr: 'فريق الأسود الذهبي',
    nameEn: 'Team Golden Lions',
    color: '#eab308',
    secondary: '#a16207',
    glow: 'rgba(234, 179, 8, 0.4)',
    icon: 'Crown',
  },
  {
    nameAr: 'فريق الأفاعي التركواز',
    nameEn: 'Team Teal Vipers',
    color: '#14b8a6',
    secondary: '#0f766e',
    glow: 'rgba(20, 184, 166, 0.4)',
    icon: 'Shield',
  },
  {
    nameAr: 'فريق الأشباح الأرجواني',
    nameEn: 'Team Violet Phantoms',
    color: '#a855f7',
    secondary: '#7e22ce',
    glow: 'rgba(168, 85, 247, 0.4)',
    icon: 'Sparkles',
  },
  {
    nameAr: 'فريق الجبابرة الوردي',
    nameEn: 'Team Rose Titans',
    color: '#f43f5e',
    secondary: '#be123c',
    glow: 'rgba(244, 63, 94, 0.4)',
    icon: 'Shield',
  },
  {
    nameAr: 'فريق الظلال الليموني',
    nameEn: 'Team Lime Shadows',
    color: '#84cc16',
    secondary: '#4d7c0f',
    glow: 'rgba(132, 204, 22, 0.4)',
    icon: 'Zap',
  },
  {
    nameAr: 'فريق الذئاب الكوبالت',
    nameEn: 'Team Cobalt Wolves',
    color: '#2563eb',
    secondary: '#1e40af',
    glow: 'rgba(37, 99, 235, 0.4)',
    icon: 'Shield',
  },
  {
    nameAr: 'فريق العنقاء البرتقالي',
    nameEn: 'Team Sunset Phoenix',
    color: '#f97316',
    secondary: '#c2410c',
    glow: 'rgba(249, 115, 22, 0.4)',
    icon: 'Flame',
  },
  {
    nameAr: 'فريق النينجا الفضي',
    nameEn: 'Team Silver Ninjas',
    color: '#94a3b8',
    secondary: '#475569',
    glow: 'rgba(148, 163, 184, 0.4)',
    icon: 'Crown',
  },
  {
    nameAr: 'فريق الرعد الكهربائي',
    nameEn: 'Team Electric Thunder',
    color: '#0284c7',
    secondary: '#0369a1',
    glow: 'rgba(2, 132, 199, 0.4)',
    icon: 'Zap',
  },
  {
    nameAr: 'فريق ملوك الغابة',
    nameEn: 'Team Forest Kings',
    color: '#059669',
    secondary: '#047857',
    glow: 'rgba(5, 150, 105, 0.4)',
    icon: 'Crown',
  },
  {
    nameAr: 'فريق السايبر المستقبلي',
    nameEn: 'Team Cyber Glitch',
    color: '#d946ef',
    secondary: '#a21caf',
    glow: 'rgba(217, 70, 239, 0.4)',
    icon: 'Sparkles',
  },
  {
    nameAr: 'فريق عمالقة الحمم',
    nameEn: 'Team Lava Giants',
    color: '#dc2626',
    secondary: '#991b1b',
    glow: 'rgba(220, 38, 38, 0.4)',
    icon: 'Flame',
  },
  {
    nameAr: 'فريق أساطير القمة',
    nameEn: 'Team Apex Legends',
    color: '#7c3aed',
    secondary: '#5b21b6',
    glow: 'rgba(124, 58, 237, 0.4)',
    icon: 'Crown',
  },
];

// Helper: Fisher-Yates Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Calculate team stats (sum, average, role counts)
export function computeTeamStats(members) {
  if (!members || members.length === 0) {
    return { totalSkill: 0, avgSkill: 0, memberCount: 0 };
  }
  const totalSkill = members.reduce((acc, m) => acc + (Number(m.level) || 5), 0);
  const avgSkill = (totalSkill / members.length).toFixed(1);
  return {
    totalSkill,
    avgSkill: Number(avgSkill),
    memberCount: members.length,
  };
}

// 1. Pure Random Algorithm (Fisher-Yates + Round Robin)
export function generateRandomTeams(members, numTeams = 2) {
  if (!members || members.length < 2) return [];
  const shuffled = shuffleArray(members);
  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    ...TEAM_IDENTITIES[i % TEAM_IDENTITIES.length],
    members: [],
    score: 0,
  }));

  shuffled.forEach((member, index) => {
    teams[index % numTeams].members.push(member);
  });

  return teams.map((team) => ({
    ...team,
    stats: computeTeamStats(team.members),
  }));
}

// 2. Snake-Draft Skill Balanced Algorithm
export function generateBalancedTeams(members, numTeams = 2) {
  if (!members || members.length < 2) return [];
  
  // Sort players descending by skill level, randomize ties
  const sorted = [...members].sort((a, b) => {
    const diff = (Number(b.level) || 5) - (Number(a.level) || 5);
    return diff !== 0 ? diff : Math.random() - 0.5;
  });

  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    ...TEAM_IDENTITIES[i % TEAM_IDENTITIES.length],
    members: [],
    score: 0,
  }));

  // Snake draft distribution: 0 -> 1 -> 2, 2 -> 1 -> 0
  let teamIndex = 0;
  let direction = 1;

  sorted.forEach((member) => {
    teams[teamIndex].members.push(member);
    teamIndex += direction;
    if (teamIndex >= numTeams) {
      teamIndex = numTeams - 1;
      direction = -1;
    } else if (teamIndex < 0) {
      teamIndex = 0;
      direction = 1;
    }
  });

  return teams.map((team) => ({
    ...team,
    stats: computeTeamStats(team.members),
  }));
}

// 3. Captains First Algorithm
export function generateCaptainsFirstTeams(members, numTeams = 2) {
  if (!members || members.length < 2) return [];

  const captains = shuffleArray(members.filter((m) => m.role === 'captain'));
  const others = [...members.filter((m) => m.role !== 'captain')].sort(
    (a, b) => (Number(b.level) || 5) - (Number(a.level) || 5)
  );

  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    ...TEAM_IDENTITIES[i % TEAM_IDENTITIES.length],
    members: [],
    score: 0,
  }));

  // Distribute captains first
  captains.forEach((cap, idx) => {
    teams[idx % numTeams].members.push(cap);
  });

  // Distribute remaining with snake draft to team with lowest current total skill
  others.forEach((player) => {
    teams.sort((a, b) => {
      const sumA = a.members.reduce((acc, m) => acc + (Number(m.level) || 5), 0);
      const sumB = b.members.reduce((acc, m) => acc + (Number(m.level) || 5), 0);
      return sumA - sumB;
    });
    teams[0].members.push(player);
  });

  // Restore original ordering of teams by ID
  teams.sort((a, b) => a.id.localeCompare(b.id));

  return teams.map((team) => ({
    ...team,
    stats: computeTeamStats(team.members),
  }));
}

// 4. Role Balanced Algorithm
export function generateRoleBalancedTeams(members, numTeams = 2) {
  if (!members || members.length < 2) return [];

  // Group by roles
  const roles = ['captain', 'striker', 'tank', 'playmaker', 'support', 'rookie'];
  const roleBuckets = {};
  roles.forEach((r) => {
    roleBuckets[r] = shuffleArray(members.filter((m) => m.role === r));
  });

  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    ...TEAM_IDENTITIES[i % TEAM_IDENTITIES.length],
    members: [],
    score: 0,
  }));

  // Distribute each role bucket evenly
  roles.forEach((r) => {
    const bucket = roleBuckets[r];
    bucket.forEach((player, idx) => {
      teams[idx % numTeams].members.push(player);
    });
  });

  // Catch any members with unknown or missing roles
  const knownIds = new Set(teams.flatMap((t) => t.members.map((m) => m.id)));
  const unassigned = members.filter((m) => !knownIds.has(m.id));
  unassigned.forEach((player, idx) => {
    teams[idx % numTeams].members.push(player);
  });

  return teams.map((team) => ({
    ...team,
    stats: computeTeamStats(team.members),
  }));
}

// Master Generator Dispatcher
export function generateTeamsByMode(members, numTeams = 2, mode = 'balanced') {
  switch (mode) {
    case 'random':
      return generateRandomTeams(members, numTeams);
    case 'captains':
      return generateCaptainsFirstTeams(members, numTeams);
    case 'roles':
      return generateRoleBalancedTeams(members, numTeams);
    case 'balanced':
    default:
      return generateBalancedTeams(members, numTeams);
  }
}
