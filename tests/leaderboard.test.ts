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

  it('mengurutkan leaderboard dengan kematian tersedikit jika level sama', () => {
    const rawData = Storage.getData();
    rawData.leaderboard = [
      { username: 'BanyakMati', maxLevel: 3, totalDeaths: 50, updatedAt: 1000 },
      { username: 'SedikitMati', maxLevel: 3, totalDeaths: 5, updatedAt: 2000 }
    ];

    const leaderboard = Storage.getLeaderboard();
    expect(leaderboard[0].username).toBe('SedikitMati');
    expect(leaderboard[1].username).toBe('BanyakMati');
  });
});
