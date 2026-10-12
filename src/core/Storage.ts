// Sistem Penyimpanan Progress & Pengaturan (PRD Bagian 10.3)

export interface LevelRecord {
  completed: boolean;
  bestTime: number; // detik
  deaths: number;
}

export interface SaveData {
  version: number;
  unlockedLevel: number;
  levels: Record<number, LevelRecord>;
  totalDeaths: number;
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
    unlockedLevel: 1,
    levels: {},
    totalDeaths: 0,
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
    return Math.min(6, Math.max(1, Storage.data.unlockedLevel || 1));
  }

  public static unlockLevel(levelId: number): void {
    const capped = Math.min(6, levelId);
    if (capped > Storage.data.unlockedLevel) {
      Storage.data.unlockedLevel = capped;
      Storage.save();
    }
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
    Storage.data = { ...Storage.defaultData, levels: {} };
    Storage.save();
  }
}
