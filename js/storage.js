/**
 * TypePulse - LocalStorage & Gamification Progression Manager
 * Handles persistent preferences, career statistics, XP leveling, and achievements.
 */

const STORAGE_KEYS = {
  SETTINGS: 'typepulse_settings',
  STATS: 'typepulse_career_stats',
  HISTORY: 'typepulse_test_history',
  ACHIEVEMENTS: 'typepulse_achievements'
};

const DEFAULT_SETTINGS = {
  theme: 'cyberpunk',
  fontFamily: 'jetbrains',
  fontSize: 24,
  caretStyle: 'line',
  smoothCaret: true,
  particleMode: 'sparks',
  screenShake: true,
  soundProfile: 'panda',
  soundVolume: 0.5,
  pitchVariation: true,
  errorSound: true,
  mode: 'time',
  timeLimit: 30,
  wordCount: 25,
  difficulty: 'medium',
  includePunctuation: false,
  includeNumbers: false,
  blindMode: false,
  strictMode: false,
  showLiveWpm: true,
  showLiveAcc: true,
  showLiveStreak: true
};

const ACHIEVEMENTS_DEF = [
  { id: 'first_test', title: 'First Flight', desc: 'Completed your very first typing test', icon: '🚀' },
  { id: 'speed_50', title: 'Fast Lane', desc: 'Reached 50 WPM in any mode', icon: '⚡' },
  { id: 'speed_80', title: 'Speed Demon', desc: 'Broke 80 WPM barrier', icon: '🔥' },
  { id: 'speed_100', title: 'Century Club', desc: 'Achieved 100+ WPM', icon: '💯' },
  { id: 'speed_120', title: 'Supersonic', desc: 'Achieved 120+ WPM speed', icon: '🏎️' },
  { id: 'speed_150', title: 'Godspeed', desc: 'Surpassed 150+ WPM transcendent speed', icon: '⚡' },
  { id: 'acc_100', title: 'Flawless Precision', desc: 'Achieved 100% accuracy (min 20 words)', icon: '🎯' },
  { id: 'streak_50', title: 'In the Zone', desc: 'Maintained a 50 character combo streak', icon: '✨' },
  { id: 'streak_100', title: 'Unstoppable', desc: 'Maintained a 100 character combo streak', icon: '🌟' },
  { id: 'hard_cleared', title: 'Lexicon Scholar', desc: 'Completed a test on Hard difficulty', icon: '📚' },
  { id: 'nightmare_cleared', title: 'Daredevil', desc: 'Conquered a Nightmare difficulty test', icon: '💀' },
  { id: 'code_cleared', title: 'Hackerman', desc: 'Completed a Code syntax test', icon: '💻' },
  { id: 'survival_survivor', title: 'Survivor', desc: 'Typed 30+ words in Sudden Death mode', icon: '🛡️' },
  { id: 'level_5', title: 'Ranked Up', desc: 'Reached Level 5', icon: '⭐' },
  { id: 'level_10', title: 'Keyboard Veteran', desc: 'Reached Level 10', icon: '👑' }
];

class StorageManager {
  constructor() {
    this.settings = this.loadSettings();
    this.career = this.loadCareerStats();
    this.history = this.loadHistory();
    this.achievements = this.loadAchievements();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
    return this.settings;
  }

  loadCareerStats() {
    const defaultStats = {
      testsCompleted: 0,
      totalWordsTyped: 0,
      totalCharsTyped: 0,
      totalTimeSeconds: 0,
      bestWpm: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      maxCombo: 0,
      xp: 0
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch (e) {
      return defaultStats;
    }
  }

  saveCareerStats() {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.career));
    } catch (e) {
      console.warn('Could not save stats:', e);
    }
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveHistory(record) {
    this.history.unshift(record);
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.history));
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  }

  loadAchievements() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  unlockAchievement(achId) {
    if (this.achievements.includes(achId)) return null;
    this.achievements.push(achId);
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(this.achievements));
    } catch (e) {}

    const ach = ACHIEVEMENTS_DEF.find(a => a.id === achId);
    return ach || null;
  }

  // Calculate XP gained from a test round
  calculateXp(wpm, accuracy, difficulty, wordCount) {
    let diffMultiplier = 1.0;
    if (difficulty === 'hard') diffMultiplier = 1.4;
    else if (difficulty === 'nightmare') diffMultiplier = 2.0;
    else if (difficulty === 'code') diffMultiplier = 1.5;

    const baseScore = (wpm * 2) * (accuracy / 100);
    const volumeBonus = Math.min(100, wordCount * 1.5);
    return Math.round((baseScore + volumeBonus) * diffMultiplier);
  }

  getLevelInfo(totalXp = this.career.xp) {
    // XP curve: Level 1 = 0, Level 2 = 100, Level 3 = 250, Level 4 = 450, Level n ~ 25 * n^2
    const level = Math.floor(Math.sqrt(totalXp / 30)) + 1;
    const currentLevelBaseXp = Math.floor(30 * Math.pow(level - 1, 2));
    const nextLevelXp = Math.floor(30 * Math.pow(level, 2));
    const progress = Math.min(100, Math.max(0, ((totalXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp || 1)) * 100));

    const titles = [
      { min: 1, title: 'Novice Typist' },
      { min: 3, title: 'Keystroke Scout' },
      { min: 5, title: 'Cadence Weaver' },
      { min: 8, title: 'Speed Adept' },
      { min: 12, title: 'Mechanical Virtuoso' },
      { min: 18, title: 'Sonic Striker' },
      { min: 25, title: 'Keyboard Titan' },
      { min: 40, title: 'Quantum Scribe' }
    ];
    let currentTitle = 'Novice Typist';
    titles.forEach(t => {
      if (level >= t.min) currentTitle = t.title;
    });

    return {
      level,
      title: currentTitle,
      currentXp: totalXp,
      levelBaseXp: currentLevelBaseXp,
      nextLevelXp,
      progress
    };
  }

  recordTestResult(result) {
    const xpEarned = this.calculateXp(result.wpm, result.accuracy, result.difficulty, result.wordsTyped);
    const prevLevel = this.getLevelInfo().level;

    this.career.testsCompleted += 1;
    this.career.totalWordsTyped += result.wordsTyped;
    this.career.totalCharsTyped += result.totalChars;
    this.career.totalTimeSeconds += Math.round(result.duration);
    this.career.bestWpm = Math.max(this.career.bestWpm, result.wpm);
    this.career.maxCombo = Math.max(this.career.maxCombo, result.maxCombo);

    // Running averages
    this.career.avgWpm = Math.round(
      ((this.career.avgWpm * (this.career.testsCompleted - 1)) + result.wpm) / this.career.testsCompleted
    );
    this.career.avgAccuracy = Math.round(
      ((this.career.avgAccuracy * (this.career.testsCompleted - 1)) + result.accuracy) / this.career.testsCompleted
    );

    this.career.xp += xpEarned;
    this.saveCareerStats();

    // Check level up
    const newLevelInfo = this.getLevelInfo();
    const leveledUp = newLevelInfo.level > prevLevel;

    // Check achievements
    const unlockedAchievements = [];
    const checkUnlock = (id) => {
      const ach = this.unlockAchievement(id);
      if (ach) unlockedAchievements.push(ach);
    };

    checkUnlock('first_test');
    if (result.wpm >= 50) checkUnlock('speed_50');
    if (result.wpm >= 80) checkUnlock('speed_80');
    if (result.wpm >= 100) checkUnlock('speed_100');
    if (result.wpm >= 120) checkUnlock('speed_120');
    if (result.wpm >= 150) checkUnlock('speed_150');
    if (result.accuracy === 100 && result.wordsTyped >= 20) checkUnlock('acc_100');
    if (result.maxCombo >= 50) checkUnlock('streak_50');
    if (result.maxCombo >= 100) checkUnlock('streak_100');
    if (result.difficulty === 'hard') checkUnlock('hard_cleared');
    if (result.difficulty === 'nightmare') checkUnlock('nightmare_cleared');
    if (result.difficulty === 'code') checkUnlock('code_cleared');
    if (result.mode === 'survival' && result.wordsTyped >= 30) checkUnlock('survival_survivor');
    if (newLevelInfo.level >= 5) checkUnlock('level_5');
    if (newLevelInfo.level >= 10) checkUnlock('level_10');

    // Save to history
    const historyItem = {
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      mode: result.mode,
      difficulty: result.difficulty,
      xpEarned
    };
    this.saveHistory(historyItem);

    return {
      xpEarned,
      leveledUp,
      newLevelInfo,
      unlockedAchievements
    };
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    this.career = this.loadCareerStats();
    this.history = [];
    this.achievements = [];
  }
}

const Store = new StorageManager();
