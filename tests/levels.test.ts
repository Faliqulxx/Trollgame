// Test Suite Validasi Desain Level v1.1 (PRD Bagian 6.1a, 6.2 & 4.7)

import { describe, it, expect } from 'vitest';
import { LEVELS } from '../src/levels/levelsData';
import { Level } from '../src/levels/LevelLoader';
import { Reach } from '../src/physics/Reach';

describe('Level Validation Tests (PRD v1.1)', () => {
  it('harus memiliki minimal 10 level terdaftar', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(10);
  });

  it('setiap level harus memiliki lebar minimal 150 tile (≥ 4.800 px)', () => {
    for (const lvlData of LEVELS) {
      const level = new Level(lvlData);
      expect(level.widthInTiles).toBeGreaterThanOrEqual(150);
      expect(level.pixelWidth).toBeGreaterThanOrEqual(4800);
    }
  });

  it('level 10 (Final Gauntlet) harus memiliki lebar minimal 300 tile (≥ 9.600 px)', () => {
    const level10 = new Level(LEVELS[9]);
    expect(level10.widthInTiles).toBeGreaterThanOrEqual(300);
    expect(level10.pixelWidth).toBeGreaterThanOrEqual(9600);
  });

  it('jarak horizontal antara titik spawn dan pintu keluar harus ≥ 3.800 px (≥ 4 layar)', () => {
    for (const lvlData of LEVELS) {
      const level = new Level(lvlData);
      const spawnX = level.spawnX;

      // Pintu biasa atau RunningDoor
      const doorX = level.door ? level.door.x : (level.runningDoor ? level.runningDoor.x : 0);
      const distance = Math.abs(doorX - spawnX);

      expect(distance).toBeGreaterThanOrEqual(3800);
    }
  });

  it('setiap level harus memiliki minimal satu checkpoint untuk membantu progres pemain', () => {
    for (const lvlData of LEVELS) {
      expect(lvlData.checkpoints).toBeDefined();
      expect(lvlData.checkpoints!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('helper Reach.canJump harus menghitung batas lompatan yang adil', () => {
    // Lompat mendatar 100px (aman)
    expect(Reach.canJump(100, 0)).toBe(true);

    // Lompat mendatar 400px (tidak mungkin tanpa platform)
    expect(Reach.canJump(400, 0)).toBe(false);

    // Lompat ke platform yang lebih tinggi 80px (masih terjangkau, batas ~117px)
    expect(Reach.canJump(50, -80)).toBe(true);

    // Lompat ke platform yang 130px lebih tinggi (melebihi tinggi loncatan maks)
    expect(Reach.canJump(50, -130)).toBe(false);
  });

  it('LevelSelectScene harus mendukung UI 100 level dengan paginasi dan mengunci level 7-100', async () => {
    const { LevelSelectScene } = await import('../src/scenes/LevelSelectScene');
    const scene = new LevelSelectScene();

    // Halaman 1 (Level 1 - 20)
    expect(scene.totalPages).toBe(5);
    expect(scene.currentPage).toBe(0);
    expect(scene.cards.length).toBe(20);
    expect(scene.cards[0].levelId).toBe(1);
    expect(scene.cards[19].levelId).toBe(20);

    // Level 1 harus terbuka secara default
    expect(scene.cards[0].isUnlocked).toBe(true);

    // Level 7 sampai 20 pada halaman 1 WAJIB TERKUNCI (gembok)
    for (let i = 6; i < 20; i++) {
      expect(scene.cards[i].isUnlocked).toBe(false);
    }

    // Pindah ke Halaman 5 (Level 81 - 100)
    scene.currentPage = 4;
    scene.refreshCards();
    expect(scene.cards.length).toBe(20);
    expect(scene.cards[0].levelId).toBe(81);
    expect(scene.cards[19].levelId).toBe(100);

    // Semua level di halaman 5 (81-100) WAJIB TERKUNCI
    for (const card of scene.cards) {
      expect(card.isUnlocked).toBe(false);
    }

    // Mengklik level terkunci (misal Level 81) harus memunculkan notifikasi bayar Rp 10.000
    const clickResult = scene.handleClick(scene.cards[0].x + 10, scene.cards[0].y + 10);
    expect(clickResult).toBeNull();
    expect(scene.lockedNoticeLevel).toBe(81);
  });
});
