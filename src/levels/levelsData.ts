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

      // Sec 2: Falling Pillar (Muncul dari bawah tanah setelah dilewati, lalu tumbang ke depan menimpa pemain!)
      {
        type: 'fallingPillar',
        x: 65,
        y: 11,
        floorY: 11,
        w: 1.5,
        h: 7.5
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

      // Jebakan pasca-checkpoint:
      // Setelah lolos dari pilar roboh: Lantai bom instan!
      { type: 'explodingFloor', x: 76, y: 11, w: 2 },
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
      'Tertimpa pilar roboh! Lari terus jangan berhenti!',
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
  // =========================================================================
  // LEVEL 7: Menara Pilihan (Konsep Vertikal: Memanjat Blok Bercabang)
  // Tinggi: 42 Tile (1.344 px), Naik ke atas melalui 11 tingkat percabangan.
  // Di setiap tingkat cabang, hanya ada 1 jalan/blok yang benar (solid).
  // Blok yang salah adalah lantai palsu (fakeFloor / ambles) atau duri!
  // =========================================================================
  {
    id: 7,
    name: 'Menara Pilihan',
    tileSize: 32,
    grid: createGrid(50, 42, (g) => {
      // 1. Batas Dinding & Atap Menara
      for (let r = 0; r < 42; r++) {
        g[r][2] = '#';
        g[r][47] = '#';
      }
      for (let c = 2; c <= 47; c++) {
        g[0][c] = '#';
      }

      // 2. Lantai Dasar
      fillSolidFloor(g, 3, 12, 39);   // Platform spawn pemain (kiri)
      fillSolidFloor(g, 35, 46, 39);  // Platform kanan

      // 3. Titik Spawn Pemain (Lantai Dasar)
      g[38][5] = 'P';

      // 4. Tingkat 1 (Row 36): Kiri (Benar) vs Kanan (Salah)
      g[36][10] = '#'; g[36][11] = '#'; g[36][12] = '#'; // BENAR
      g[36][16] = '#'; g[36][17] = '#'; g[36][18] = '#'; // SALAH (fakeFloor)

      // 5. Tingkat 2 (Row 33): Kiri (Salah) vs Tengah (Benar) vs Kanan (Salah)
      g[33][7] = '#'; g[33][8] = '#'; g[33][9] = '#';   // SALAH (fakeFloor)
      g[33][14] = '#'; g[33][15] = '#'; g[33][16] = '#'; // BENAR
      g[33][21] = '#'; g[33][22] = '#'; g[33][23] = '#'; // SALAH (spikeTransformFloor)

      // 6. Tingkat 3 (Row 30): Kiri (Salah) vs Kanan (Benar)
      g[30][10] = '#'; g[30][11] = '#'; g[30][12] = '#'; // SALAH (fakeFloor)
      g[30][19] = '#'; g[30][20] = '#'; g[30][21] = '#'; // BENAR

      // 7. Tingkat 4 (Row 27): Kiri (Benar + Checkpoint 1) vs Kanan (Salah)
      for (let c = 8; c <= 12; c++) g[27][c] = '#';       // Platform Checkpoint 1
      g[27][14] = '#'; g[27][15] = '#'; g[27][16] = '#'; // BENAR
      g[27][23] = '#'; g[27][24] = '#'; g[27][25] = '#'; // SALAH (fakeFloor)

      // 8. Tingkat 5 (Row 24): Kiri (Salah) vs Tengah (Salah) vs Kanan (Benar)
      g[24][10] = '#'; g[24][11] = '#'; g[24][12] = '#'; // SALAH (fakeFloor)
      g[24][16] = '#'; g[24][17] = '#'; g[24][18] = '#'; // SALAH (crumble)
      g[24][21] = '#'; g[24][22] = '#'; g[24][23] = '#'; // BENAR

      // 9. Tingkat 6 (Row 21): Kiri (Benar) vs Kanan (Salah)
      g[21][15] = '#'; g[21][16] = '#'; g[21][17] = '#'; // BENAR
      g[21][24] = '#'; g[21][25] = '#'; g[21][26] = '#'; // SALAH (fakeFloor)

      // 10. Tingkat 7 (Row 18): Kiri (Salah) vs Tengah (Benar) vs Kanan (Salah)
      g[18][10] = '#'; g[18][11] = '#'; g[18][12] = '#'; // SALAH (fakeFloor)
      g[18][17] = '#'; g[18][18] = '#'; g[18][19] = '#'; // BENAR
      g[18][24] = '#'; g[18][25] = '#'; g[18][26] = '#'; // SALAH (spikeTransformFloor)

      // 11. Tingkat 8 (Row 15): Kiri (Salah) vs Kanan (Benar + Checkpoint 2)
      g[15][12] = '#'; g[15][13] = '#'; g[15][14] = '#'; // SALAH (fakeFloor)
      g[15][21] = '#'; g[15][22] = '#'; g[15][23] = '#'; // BENAR
      for (let c = 25; c <= 29; c++) g[15][c] = '#';       // Platform Checkpoint 2

      // 12. Tingkat 9 (Row 12): Kiri (Benar) vs Tengah (Salah) vs Kanan (Salah)
      g[12][16] = '#'; g[12][17] = '#'; g[12][18] = '#'; // BENAR
      g[12][22] = '#'; g[12][23] = '#'; g[12][24] = '#'; // SALAH (fakeFloor)
      g[12][28] = '#'; g[12][29] = '#'; g[12][30] = '#'; // SALAH (fakeFloor)

      // 13. Tingkat 10 (Row 9): Kiri (Salah) vs Kanan (Benar)
      g[9][12] = '#'; g[9][13] = '#'; g[9][14] = '#';   // SALAH (fakeFloor)
      g[9][21] = '#'; g[9][22] = '#'; g[9][23] = '#';   // BENAR

      // 14. Tingkat 11 (Row 6): Kiri (Benar) vs Kanan (Salah)
      g[6][16] = '#'; g[6][17] = '#'; g[6][18] = '#';   // BENAR
      g[6][24] = '#'; g[6][25] = '#'; g[6][26] = '#';   // SALAH (fakeFloor)

      // 15. Puncak Menara (Row 3): Platform Puncak & Pintu Keluar
      for (let c = 16; c <= 26; c++) g[3][c] = '#';
      g[2][21] = 'D'; // PINTU KELUAR
    }),
    entities: [
      // Duri di jurang lantai dasar (bawah blok-blok cabang)
      { type: 'spikes', x: 13, y: 40, w: 22, orientation: 'up' },

      // Tingkat 1: Blok Kanan Salah (Ambles)
      { type: 'fakeFloor', x: 16, y: 36, w: 3 },

      // Tingkat 2: Blok Kiri Salah & Blok Kanan Spike Transform
      { type: 'fakeFloor', x: 7, y: 33, w: 3 },
      { type: 'spikeTransformFloor', x: 21, y: 33, w: 3 },

      // Tingkat 3: Blok Kiri Salah
      { type: 'fakeFloor', x: 10, y: 30, w: 3 },

      // Tingkat 4: Blok Kanan Salah
      { type: 'fakeFloor', x: 23, y: 27, w: 3 },

      // Tingkat 5: Blok Kiri Salah & Blok Tengah Crumble Runtuh
      { type: 'fakeFloor', x: 10, y: 24, w: 3 },
      { type: 'crumble', x: 16, y: 24, w: 3 },

      // Tingkat 6: Blok Kanan Salah
      { type: 'fakeFloor', x: 24, y: 21, w: 3 },

      // Tingkat 7: Blok Kiri Salah & Blok Kanan Spike Transform
      { type: 'fakeFloor', x: 10, y: 18, w: 3 },
      { type: 'spikeTransformFloor', x: 24, y: 18, w: 3 },

      // Tingkat 8: Blok Kiri Salah
      { type: 'fakeFloor', x: 12, y: 15, w: 3 },

      // Tingkat 9: Blok Tengah & Kanan Salah
      { type: 'fakeFloor', x: 22, y: 12, w: 3 },
      { type: 'fakeFloor', x: 28, y: 12, w: 3 },

      // Tingkat 10: Blok Kiri Salah
      { type: 'fakeFloor', x: 12, y: 9, w: 3 },

      // Tingkat 11: Blok Kanan Salah
      { type: 'fakeFloor', x: 24, y: 6, w: 3 }
    ],
    checkpoints: [
      { x: 9, y: 26 },   // Checkpoint 1 (Tingkat 4)
      { x: 27, y: 14 }   // Checkpoint 2 (Tingkat 8)
    ],
    deathMessages: [
      'Salah pilih cabang! Yang itu lantai palsu.',
      'Hanya ada satu jalan yang benar di setiap tingkat.',
      'Perhatikan dan ingat-ingat cabang yang kokoh!',
      'Hampir saja sampai puncak, coba lagi!'
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
  // =========================================================================
  // LEVEL 9: Pintu Itu Bohong (Lebar 190 Tile / 6.080 px)
  // Jebakan: T14 (Fake Door), T18 (Invisible Block), T22 (Exploding Floor), 
  //          T25 (Falling Ceiling - berhenti setelah loncat!), T05 (Saw), 
  //          T06 (Sliding Saw), T03 (Crumble), T04 (Fake Floor), T23 (Spike Transform)
  // Jarak Spawn (x: 2) -> Pintu Asli (x: 184) = 5.760 px
  // =========================================================================
  {
    id: 9,
    name: 'Pintu Itu Bohong',
    tileSize: 32,
    grid: createGrid(190, 14, (g) => {
      for (let r = 0; r < 14; r++) { g[r][0] = '#'; g[r][189] = '#'; }
      fillSolidCeiling(g, 0, 189);

      // Seksi 1: Platform Lantai & Jurang Mini (x: 1 s.d. 45)
      fillSolidFloor(g, 1, 19, 11);
      // Lubang duri x: 20..21
      fillSolidFloor(g, 22, 31, 11);
      // Lantai runtuh x: 32..33
      fillSolidFloor(g, 34, 45, 11);

      // Jurang 1 (x: 46 s.d. 54) & Pijakan
      g[9][48] = '#'; g[9][49] = '#';
      g[9][52] = '#'; g[9][53] = '#';

      // Seksi 2: Platform Lantai & Jurang Mini (x: 55 s.d. 115)
      fillSolidFloor(g, 55, 73, 11);
      // Pijakan melayang di atas duri x: 74..77
      g[8][74] = '#'; g[8][75] = '#'; g[8][76] = '#';
      fillSolidFloor(g, 78, 82, 11);
      // Jurang mini x: 83..84
      fillSolidFloor(g, 85, 93, 11);
      // Jurang mini x: 94..96
      fillSolidFloor(g, 97, 115, 11);

      // Jurang 2 (x: 116 s.d. 124) & Pijakan
      g[9][118] = '#'; g[9][119] = '#';
      g[9][122] = '#'; g[9][123] = '#';

      // Seksi 3: Platform Lantai & Jurang Mini Menuju Pintu (x: 125 s.d. 188)
      fillSolidFloor(g, 125, 142, 11);
      // Jurang mini x: 143..144 (sebelum atap jatuh)
      fillSolidFloor(g, 145, 188, 11);

      g[10][3] = 'P';
      g[10][184] = 'D';
    }),
    entities: [
      // -----------------------------------------------------------------------
      // SEKSI 1: Rintangan Variatif & Atap Jatuh 1
      // -----------------------------------------------------------------------
      { type: 'spikes', x: 12, y: 11, w: 2, orientation: 'up' },
      { type: 'spikes', x: 20, y: 11, w: 2, orientation: 'up' },

      // Atap Jatuh 1: Pemain loncat lewat duri x:20..21, mendarat di x:22..24.
      // Harus berhenti karena atap di x:25 runtuh jatuh!
      { type: 'fallingCeiling', x: 25, y: 1, floorY: 11, w: 2 },

      // Lantai runtuh T03
      { type: 'crumble', x: 32, y: 11, w: 2 },

      // Fake Door 1 (T14) di tile 38
      { type: 'fakeDoor', x: 38, y: 9.5 },

      // Duri tersembunyi sebelum jurang 1
      { type: 'hiddenSpikes', x: 43, y: 11, w: 2, trigger: { x: 41, y: 9, w: 3, h: 3 } },

      // -----------------------------------------------------------------------
      // SEKSI 2: Checkpoint 1, Duri, Atap Jatuh 2, & Gergaji Meluncur
      // -----------------------------------------------------------------------
      // Bom aman berjarak 8 tile dari Checkpoint 1 (x: 58)
      { type: 'explodingFloor', x: 66, y: 11, w: 2 },

      // Kolam duri dengan pijakan melayang di atasnya
      { type: 'spikes', x: 74, y: 11, w: 4, orientation: 'up' },

      // Atap Jatuh 2: Pemain loncat lewat jurang mini x:83..84, mendarat di x:85..86.
      // Harus berhenti karena atap di x:88 langsung jatuh menimpa!
      { type: 'fallingCeiling', x: 88, y: 1, floorY: 11, w: 2 },

      // Blok Tak Terlihat T18 di atas jurang mini x:94..96
      { type: 'invisibleBlock', x: 95, y: 7, w: 2, h: 1 },

      // Gergaji Meluncur Cepat T06
      { type: 'slidingSaw', x: 110, y: 10, targetX: 102, targetY: 10, trigger: { x: 99, y: 8, w: 3, h: 4 }, radius: 18, speed: 320 },

      // Lantai Ambles T04 sebelum jurang 2
      { type: 'fakeFloor', x: 113, y: 11, w: 2 },

      // -----------------------------------------------------------------------
      // SEKSI 3: Checkpoint 2 (BEBAS BUG TUMPANG TINDIH!), Atap Jatuh 3, & Pintu Asli
      // -----------------------------------------------------------------------
      // Duri tersembunyi berjarak lega 7 tile dari Checkpoint 2 (x: 128)
      { type: 'hiddenSpikes', x: 135, y: 11, w: 2, trigger: { x: 133, y: 9, w: 3, h: 3 } },

      // Atap Jatuh 3: Pemain loncat lewat jurang mini x:143..144, mendarat di x:145..146.
      // Harus BERHENTI setelah loncat karena atap tersembunyi di x:147 jatuh berdebum!
      { type: 'fallingCeiling', x: 147, y: 1, floorY: 11, w: 2 },

      // Lantai Meledak: Diposisikan di x:154 (selisih 19 tile dari duri di x:135, TIDAK TUMPANG TINDIH!)
      { type: 'explodingFloor', x: 154, y: 11, w: 2 },

      // Fake Door 2 (T14) di tile 162
      { type: 'fakeDoor', x: 162, y: 9.5 },

      // Gergaji vertikal naik-turun T05
      { type: 'saw', x: 170, y: 8, targetX: 170, targetY: 10, radius: 18, speed: 100 },

      // Lantai Berubah Jadi Duri T23
      { type: 'spikeTransformFloor', x: 177, y: 11, w: 2 }
    ],
    checkpoints: [
      { x: 58, y: 10 },
      { x: 128, y: 10 }
    ],
    // TROLL PINTU: Pintu berteleportasi balik ke titik AWAL START (tile 6)!
    doorTeleport: { x: 6, y: 10 },
    deathMessages: [
      'Pintunya kabur balik ke titik awal!',
      'Atap tersembunyi menimpamu! Berhentilah sejenak setelah loncat.',
      'Menabrak blok tak terlihat di atas jurang.',
      'Pintu kedua juga bohong.',
      'Jangan terburu-buru, perhatikan sekitar!'
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
