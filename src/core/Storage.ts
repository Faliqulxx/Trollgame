// Sistem Penyimpanan Progress & Pengaturan (PRD Bagian 10.3)

export interface LevelRecord {
  completed: boolean;
  bestTime: number; // detik
  deaths: number;
}

export interface LeaderboardEntry {
  username: string;
  maxLevel: number;
  totalDeaths: number;
  updatedAt: number;
}

export interface SaveData {
  version: number;
  username: string;
  unlockedLevel: number;
  levels: Record<number, LevelRecord>;
  totalDeaths: number;
  leaderboard: LeaderboardEntry[];
  settings: {
    sfx: number;
    music: number;
    language: 'id' | 'en';
  };
}

const STORAGE_KEY = 'stickman_trapdoor_save';

export class Storage {
  private static defaultData: SaveData = {
    version: 1,
    username: '',
    unlockedLevel: 1,
    levels: {},
    totalDeaths: 0,
    leaderboard: [
      { username: 'Dev FREEKS', maxLevel: 6, totalDeaths: 0, updatedAt: 1728000000000 },
      { username: 'Pro Master', maxLevel: 5, totalDeaths: 12, updatedAt: 1728000000000 },
      { username: 'Si Paling Sabar', maxLevel: 4, totalDeaths: 35, updatedAt: 1728000000000 },
      { username: 'Korban Jebakan', maxLevel: 2, totalDeaths: 64, updatedAt: 1728000000000 }
    ],
    settings: {
      sfx: 0.8,
      music: 0.4,
      language: 'id'
    }
  };

  private static data: SaveData = Storage.load();

  public static load(): SaveData {
    try {
      if (typeof localStorage === 'undefined') return { ...Storage.defaultData };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...Storage.defaultData };
      const parsed = JSON.parse(raw);
      return {
        ...Storage.defaultData,
        ...parsed,
        leaderboard: Array.isArray(parsed.leaderboard) && parsed.leaderboard.length > 0 ? parsed.leaderboard : Storage.defaultData.leaderboard,
        settings: { ...Storage.defaultData.settings, ...(parsed.settings || {}) },
        levels: { ...Storage.defaultData.levels, ...(parsed.levels || {}) }
      };
    } catch {
      return { ...Storage.defaultData };
    }
  }

  public static save(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Storage.data));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  }

  public static getData(): SaveData {
    return Storage.data;
  }

  public static getUnlockedLevel(): number {
    return Math.min(10, Math.max(1, Storage.data.unlockedLevel || 1));
  }

  public static unlockLevel(levelId: number): void {
    const capped = Math.min(10, levelId);
    if (capped > Storage.data.unlockedLevel) {
      Storage.data.unlockedLevel = capped;
      Storage.save();
    }
  }

  public static getUsername(): string {
    return Storage.data.username || '';
  }

  public static setUsername(name: string): void {
    const clean = name.trim().slice(0, 16);
    Storage.data.username = clean;
    if (clean) {
      Storage.updateLeaderboard(clean);
    }
    Storage.save();
  }

  public static getLeaderboard(): LeaderboardEntry[] {
    const list = [...(Storage.data.leaderboard || [])];
    return list.sort((a, b) => {
      // 1. Level tertinggi lebih unggul (b - a)
      if (b.maxLevel !== a.maxLevel) {
        return b.maxLevel - a.maxLevel;
      }
      // 2. Kematian lebih sedikit lebih unggul (a - b)
      if (a.totalDeaths !== b.totalDeaths) {
        return a.totalDeaths - b.totalDeaths;
      }
      // 3. Waktu terbaru
      return b.updatedAt - a.updatedAt;
    });
  }

  public static updateLeaderboard(customUsername?: string): void {
    const name = (customUsername || Storage.getUsername()).trim();
    if (!name) return;

    if (!Storage.data.leaderboard) {
      Storage.data.leaderboard = [];
    }

    const currentLevel = Storage.getUnlockedLevel();
    const currentDeaths = Storage.getTotalDeaths();
    const existing = Storage.data.leaderboard.find(entry => entry.username.toLowerCase() === name.toLowerCase());

    if (existing) {
      existing.username = name;
      existing.maxLevel = Math.max(existing.maxLevel, currentLevel);
      existing.totalDeaths = currentDeaths;
      existing.updatedAt = Date.now();
    } else {
      Storage.data.leaderboard.push({
        username: name,
        maxLevel: currentLevel,
        totalDeaths: currentDeaths,
        updatedAt: Date.now()
      });
    }

    Storage.save();
  }

  public static recordLevelCompletion(levelId: number, timeTaken: number, deathsInRun: number): void {
    const existing = Storage.data.levels[levelId];
    if (!existing) {
      Storage.data.levels[levelId] = {
        completed: true,
        bestTime: timeTaken,
        deaths: deathsInRun
      };
    } else {
      existing.completed = true;
      existing.bestTime = Math.min(existing.bestTime || 99999, timeTaken);
      existing.deaths += deathsInRun;
    }

    Storage.unlockLevel(levelId + 1);
    if (Storage.getUsername()) {
      Storage.updateLeaderboard();
    }
    Storage.save();
  }

  public static addDeath(levelId?: number): void {
    Storage.data.totalDeaths = (Storage.data.totalDeaths || 0) + 1;
    if (levelId) {
      if (!Storage.data.levels[levelId]) {
        Storage.data.levels[levelId] = { completed: false, bestTime: 0, deaths: 1 };
      } else {
        Storage.data.levels[levelId].deaths = (Storage.data.levels[levelId].deaths || 0) + 1;
      }
    }
    if (Storage.getUsername()) {
      Storage.updateLeaderboard();
    }
    Storage.save();
  }

  public static getTotalDeaths(): number {
    return Storage.data.totalDeaths || 0;
  }

  public static getLevelDeaths(levelId: number): number {
    return Storage.data.levels[levelId]?.deaths || 0;
  }

  public static updateSettings(settings: Partial<SaveData['settings']>): void {
    Storage.data.settings = { ...Storage.data.settings, ...settings };
    Storage.save();
  }

  public static resetProgress(): void {
    const currentName = Storage.data.username;
    Storage.data = { ...Storage.defaultData, username: currentName, levels: {} };
    Storage.save();
  }
}
