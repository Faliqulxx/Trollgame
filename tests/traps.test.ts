// Test Suite Jebakan & Aturan Anti-Bug (PRD v1.1 Bagian 4.6 & 5.3)

import { describe, it, expect } from 'vitest';
import { Player } from '../src/entities/Player';
import { HiddenSpikes } from '../src/entities/traps/HiddenSpikes';
import { VanishingFloor } from '../src/entities/traps/VanishingFloor';
import { LauncherFloor } from '../src/entities/traps/LauncherFloor';
import { ExplodingFloor } from '../src/entities/traps/ExplodingFloor';
import { Collision, Rect } from '../src/physics/Collision';

describe('Trap Mechanics & Anti-Bug Tests (v1.1)', () => {
  // ========================================================
  // B1 & 5.3: Duri Muncul Selalu di Atas Permukaan Lantai
  // ========================================================
  it('duri muncul (T02) harus menyembul di atas permukaan lantai dan mematikan pemain yang berdiri di atasnya', () => {
    const floorY = 200; // Permukaan lantai
    const trigger: Rect = { x: 50, y: 150, w: 100, h: 50 };
    const spikes = new HiddenSpikes('spike_t02', 100, floorY, 1, trigger, 32);

    // Pemain berdiri di atas lantai (kaki di y = 200, kepala di y = 160)
    const player = new Player(105, floorY - 40);

    // Sebelum dipicu: duri tersembunyi, tidak mematikan
    expect(spikes.isDeadly()).toBe(false);
    expect(spikes.getHitboxes().length).toBe(0);

    // Pemain masuk zona pemicu
    spikes.update(0.016, player);
    expect(spikes.isTriggered).toBe(true);

    // Jalankan update sampai duri menyembul (t > 0.08s)
    spikes.update(0.1, player);
    expect(spikes.isDeadly()).toBe(true);

    const hitboxes = spikes.getHitboxes();
    expect(hitboxes.length).toBeGreaterThan(0);

    // Hitbox harus berada DI ATAS lantai (y < floorY)
    const hb = hitboxes[0];
    expect(hb.y).toBeLessThan(floorY);
    expect(hb.y + hb.h).toBe(floorY);

    // Pemain yang berdiri di lantai harus bertabrakan dengan hitbox duri
    const isColliding = Collision.aabb(player.getHitbox(), hb);
    expect(isColliding).toBe(true);
  });

  // ========================================================
  // B1 Fix: Duri Statis T01 Tidak Boleh Terkubur di Dalam Tile Solid '#'
  // ========================================================
  it('duri statis (T01) pada LevelLoader harus menghapus solid grid di titiknya sehingga pemain mati jika menginjaknya', async () => {
    const { Level } = await import('../src/levels/LevelLoader');
    const mockLevelData = {
      id: 99,
      name: 'Test Level',
      grid: [
        '................',
        '................',
        'P...............',
        '################' // row 3 is all solid
      ],
      entities: [
        { type: 'spikes', x: 5, y: 3, w: 2, orientation: 'up' }
      ]
    };

    const level = new Level(mockLevelData);

    // Titik duri (kolom 5 dan 6 pada row 3) TIDAK BOLEH SOLID '#'
    expect(level.isSolidTileAt(5 * 32 + 16, 3 * 32 + 16)).toBe(false);
    expect(level.isSolidTileAt(6 * 32 + 16, 3 * 32 + 16)).toBe(false);
    // Kolom 4 (sebelum duri) tetap solid
    expect(level.isSolidTileAt(4 * 32 + 16, 3 * 32 + 16)).toBe(true);

    // Pemain jatuh ke tile duri (kolom 5, row 3)
    const player = new Player(5 * 32, 3 * 32 - 10);
    const spikeTrap = level.traps.find(t => t.type === 'spikes');
    expect(spikeTrap).toBeDefined();

    // Hitbox duri harus bertabrakan dengan pemain
    const hitboxes = spikeTrap!.getHitboxes();
    const hit = hitboxes.some(hb => Collision.aabb(player.getHitbox(), hb));
    expect(hit).toBe(true);
  });

  // ========================================================
  // T20: Lantai Hilang Saat Diinjak (Vanishing Floor)
  // ========================================================
  it('lantai hilang (T20) harus menjadi non-solid dalam <= 0.1s saat diinjak', () => {
    const floor = new VanishingFloor('vanish_1', 100, 200, 32, 32, 0.08);
    const player = new Player(105, 160); // Kaki di y = 200

    expect(floor.getSolidBox()).not.toBeNull();
    expect(floor.state).toBe('IDLE');

    // Injak lantai
    floor.update(0.016, player);
    expect(floor.state).toBe('ARMED');

    // Tunggu 0.08s
    floor.update(0.09, player);
    expect(floor.state).toBe('ACTIVE');
    // Solid box harus hilang!
    expect(floor.getSolidBox()).toBeNull();
  });

  // ========================================================
  // T21: Lantai Peluncur (Launcher Floor)
  // ========================================================
  it('lantai peluncur (T21) harus meluncur ke atas dan memunculkan duri atap', () => {
    const launcher = new LauncherFloor('launch_1', 100, 300, 100, 80, 48, 16, 3);
    const player = new Player(110, 260); // Kaki di platform (y = 300)

    launcher.update(0.016, player);
    expect(launcher.state).toBe('ARMED');

    // Selesai jeda 0.15s -> meluncur
    launcher.update(0.2, player);
    expect(launcher.state).toBe('LAUNCHING');
    expect(launcher.y).toBeLessThan(300);

    // Lanjutkan peluncuran sampai duri langit-langit muncul (jarak > 60%)
    launcher.update(0.4, player);
    expect(launcher.isDeadly()).toBe(true);
    expect(launcher.getHitboxes().length).toBeGreaterThan(0);
  });

  // ========================================================
  // T22: Lantai Meledak (Exploding Floor)
  // ========================================================
  it('lantai meledak (T22) harus memberi waktu peringatan lalu meledak dengan radius membunuh', () => {
    const bomb = new ExplodingFloor('bomb_1', 100, 200, 32, 32, 0.65);
    const player = new Player(105, 160);

    bomb.update(0.016, player);
    expect(bomb.state).toBe('ARMED');
    expect(bomb.isDeadly()).toBe(false);

    // Selama fase ARMED, belum mematikan
    bomb.update(0.3, player);
    expect(bomb.isDeadly()).toBe(false);

    // Lewat 0.65s -> meledak (ACTIVE)
    bomb.update(0.4, player);
    expect(bomb.state).toBe('ACTIVE');
    expect(bomb.isDeadly()).toBe(true);
    expect(bomb.getSolidBox()).toBeNull();

    // Pemain di radius ledakan harus terdeteksi tabrakan
    const hitboxes = bomb.getHitboxes();
    expect(Collision.aabb(player.getHitbox(), hitboxes[0])).toBe(true);
  });

  // ========================================================
  // B3: Semua Jebakan Wajib Reset() ke Kondisi Awal
  // ========================================================
  it('semua jebakan harus ter-reset kembali ke status awal saat respawn', () => {
    const trigger: Rect = { x: 50, y: 150, w: 100, h: 50 };
    const spikes = new HiddenSpikes('s1', 100, 200, 1, trigger);
    const vanish = new VanishingFloor('v1', 100, 200, 32, 32);
    const bomb = new ExplodingFloor('b1', 100, 200, 32, 32);
    const player = new Player(105, 160);

    // Picu semua
    spikes.update(0.2, player);
    vanish.update(0.016, player);
    vanish.update(0.2, player);
    bomb.update(0.016, player);
    bomb.update(0.8, player);

    expect(spikes.isTriggered).toBe(true);
    expect(vanish.state).toBe('ACTIVE');
    expect(bomb.state).not.toBe('IDLE');

    // Panggil reset()
    spikes.reset();
    vanish.reset();
    bomb.reset();

    expect(spikes.isTriggered).toBe(false);
    expect(spikes.isDeadly()).toBe(false);
    expect(vanish.state).toBe('IDLE');
    expect(vanish.getSolidBox()).not.toBeNull();
    expect(bomb.state).toBe('IDLE');
    expect(bomb.isDeadly()).toBe(false);
  });

  // ========================================================
  // T25 & T07: Jebakan Jatuh dari Atas (Falling Ceiling & Thwomp)
  // ========================================================
  it('FallingCeiling dan Thwomp aktif ketika pemain berjarak < 1 blok (32px) dan jatuh instan tanpa jeda', async () => {
    const { FallingCeiling } = await import('../src/entities/traps/FallingCeiling');
    const { Thwomp } = await import('../src/entities/traps/Thwomp');

    // Balok jatuh berada di x: 200, y: 32, lebar 64 (2 blok), mendarat di floorY: 352
    const trap = new FallingCeiling('fc_1', 200, 32, 352, 64, 32);
    const thwomp = new Thwomp('thw_1', 200, 32, 320, 64, 64);

    // 1. Pemain berada lebih dari 1 blok sebelum jebakan (misal x: 100, right edge = 116 < 200 - 32 = 168)
    const farPlayer = new Player(100, 320);
    trap.update(0.016, farPlayer);
    thwomp.update(0.016, farPlayer);
    expect(trap.state).toBe('IDLE');
    expect(thwomp.isDeadly()).toBe(false);

    // 2. Pemain mendekat hingga kurang dari 1 blok (< 32px dari x: 200, misal player.x = 160 -> right edge 176 > 168)
    const nearPlayer = new Player(160, 320);
    trap.update(0.016, nearPlayer);
    thwomp.update(0.016, nearPlayer);

    // Harus LANGSUNG jatuh seketika tanpa jeda/shaking!
    expect(trap.state).toBe('FALLING');
    expect(thwomp.isDeadly()).toBe(true);

    // 3. Saat balok baru mulai jatuh dan masih di atas (mid-air), pemain di bawah BELUM tertimpa/belum mati
    const playerBelow = new Player(210, 320);
    expect(trap.getHitboxes().some(hb => Collision.aabb(playerBelow.getHitbox(), hb))).toBe(false);
    expect(thwomp.getHitboxes().some(hb => Collision.aabb(playerBelow.getHitbox(), hb))).toBe(false);

    // 4. Setelah balok meluncur turun dan fisik balok mengenai pemain, barulah pemain tertimpa dan mati
    trap.update(0.4, playerBelow);
    thwomp.update(0.4, playerBelow);

    expect(trap.isDeadly()).toBe(true);
    expect(trap.getHitboxes().some(hb => Collision.aabb(playerBelow.getHitbox(), hb))).toBe(true);
    expect(thwomp.getHitboxes().some(hb => Collision.aabb(playerBelow.getHitbox(), hb))).toBe(true);
  });
});
