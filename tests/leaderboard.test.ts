import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from '../src/core/Storage';

describe('Username & Leaderboard System', () => {
  beforeEach(() => {
    Storage.resetProgress();
  });

  it('dapat menyimpan dan mengambil username', () => {
    Storage.setUsername('PlayerGanteng');
    expect(Storage.getUsername()).toBe('PlayerGanteng');
  });

  it('memotong username jika melebihi 16 karakter', () => {
    Storage.setUsername('12345678901234567890');
    expect(Storage.getUsername().length).toBeLessThanOrEqual(16);
  });

  it('mengurutkan leaderboard dengan level tertinggi di atas', () => {
    Storage.setUsername('PemainA');
    Storage.recordLevelCompletion(1, 10, 5); // Unlocks level 2
    Storage.recordLevelCompletion(2, 12, 4); // Unlocks level 3

    Storage.updateLeaderboard('PemainB');
    // Set level PemainB ke level 1
    const rawData = Storage.getData();
    const entryB = rawData.leaderboard.find(e => e.username === 'PemainB');
    if (entryB) {
      entryB.maxLevel = 1;
      entryB.totalDeaths = 0;
    }

    const leaderboard = Storage.getLeaderboard();
    const indexA = leaderboard.findIndex(e => e.username === 'PemainA');
    const indexB = leaderboard.findIndex(e => e.username === 'PemainB');

    expect(indexA).toBeLessThan(indexB);
  });

  it('leaderboard memiliki minimal 300 orang bot/pemain unik', () => {
    const leaderboard = Storage.getLeaderboard();
    expect(leaderboard.length).toBeGreaterThanOrEqual(300);
  });

  it('tidak ada satupun pemain di leaderboard yang mati kurang dari 38', () => {
    const leaderboard = Storage.getLeaderboard();
    for (const entry of leaderboard) {
      expect(entry.totalDeaths).toBeGreaterThanOrEqual(38);
    }
  });

  it('pemain dengan level top memiliki rata-rata kematian yang lebih banyak dibandingkan level rendah', () => {
    const leaderboard = Storage.getLeaderboard();
    const topTier = leaderboard.filter(e => e.maxLevel >= 9);
    const bottomTier = leaderboard.filter(e => e.maxLevel <= 2);

    const avgTopDeaths = topTier.reduce((sum, e) => sum + e.totalDeaths, 0) / topTier.length;
    const avgBottomDeaths = bottomTier.reduce((sum, e) => sum + e.totalDeaths, 0) / bottomTier.length;

    expect(avgTopDeaths).toBeGreaterThan(avgBottomDeaths);
  });
});
