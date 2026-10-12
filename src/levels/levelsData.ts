// Data 10 Level Panjang Lengkap Stickman: The Trap Door (PRD v1.1 Bagian 6.1a & 6.2)

import { LevelData } from './LevelLoader';

/**
 * Helper untuk menyusun grid string berukuran lebar N tile secara konsisten
 */
function createGrid(width: number, height = 14, painter: (grid: string[][]) => void): string[] {
  const g: string[][] = [];
  for (let r = 0; r < height; r++) {
    g.push(new Array(width).fill('.'));
  }
  painter(g);
  return g.map(row => row.join(''));
}

function fillSolidFloor(g: string[][], startX: number, endX: number, floorRow = 11): void {
  for (let c = startX; c <= endX; c++) {
    if (c >= 0 && c < g[0].length) {
      g[floorRow][c] = '#';
      g[floorRow + 1][c] = '#';
      g[floorRow + 2][c] = '#';
    }
  }
}

function fillSolidCeiling(g: string[][], startX: number, endX: number): void {
  for (let c = startX; c <= endX; c++) {
    if (c >= 0 && c < g[0].length) {
      g[0][c] = '#';
    }
  }
}

export const LEVELS: LevelData[] = [
  // =========================================================================
  // LEVEL 1: Pintu Pertama (Tutorial Panjang - Lebar 160 Tile / 5.120 px)
  // Jebakan: T01 (Duri Statis), T03 (Lantai Runtuh), T20 (Lantai Hilang)
  // Jarak Spawn (x: 2) -> Pintu (x: 154) = 152 tile (4.864 px > 3.800 px)
  // Solusi: Lompati duri di sec 1, lari cepat di lantai runtuh sec 2, jangan diam di lantai hilang sec 3.
  // =========================================================================
  {
    id: 1,
    name: 'Pintu Pertama',
    tileSize: 32,
    grid: createGrid(160, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][159] = '#'; }
      fillSolidFloor(g, 1, 28, 11);
      fillSolidFloor(g, 33, 62, 11);
      fillSolidFloor(g, 68, 105, 11);
      fillSolidFloor(g, 110, 158, 11);

      g[10][3] = 'P';
      g[10][154] = 'D';

      // Pijakan di atas jurang sec 2 & sec 3
      g[9][64] = '#'; g[9][65] = '#';
      g[9][107] = '#'; g[9][108] = '#';
    }),
    entities: [
      // Sec 1: Tutorial Duri Statis T01
      { type: 'spikes', x: 18, y: 11, w: 3, orientation: 'up' },

      // Sec 2: Jurang dengan Lantai Runtuh T03
      { type: 'spikes', x: 29, y: 13, w: 4, orientation: 'up' },
      { type: 'crumble', x: 29, y: 11, w: 2 },
      { type: 'crumble', x: 31, y: 11, w: 2 },
      // Lantai bom 4 langkah setelah jebakan runtuh:
      { type: 'explodingFloor', x: 36, y: 11, w: 2 },

      // Sec 3: Lantai Hilang Saat Diinjak T20 (Langsung lenyap tanpa jeda)
      { type: 'vanishingFloor', x: 80, y: 11, w: 3, delay: 0 },
      { type: 'spikes', x: 80, y: 13, w: 3, orientation: 'up' },
      // Lantai bom 4 langkah setelah jebakan lantai hilang:
      { type: 'explodingFloor', x: 86, y: 11, w: 2 },

      // Sec 4: Duri statis terakhir sebelum pintu
      { type: 'spikes', x: 130, y: 11, w: 3, orientation: 'up' },
      { type: 'crumble', x: 140, y: 10, w: 2 }
    ],
    checkpoints: [
      { x: 42, y: 10 },
      { x: 92, y: 10 }
    ],
    deathMessages: [
      'Itu tadi duri merah.',
      'Lantainya tidak sanggup menahanmu.',
      'Perhatikan langkahmu, jalannya masih panjang!',
      'Respawn di checkpoint terdekat.'
    ]
  },

  // =========================================================================
  // LEVEL 2: Jangan Percaya Lantai (Lebar 160 Tile / 5.120 px)
  // Jebakan: T04 (Lantai Palsu), T02 (Duri Muncul Fix), T20 (Lantai Hilang), T23 (Lantai Jadi Duri)
  // Jarak Spawn (x: 2) -> Pintu (x: 154) = 4.864 px
  // =========================================================================
  {
    id: 2,
    name: 'Jangan Percaya Lantai',
    tileSize: 32,
    grid: createGrid(160, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][159] = '#'; }
      fillSolidFloor(g, 1, 35, 11);
      fillSolidFloor(g, 40, 75, 11);
      fillSolidFloor(g, 80, 120, 11);
      fillSolidFloor(g, 125, 158, 11);

      g[10][3] = 'P';
      g[10][154] = 'D';

      // Pijakan penghubung jurang
      g[9][37] = '#'; g[9][38] = '#';
      g[9][77] = '#'; g[9][78] = '#';
      g[9][122] = '#'; g[9][123] = '#';
    }),
    entities: [
      // Sec 1: Lantai Palsu T04
      { type: 'fakeFloor', x: 20, y: 11, w: 2 },
      { type: 'spikes', x: 19, y: 13, w: 4, orientation: 'up' },
      // Lantai bom 4 langkah setelah lubang lantai palsu:
      { type: 'explodingFloor', x: 25, y: 11, w: 2 },

      // Sec 2: Duri Muncul T02 (Versi diperbaiki di atas permukaan lantai)
      {
        type: 'hiddenSpikes',
        x: 60,
        y: 11,
        w: 3,
        trigger: { x: 55, y: 9, w: 3, h: 3 }
      },
      // Lantai bom 4 langkah setelah jebakan duri muncul:
      { type: 'explodingFloor', x: 66, y: 11, w: 2 },

      // Sec 3: Lantai Hilang T20 di atas jurang
      { type: 'vanishingFloor', x: 95, y: 11, w: 3 },
      { type: 'spikes', x: 94, y: 13, w: 5, orientation: 'up' },
      // Lantai bom 5 langkah setelah jurang lantai hilang:
      { type: 'explodingFloor', x: 102, y: 11, w: 2 },

      // Sec 4: Lantai Jadi Duri T23
      { type: 'spikeTransformFloor', x: 138, y: 11, w: 3 }
    ],
    checkpoints: [
      { x: 45, y: 10 },
      { x: 88, y: 10 }
    ],
    deathMessages: [
      'Lantainya tembus ya?',
      'Duri menyembul dari celah lantai!',
      'Lantai berubah jadi duri jika diam terlalu lama.',
      'Jangan percaya pada lantai manapun.'
    ]
  },

  // =========================================================================
  // LEVEL 3: Roda Bergigi (Lebar 165 Tile / 5.280 px)
  // Jebakan: T05 (Saw), T09 (Moving Platform), T24 (Trapdoor)
  // Solusi:
  // - Jurang 1: Gunakan platform bergerak T09 untuk menyeberang.
  // - Jurang 2: JALUR ATAS! Lompat ke platform x:83 -> x:88 -> x:92 untuk melewati Trapdoor (x:85)!
  //   Jangan lewat jalur bawah karena trapdoor akan membuka ke bawah.
  // - Jurang 3: Gunakan pijakan tengah x:132 untuk menyeberang dengan aman.
  // =========================================================================
  {
    id: 3,
    name: 'Roda Bergigi',
    tileSize: 32,
    grid: createGrid(165, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][164] = '#'; }
      fillSolidFloor(g, 1, 30, 11);
      fillSolidFloor(g, 45, 83, 11);
      fillSolidFloor(g, 88, 125, 11);
      fillSolidFloor(g, 140, 163, 11);

      g[10][3] = 'P';
      g[10][158] = 'D';

      // Jurang 1 (30-45): Pijakan bantu
      g[9][37] = '#'; g[9][38] = '#';

      // Jurang 2 (83-88) TRAPDOOR: JALUR ATAS TERSEDIA & SANGAT MUDAH DILOMPATI!
      // Jalur bawah adalah jembatan dengan Trapdoor T24 di tengahnya.
      // Jalur atas adalah 3 pijakan lebar di atas trapdoor:
      // Pijakan 1 (x: 82-84, y: 9), Pijakan 2 (x: 86-88, y: 7), Pijakan 3 (x: 90-92, y: 9)
      g[9][82] = '#'; g[9][83] = '#'; g[9][84] = '#';
      g[7][86] = '#'; g[7][87] = '#'; g[7][88] = '#';
      g[9][90] = '#'; g[9][91] = '#'; g[9][92] = '#';

      // Jurang 3 (125-140): Pijakan bantu tengah
      g[9][132] = '#'; g[9][133] = '#';
    }),
    entities: [
      // Jurang 1: Duri & Platform Bergerak T09
      { type: 'spikes', x: 31, y: 13, w: 14, orientation: 'up' },
      { type: 'movingPlatform', x: 32, y: 9, targetX: 36, targetY: 9, w: 3, speed: 75 },
      { type: 'movingPlatform', x: 39, y: 9, targetX: 43, targetY: 9, w: 3, speed: 75 },

      // Sec 2: Gergaji berputar T05
      { type: 'saw', x: 62, y: 7, targetX: 62, targetY: 10, radius: 20, speed: 90 },

      // Jurang 2: Trapdoor T24 di jalur bawah (terbuka jika diinjak) & Duri di bawahnya
      { type: 'spikes', x: 84, y: 13, w: 4, orientation: 'up' },
      { type: 'trapdoor', x: 84, y: 11, w: 4 },

      // Jurang 3: Platform troll jatuh T09 + Platform bantu
      { type: 'spikes', x: 126, y: 13, w: 14, orientation: 'up' },
      { type: 'movingPlatform', x: 127, y: 9, targetX: 131, targetY: 9, w: 3, speed: 85, trollFall: true },
      { type: 'movingPlatform', x: 134, y: 9, targetX: 138, targetY: 9, w: 3, speed: 85 },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah checkpoint 1 (x: 50): Lantai bom instan!
      { type: 'explodingFloor', x: 55, y: 11, w: 2 },
      // 5 langkah setelah checkpoint 2 (x: 100): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 105, y: 11, w: 2, trigger: { x: 103, y: 9, w: 3, h: 3 } }
    ],
    checkpoints: [
      { x: 50, y: 10 },
      { x: 100, y: 10 }
    ],
    deathMessages: [
      'Lantai bawah membuka ke jurang! Lewatlah jalur atas.',
      'Terpotong gergaji putar.',
      'Gunakan pijakan atas untuk melewati trapdoor.',
      'Platformnya jatuh bersamamu! Segera melompat.'
    ]
  },

  // =========================================================================
  // LEVEL 4: Dari Atas! (Lebar 170 Tile / 5.440 px)
  // Jebakan: T07 (Thwomp), T10 (Shooter), T25 (Falling Ceiling)
  // Jarak Spawn (x: 2) -> Pintu (x: 162) = 5.120 px
  // =========================================================================
  {
    id: 4,
    name: 'Dari Atas!',
    tileSize: 32,
    grid: createGrid(170, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][169] = '#'; }
      fillSolidCeiling(g, 0, 169);
      fillSolidFloor(g, 1, 168, 11);

      g[10][3] = 'P';
      g[10][162] = 'D';
    }),
    entities: [
      // Sec 1: Thwomp T07
      { type: 'thwomp', x: 25, y: 1, targetY: 9, w: 2, h: 2 },
      { type: 'thwomp', x: 45, y: 1, targetY: 9, w: 2, h: 2 },

      // Sec 2: Meriam Shooter T10
      { type: 'shooter', x: 85, y: 9, dirX: -1, interval: 1.8, projectileSpeed: 230 },

      // Sec 3: Langit-langit Jatuh T25
      { type: 'fallingCeiling', x: 115, y: 1, floorY: 11, w: 3 },
      { type: 'thwomp', x: 135, y: 1, targetY: 9, w: 2, h: 2 },
      { type: 'spikes', x: 145, y: 11, w: 4, orientation: 'up' },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah checkpoint 1 (x: 55): Lantai bom instan!
      { type: 'explodingFloor', x: 60, y: 11, w: 2 },
      // 5 langkah setelah checkpoint 2 (x: 100): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 105, y: 11, w: 2, trigger: { x: 103, y: 9, w: 3, h: 3 } }
    ],
    checkpoints: [
      { x: 55, y: 10 },
      { x: 100, y: 10 }
    ],
    deathMessages: [
      'Penyet dihantam balok atas.',
      'Langit-langit rontok menimpamu.',
      'Kena tembakan peluru panah.',
      'Pancing jebakannya jatuh dulu!'
    ]
  },

  // =========================================================================
  // LEVEL 5: Bendera Mencurigakan (Lebar 170 Tile / 5.440 px)
  // Jebakan: T13 (Fake Checkpoint), T12 (Fake Button), T22 (Exploding Floor)
  // Jarak Spawn (x: 2) -> Pintu (x: 164) = 5.184 px
  // =========================================================================
  {
    id: 5,
    name: 'Bendera Mencurigakan',
    tileSize: 32,
    grid: createGrid(170, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][169] = '#'; }
      fillSolidFloor(g, 1, 40, 11);
      fillSolidFloor(g, 45, 90, 11);
      fillSolidFloor(g, 95, 140, 11);
      fillSolidFloor(g, 145, 168, 11);

      g[10][3] = 'P';
      g[10][164] = 'D';

      // Pijakan penghubung jurang
      g[9][42] = '#'; g[9][43] = '#';
      g[9][92] = '#'; g[9][93] = '#';
      g[9][142] = '#'; g[9][143] = '#';
    }),
    entities: [
      // Sec 1: Fake Checkpoint T13 (Bendera pertama adalah jebakan duri!)
      { type: 'fakeCheckpoint', x: 30, y: 9 },

      // Sec 2: Fake Button T12 (Tombol memicu duri)
      { type: 'fakeButton', x: 68, y: 11 },

      // Sec 3: Lantai Meledak T22
      { type: 'explodingFloor', x: 115, y: 11, w: 2 },
      { type: 'spikes', x: 125, y: 11, w: 3, orientation: 'up' },

      // Sec 4: Duri kejutan sebelum pintu
      { type: 'hiddenSpikes', x: 152, y: 11, w: 3, trigger: { x: 148, y: 9, w: 2, h: 2 } },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah checkpoint 1 (x: 50): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 55, y: 11, w: 2, trigger: { x: 53, y: 9, w: 3, h: 3 } },
      // 5 langkah setelah checkpoint 2 (x: 100): Lantai bom instan!
      { type: 'explodingFloor', x: 105, y: 11, w: 2 }
    ],
    checkpoints: [
      { x: 50, y: 10 },
      { x: 100, y: 10 }
    ],
    // TROLL PINTU: Pintu keluar berteleportasi ke pertengahan level saat didekati!
    doorTeleport: { x: 70, y: 10 },
    deathMessages: [
      'Benderanya menusuk balik!',
      'Pintunya malah kabur ke tengah level!',
      'Tombol merah itu jebakan.',
      'Kena ledakan bom lantai.',
      'Lompati benda-benda mencurigakan!'
    ]
  },

  // =========================================================================
  // LEVEL 6: Naik Lalu Tertusuk (Lebar 175 Tile / 5.600 px)
  // Jebakan: T21 (Launcher Floor + Ceiling Spikes), T08 (Closing Wall), T06 (Sliding Saw)
  // Jarak Spawn (x: 2) -> Pintu (x: 168) = 5.312 px
  // =========================================================================
  {
    id: 6,
    name: 'Naik Lalu Tertusuk',
    tileSize: 32,
    grid: createGrid(175, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][174] = '#'; }
      fillSolidCeiling(g, 0, 174);
      fillSolidFloor(g, 1, 45, 11);
      fillSolidFloor(g, 55, 105, 11);
      fillSolidFloor(g, 115, 173, 11);

      g[10][3] = 'P';
      g[10][168] = 'D';

      // Ruangan peluncur
      for (let c = 20; c <= 35; c++) g[3][c] = '#';
      // Pijakan jurang
      g[9][48] = '#'; g[9][49] = '#';
      g[9][52] = '#'; g[9][53] = '#';
      g[9][108] = '#'; g[9][109] = '#';
      g[9][112] = '#'; g[9][113] = '#';
    }),
    entities: [
      // Sec 1: Launcher Floor T21 (Meluncur ke atas, duri atap turun)
      {
        type: 'launcherFloor',
        x: 24,
        y: 11,
        targetY: 6,
        ceilingSpikesY: 4,
        w: 2,
        count: 3
      },

      // Sec 2: Closing Wall T08
      {
        type: 'closingWall',
        x: 55,
        y: 2,
        targetX: 85,
        targetY: 2,
        w: 2,
        h: 9,
        trigger: { x: 60, y: 9, w: 2, h: 2 },
        speed: 130
      },

      // Sec 3: Sliding Saw T06
      {
        type: 'slidingSaw',
        x: 145,
        y: 10,
        targetX: 118,
        targetY: 10,
        trigger: { x: 122, y: 9, w: 2, h: 2 },
        radius: 20,
        speed: 380
      },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah checkpoint 1 (x: 58): Lantai bom instan!
      { type: 'explodingFloor', x: 63, y: 11, w: 2 },
      // 5 langkah setelah checkpoint 2 (x: 120): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 125, y: 11, w: 2, trigger: { x: 123, y: 9, w: 3, h: 3 } }
    ],
    checkpoints: [
      { x: 58, y: 10 },
      { x: 120, y: 10 }
    ],
    // TROLL PINTU: Pintu berteleportasi mundur ke tengah level saat didekati!
    doorTeleport: { x: 75, y: 10 },
    deathMessages: [
      'Tertusuk duri langit-langit.',
      'Dihimpit dinding menutup.',
      'Pintunya kabur ke belakang!',
      'Gergaji sergap datang dari depan!',
      'Melompatlah keluar sebelum platform sampai atap.'
    ]
  },

  // =========================================================================
  // LEVEL 7: Terbalik (Lebar 180 Tile / 5.760 px)
  // Jebakan: T16 (Gravity Zone), T17 (Invert Control Zone), T26 (Fake Spring)
  // Jarak Spawn (x: 2) -> Pintu (x: 172) = 5.440 px
  // =========================================================================
  {
    id: 7,
    name: 'Terbalik',
    tileSize: 32,
    grid: createGrid(180, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][179] = '#'; }
      fillSolidCeiling(g, 0, 179);
      fillSolidFloor(g, 1, 178, 11);

      g[10][3] = 'P';
      g[10][172] = 'D';

      for (let c = 30; c <= 60; c++) g[3][c] = '#';
    }),
    entities: [
      // Sec 1: Gravity Zone T16
      { type: 'gravityZone', x: 25, y: 3, w: 8, h: 7 },
      { type: 'spikes', x: 45, y: 4, w: 4, orientation: 'down' },

      // Sec 2: Invert Control Zone T17
      { type: 'invertControlZone', x: 85, y: 7, w: 8, h: 4 },
      { type: 'spikes', x: 98, y: 11, w: 4, orientation: 'up' },

      // Sec 3: Fake Spring T26 (Melontarkan ke duri atap)
      { type: 'fakeSpring', x: 135, y: 11 },
      { type: 'spikes', x: 134, y: 1, w: 4, orientation: 'down' },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah checkpoint 1 (x: 65): Lantai bom instan!
      { type: 'explodingFloor', x: 70, y: 11, w: 2 },
      // 5 langkah setelah checkpoint 2 (x: 115): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 120, y: 11, w: 2, trigger: { x: 118, y: 9, w: 3, h: 3 } }
    ],
    checkpoints: [
      { x: 65, y: 10 },
      { x: 115, y: 10 }
    ],
    deathMessages: [
      'Menabrak duri di atap.',
      'Kontrol terbalik membuatmu bingung?',
      'Pegas melontarkanmu ke bahaya.',
      'Fokus dan sesuaikan jemarimu.'
    ]
  },

  // =========================================================================
  // LEVEL 8: Laser Disko (Lebar 185 Tile / 5.920 px)
  // Jebakan: T11 (Laser), T27 (Chain Bomb), T05 (Saw), T09 (Moving Platform)
  // Jarak Spawn (x: 2) -> Pintu (x: 178) = 5.632 px
  // =========================================================================
  {
    id: 8,
    name: 'Laser Disko',
    tileSize: 32,
    grid: createGrid(185, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][184] = '#'; }
      fillSolidCeiling(g, 0, 184);
      fillSolidFloor(g, 1, 45, 11);
      fillSolidFloor(g, 55, 110, 11);
      fillSolidFloor(g, 120, 183, 11);

      g[10][3] = 'P';
      g[10][178] = 'D';

      // Pijakan jurang
      g[9][48] = '#'; g[9][49] = '#';
      g[9][52] = '#'; g[9][53] = '#';
      g[9][113] = '#'; g[9][114] = '#';
      g[9][117] = '#'; g[9][118] = '#';
    }),
    entities: [
      // Sec 1: Laser beritme T11
      { type: 'laser', x: 28, y: 1, w: 0.3, h: 10, on: 1.2, off: 1.2, offset: 0 },
      { type: 'laser', x: 38, y: 1, w: 0.3, h: 10, on: 1.2, off: 1.2, offset: 1.2 },

      // Sec 2: Chain Bomb T27
      { type: 'chainBomb', x: 70, y: 11, count: 6 },

      // Sec 3: Platform bergerak + Laser
      { type: 'movingPlatform', x: 125, y: 8, targetX: 140, targetY: 8, w: 3, speed: 80 },
      { type: 'laser', x: 133, y: 1, w: 0.3, h: 7, on: 1.1, off: 1.1, offset: 0.5 },
      { type: 'saw', x: 160, y: 7, targetX: 160, targetY: 10, radius: 18, speed: 110 },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah checkpoint 1 (x: 58): Lantai bom instan!
      { type: 'explodingFloor', x: 63, y: 11, w: 2 },
      // 5 langkah setelah checkpoint 2 (x: 125): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 130, y: 11, w: 2, trigger: { x: 128, y: 9, w: 3, h: 3 } }
    ],
    checkpoints: [
      { x: 58, y: 10 },
      { x: 125, y: 10 }
    ],
    deathMessages: [
      'Terbakar laser ritme.',
      'Bom berantai meledak di belakangmu.',
      'Gergaji disko memotong alurmu.',
      'Terus berlari dan lompati rintangan.'
    ]
  },

  // =========================================================================
  // LEVEL 9: Pintu Itu Bohong (Lebar 190 Tile / 6.080 px)
  // Jebakan: T14 (Fake Door), T15 (Running Door), T18 (Invisible Block), T22 (Exploding Floor)
  // Jarak Spawn (x: 2) -> Pintu Asli (x: 185) = 5.760 px
  // =========================================================================
  {
    id: 9,
    name: 'Pintu Itu Bohong',
    tileSize: 32,
    grid: createGrid(190, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][189] = '#'; }
      fillSolidCeiling(g, 0, 189);
      fillSolidFloor(g, 1, 45, 11);
      fillSolidFloor(g, 55, 115, 11);
      fillSolidFloor(g, 125, 188, 11);

      g[10][3] = 'P';
      g[10][185] = 'D';

      // Pijakan jurang
      g[9][48] = '#'; g[9][49] = '#';
      g[9][52] = '#'; g[9][53] = '#';
      g[9][118] = '#'; g[9][119] = '#';
      g[9][122] = '#'; g[9][123] = '#';
    }),
    entities: [
      // Sec 1: Fake Door 1 (T14) di tile 35
      { type: 'fakeDoor', x: 35, y: 9.5 },

      // Sec 2: Blok Tak Terlihat T18
      { type: 'invisibleBlock', x: 85, y: 7, w: 2, h: 1 },
      { type: 'spikes', x: 80, y: 11, w: 5, orientation: 'up' },

      // Sec 3: Lantai Meledak di depan pintu palsu 2
      { type: 'explodingFloor', x: 135, y: 11, w: 2 },
      { type: 'fakeDoor', x: 145, y: 9.5 },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah checkpoint 1 (x: 58): Lantai bom instan!
      { type: 'explodingFloor', x: 63, y: 11, w: 2 },
      // 5 langkah setelah checkpoint 2 (x: 128): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 133, y: 11, w: 2, trigger: { x: 131, y: 9, w: 3, h: 3 } }
    ],
    checkpoints: [
      { x: 58, y: 10 },
      { x: 128, y: 10 }
    ],
    // TROLL PINTU: Pintu berteleportasi balik ke titik AWAL START (tile 6)!
    doorTeleport: { x: 6, y: 10 },
    deathMessages: [
      'Pintunya kabur balik ke titik awal!',
      'Menabrak blok tak terlihat di atas jurang.',
      'Pintu kedua juga bohong.',
      'Kembalilah ke awal untuk menemukan pintu asli.'
    ]
  },

  // =========================================================================
  // LEVEL 10: Pintu Terakhir (GAUNTLET FINAL TROLL - Lebar 310 Tile / 9.920 px!)
  // Jebakan: Gabungan Semua Pola T01 - T27
  // Jarak Spawn (x: 2) -> Pintu (x: 302) = 300 tile (9.600 px > 3.800 px)
  // =========================================================================
  {
    id: 10,
    name: 'Pintu Terakhir',
    tileSize: 32,
    grid: createGrid(310, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][309] = '#'; }
      fillSolidCeiling(g, 0, 309);

      // Bagian 1 (0-60)
      fillSolidFloor(g, 1, 55, 11);
      // Bagian 2 (60-120)
      fillSolidFloor(g, 62, 115, 11);
      // Bagian 3 (120-180)
      fillSolidFloor(g, 125, 175, 11);
      // Bagian 4 (180-240)
      fillSolidFloor(g, 185, 235, 11);
      // Bagian 5 (240-310)
      fillSolidFloor(g, 245, 308, 11);

      g[10][3] = 'P';
      g[10][302] = 'D';

      // Pijakan penghubung jurang antarseksi
      g[9][58] = '#'; g[9][59] = '#';
      g[9][118] = '#'; g[9][119] = '#';
      g[9][122] = '#'; g[9][123] = '#';
      g[9][178] = '#'; g[9][179] = '#';
      g[9][182] = '#'; g[9][183] = '#';
      g[9][238] = '#'; g[9][239] = '#';
      g[9][242] = '#'; g[9][243] = '#';

      // Platform bertingkat di bagian akhir
      for (let c = 295; c <= 305; c++) g[5][c] = '#';
    }),
    entities: [
      // Bagian 1: Thwomp & Lantai Hilang
      { type: 'thwomp', x: 25, y: 1, targetY: 9, w: 2, h: 2 },
      { type: 'vanishingFloor', x: 40, y: 11, w: 3 },
      { type: 'spikes', x: 56, y: 13, w: 6, orientation: 'up' },

      // Bagian 2: Launcher Floor & Duri Muncul
      { type: 'launcherFloor', x: 75, y: 11, targetY: 6, ceilingSpikesY: 4, w: 2, count: 3 },
      { type: 'hiddenSpikes', x: 95, y: 11, w: 3, trigger: { x: 90, y: 9, w: 2, h: 2 } },
      { type: 'spikes', x: 116, y: 13, w: 9, orientation: 'up' },

      // Bagian 3: Chain Bomb & Sliding Saw
      { type: 'chainBomb', x: 135, y: 11, count: 6 },
      {
        type: 'slidingSaw',
        x: 172,
        y: 10,
        targetX: 150,
        targetY: 10,
        trigger: { x: 154, y: 9, w: 2, h: 2 },
        radius: 20,
        speed: 390
      },

      // Bagian 4: Laser & Trapdoor
      { type: 'laser', x: 195, y: 1, w: 0.3, h: 10, on: 1.1, off: 1.1, offset: 0 },
      { type: 'trapdoor', x: 210, y: 11, w: 4 },
      { type: 'spikes', x: 236, y: 13, w: 9, orientation: 'up' },

      // Bagian 5: Fake Door & Pintu Terakhir
      { type: 'fakeDoor', x: 260, y: 9.5 },
      { type: 'invisibleBlock', x: 290, y: 8, w: 2, h: 1 },

      // Jebakan gila pasca-checkpoint:
      // 5 langkah setelah cp 1 (x: 63): Lantai bom instan!
      { type: 'explodingFloor', x: 68, y: 11, w: 2 },
      // 5 langkah setelah cp 2 (x: 126): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 131, y: 11, w: 2, trigger: { x: 129, y: 9, w: 3, h: 3 } },
      // 5 langkah setelah cp 3 (x: 186): Lantai bom instan!
      { type: 'explodingFloor', x: 191, y: 11, w: 2 },
      // 5 langkah setelah cp 4 (x: 246): Duri muncul dari lantai!
      { type: 'hiddenSpikes', x: 251, y: 11, w: 2, trigger: { x: 249, y: 9, w: 3, h: 3 } }
    ],
    checkpoints: [
      { x: 63, y: 10 },
      { x: 126, y: 10 },
      { x: 186, y: 10 },
      { x: 246, y: 10 }
    ],
    // TROLL PINTU: Pintu akhir berteleportasi mundur ke seksi tengah (tile 140)!
    doorTeleport: { x: 140, y: 10 },
    deathMessages: [
      'Pintunya kabur ke tengah arena!',
      'Tinggal sedikit lagi di gauntlet akhir!',
      'Hampir sampai di pintu kemenangan sejati.',
      'Gunakan checkpoint secara maksimal!',
      'Konsentrasi penuh sampai akhir.'
    ]
  }
];
