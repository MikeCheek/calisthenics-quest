export interface TranslationDict {
  common: {
    loading: string;
    save: string;
    cancel: string;
    start: string;
  };
  nav: {
    home: string;
    train: string;
    skills: string;
    pair: string;
    profile: string;
    signOut: string;
  };
  dashboard: {
    welcomeBack: string;
    sessionsLogged: string;
    todaysFocus: string;
    sessionFlow: string;
    start: string;
    dayStreak: string;
    skillsStarted: string;
    sessions: string;
    quickActions: string;
    bonusWheel: string;
    planAhead: string;
    pairUp: string;
    skills: string;
    focusTimer: string;
    trophyRoad: string;
  };
  profile: {
    editProfile: string;
    skillRadar: string;
    xpOverTime: string;
    allSkills: string;
    updateSkills: string;
    updateSkillsHint: string;
    declareSkill: string;
    retakeAssessment: string;
    language: string;
    languageHint: string;
    daysStreak: string;
  };
  exercise: {
    howTo: string;
    restBetweenSets: string;
  };
}

const en: TranslationDict = {
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    start: "Start",
  },
  nav: {
    home: "Home",
    train: "Train",
    skills: "Skills",
    pair: "Pair",
    profile: "Profile",
    signOut: "Sign out",
  },
  dashboard: {
    welcomeBack: "Welcome back, {name}",
    sessionsLogged: "{count} sessions logged",
    todaysFocus: "Today's focus",
    sessionFlow: "Warm-up → skill work → accessory → finisher",
    start: "Start",
    dayStreak: "day streak",
    skillsStarted: "skills started",
    sessions: "sessions",
    quickActions: "Quick actions",
    bonusWheel: "Bonus wheel",
    planAhead: "Plan ahead",
    pairUp: "Pair up",
    skills: "Skills",
    focusTimer: "Focus timer",
    trophyRoad: "Trophy road",
  },
  profile: {
    editProfile: "Edit profile",
    skillRadar: "Skill radar",
    xpOverTime: "XP over time",
    allSkills: "All skills",
    updateSkills: "Update your skills",
    updateSkillsHint: "Hit something new? Declare it directly. Feeling like a lot has changed? Retake the full assessment.",
    declareSkill: "I hit a new skill",
    retakeAssessment: "Retake assessment",
    language: "Language",
    languageHint: "Choose the language for the app's interface.",
    daysStreak: "day streak",
  },
  exercise: {
    howTo: "How to",
    restBetweenSets: "s rest between sets",
  },
} as const;

export default en;
