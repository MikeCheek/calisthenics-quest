export interface TranslationDict {
  common: {
    loading: string;
  };
  nav: {
    home: string;
    coach: string;
    skills: string;
    friends: string;
    profile: string;
  };
  dashboard: {
    welcomeBack: string;
  };
  profile: {
    skillRadar: string;
    xpOverTime: string;
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
  },
  nav: {
    home: "Today",
    coach: "Coach",
    skills: "Skills",
    friends: "Crew",
    profile: "Me",
  },
  dashboard: {
    welcomeBack: "Welcome back, {name}",
  },
  profile: {
    skillRadar: "Skill radar",
    xpOverTime: "XP over time",
    updateSkills: "Update your skills",
    updateSkillsHint: "Hit something new? Declare it directly. Feeling like a lot has changed? Retake the full assessment.",
    declareSkill: "I hit a new skill",
    retakeAssessment: "Retake assessment",
    language: "Language",
    languageHint: "Choose the language for the app's interface.",
    daysStreak: "week streak",
  },
  exercise: {
    howTo: "How to",
    restBetweenSets: "s rest between sets",
  },
} as const;

export default en;
