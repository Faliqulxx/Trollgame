// Generator Data 300 Pemain Papan Peringkat Troll
import { LeaderboardEntry } from './Storage';

// Bank nama unik troll & gamer Indonesia/global
const PREFIXES = [
  'Dev', 'Pro', 'Si Paling', 'Kang', 'Master', 'Lord', 'Suhu', 'Sepuh',
  'Bocah', 'Raja', 'Sultan', 'Kapten', 'Detektif', 'Tukang', 'Korban',
  'Pejuang', 'Pakar', 'Dewa', 'Pendekar', 'Penyintas', 'Bintang', 'Ahli',
  'Juara', 'Spam', 'Idol', 'Hantu', 'Ninja', 'Samurai', 'Wibu', 'Gamer'
];

const NOUNS = [
  'FREEKS', 'Master', 'Sabar', 'Jebakan', 'Duri', 'Loncat', 'Troll',
  'Emosi', 'Checkpoint', 'Pintu', 'Runtuh', 'Bom', 'Ambles', 'Spasi',
  'Keyboard', 'Mouse', 'AltF4', 'Gauntlet', 'Laser', 'Gergaji', 'Ragdoll',
  'Tengkorak', 'Hoki', 'Refleks', 'Panic', 'Rush', 'Parkour', 'Speedrun',
  'Tilt', 'Stres', 'Gagal', 'Nangis', 'Batu', 'Licik', 'Kepleset',
  'Ghost', 'Legend', 'Wibu', 'Noob', 'Santuy'
];

const SUFFIXES = [
  '', 'ID', 'X', '99', 'GG', 'V2', 'Top', 'Z', 'Prime', 'OP',
  'Jr', '007', 'Max', 'Ultra', 'Savage', 'Gaming', 'Reborn', '101'
];

// Nama-nama khusus ikonik yang wajib ada
const SPECIAL_NAMES: { name: string; level: number; deaths: number }[] = [
  { name: 'Dev FREEKS', level: 10, deaths: 485 },
  { name: 'Pro Master', level: 9, deaths: 395 },
  { name: 'Si Paling Sabar', level: 8, deaths: 320 },
  { name: 'Troll King', level: 7, deaths: 275 },
  { name: 'Sepuh Jebakan', level: 6, deaths: 230 },
  { name: 'Korban Jebakan', level: 5, deaths: 185 },
  { name: 'Pejuang Checkpoint', level: 4, deaths: 140 },
  { name: 'Spam Spasi', level: 3, deaths: 95 },
  { name: 'Kang Emosi', level: 2, deaths: 68 },
  { name: 'Noob Abadi', level: 1, deaths: 42 }
];

/**
 * Generate 300 entri leaderboard dengan kriteria:
 * 1. Total 300 pemain unik.
 * 2. Tidak ada yang mati kurang dari 38 (totalDeaths >= 38).
 * 3. Semakin top levelnya, semakin banyak kematiannya (dengan variasi acak/random).
 */
export function generateDefaultLeaderboard(): LeaderboardEntry[] {
  const result: LeaderboardEntry[] = [];
  const usedNames = new Set<string>();

  // 1. Masukkan nama-nama spesial ikonik terlebih dahulu
  for (const s of SPECIAL_NAMES) {
    usedNames.add(s.name.toLowerCase());
    result.push({
      username: s.name,
      maxLevel: s.level,
      totalDeaths: Math.max(38, s.deaths),
      updatedAt: 1728000000000 + Math.floor(Math.random() * 100000000)
    });
  }

  // 2. Distribusi sisa 290 bot ke Level 10 sampai Level 1
  // Semakin tinggi level, semakin banyak matinya tapi acak
  const levelDistributions: { level: number; count: number; minDeaths: number; maxDeaths: number }[] = [
    { level: 10, count: 14, minDeaths: 310, maxDeaths: 520 }, // Level 10 (Total 15 dgn Dev FREEKS)
    { level: 9,  count: 24, minDeaths: 260, maxDeaths: 440 }, // Level 9 (Total 25 dgn Pro Master)
    { level: 8,  count: 29, minDeaths: 210, maxDeaths: 370 }, // Level 8 (Total 30 dgn Si Paling Sabar)
    { level: 7,  count: 34, minDeaths: 170, maxDeaths: 320 }, // Level 7 (Total 35 dgn Troll King)
    { level: 6,  count: 39, minDeaths: 135, maxDeaths: 270 }, // Level 6 (Total 40 dgn Sepuh Jebakan)
    { level: 5,  count: 39, minDeaths: 105, maxDeaths: 220 }, // Level 5 (Total 40 dgn Korban Jebakan)
    { level: 4,  count: 34, minDeaths: 80,  maxDeaths: 175 }, // Level 4 (Total 35 dgn Pejuang Checkpoint)
    { level: 3,  count: 29, minDeaths: 60,  maxDeaths: 135 }, // Level 3 (Total 30 dgn Spam Spasi)
    { level: 2,  count: 24, minDeaths: 45,  maxDeaths: 95 },  // Level 2 (Total 25 dgn Kang Emosi)
    { level: 1,  count: 24, minDeaths: 38,  maxDeaths: 72 }   // Level 1 (Total 25 dgn Noob Abadi)
  ];

  let nameSeed = 1;

  for (const dist of levelDistributions) {
    for (let i = 0; i < dist.count; i++) {
      // Buat nama unik
      let name = '';
      let attempts = 0;
      while (!name || usedNames.has(name.toLowerCase())) {
        attempts++;
        if (attempts < 50) {
          const p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
          const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
          const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
          name = s ? `${p} ${n} ${s}` : `${p} ${n}`;
        } else {
          name = `TrollPlayer ${nameSeed++}`;
        }
      }
      usedNames.add(name.toLowerCase());

      // Kematian: tidak ada yang kurang dari 38, acak di rentang level
      const deaths = Math.max(
        38,
        dist.minDeaths + Math.floor(Math.random() * (dist.maxDeaths - dist.minDeaths + 1))
      );

      result.push({
        username: name,
        maxLevel: dist.level,
        totalDeaths: deaths,
        updatedAt: 1728000000000 + Math.floor(Math.random() * 100000000)
      });
    }
  }

  return result;
}
