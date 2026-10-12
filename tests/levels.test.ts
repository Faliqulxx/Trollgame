// Test Suite Validasi Desain Level v1.1 (PRD Bagian 6.1a, 6.2 & 4.7)

import { describe, it, expect } from 'vitest';
import { LEVELS } from '../src/levels/levelsData';
import { Level } from '../src/levels/LevelLoader';
import { Reach } from '../src/physics/Reach';

describe('Level Validation Tests (PRD v1.1)', () => {
  it('harus memiliki minimal 10 level terdaftar', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(10);
  });

  it('level horizontal harus memiliki lebar minimal 150 tile (≥ 4.800 px) dan Level 7 vertikal harus memiliki tinggi ≥ 40 tile', () => {
    for (const lvlData of LEVELS) {
      const level = new Level(lvlData);
      if (lvlData.id === 7) {
        // Level 7 adalah Menara Pemanjatan Vertikal
        expect(level.heightInTiles).toBeGreaterThanOrEqual(40);
        expect(level.pixelHeight).toBeGreaterThanOrEqual(1280);
      } else {
        expect(level.widthInTiles).toBeGreaterThanOrEqual(150);
        expect(level.pixelWidth).toBeGreaterThanOrEqual(4800);
      }
    }
  });

  it('level 10 (Final Gauntlet) harus memiliki lebar minimal 300 tile (≥ 9.600 px)', () => {
    const level10 = new Level(LEVELS[9]);
    expect(level10.widthInTiles).toBeGreaterThanOrEqual(300);
    expect(level10.pixelWidth).toBeGreaterThanOrEqual(9600);
  });

  it('jarak eksplorasi antara titik spawn dan pintu keluar harus ≥ 3.800 px (horizontal) atau ≥ 1.000 px (vertikal untuk Level 7)', () => {
    for (const lvlData of LEVELS) {
      const level = new Level(lvlData);
      const spawnX = level.spawnX;
      const spawnY = level.spawnY;

      // Pintu biasa atau RunningDoor
      const doorX = level.door ? level.door.x : (level.runningDoor ? level.runningDoor.x : 0);
      const doorY = level.door ? level.door.y : (level.runningDoor ? level.runningDoor.y : 0);

      if (lvlData.id === 7) {
        // Level 7: Jarak pemanjatan vertikal dari bawah ke puncak
        const verticalDist = Math.abs(doorY - spawnY);
        expect(verticalDist).toBeGreaterThanOrEqual(1000);
      } else {
        const horizontalDist = Math.abs(doorX - spawnX);
        expect(horizontalDist).toBeGreaterThanOrEqual(3800);
      }
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

  it('LevelSelectScene harus mendukung UI 20 level, membuka level 1-10 secara progresif, dan mengunci level 11-20', async () => {
    const { LevelSelectScene } = await import('../src/scenes/LevelSelectScene');
    const { Storage } = await import('../src/core/Storage');
    const scene = new LevelSelectScene();

    // UI Level berjumlah 20 level
    expect(scene.cards.length).toBe(20);
    expect(scene.cards[0].levelId).toBe(1);
    expect(scene.cards[19].levelId).toBe(20);

    // Level 1 harus terbuka secara default
    expect(scene.cards[0].isUnlocked).toBe(true);

    // Buka progress hingga level 10
    Storage.unlockLevel(10);
    scene.refreshCards();

    // Level 1 sampai 10 sekarang harus terbuka
    for (let i = 0; i < 10; i++) {
      expect(scene.cards[i].isUnlocked).toBe(true);
    }

    // Level 11 sampai 20 WAJIB TERKUNCI (gembok)
    for (let i = 10; i < 20; i++) {
      expect(scene.cards[i].isUnlocked).toBe(false);
    }

    // Mengklik level terkunci (misal Level 11) harus memunculkan notifikasi bayar Rp 10.000
    const clickResult = scene.handleClick(scene.cards[10].x + 10, scene.cards[10].y + 10);
    expect(clickResult).toBeNull();
    expect(scene.lockedNoticeLevel).toBe(11);
  });

  it('pintu yang hancur / teleport di akhir level harus otomatis menjadi checkpoint aktif', async () => {
    const { Door } = await import('../src/entities/Door');
    const { Player } = await import('../src/entities/Player');

    const door = new Door(500, 300, { x: 50, y: 300 });
    const player = new Player();
    player.spawn(480, 300); // Mendekati pintu (jarak < 85px)

    expect(door.hasTeleported).toBe(false);
    expect(door.checkpoint).toBeUndefined();

    // Trigger pintu hancur / teleport
    door.update(player);

    expect(door.hasTeleported).toBe(true);
    expect(door.x).toBe(50); // Pindah ke target teleport
    expect(door.checkpoint).toBeDefined(); // Menjadi checkpoint di lokasi asal
    expect(door.checkpoint!.isActivated).toBe(true); // Checkpoint aktif
    expect(door.checkpoint!.x).toBe(504);
    expect(door.checkpoint!.y).toBe(308);

    // Saat reset (misal pemain respawn), pintu tidak balik ke lokasi awal
    door.reset();
    expect(door.x).toBe(50);
  });
});
