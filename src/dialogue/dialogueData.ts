// Database Percakapan Stickman: The Trap Door (PRD & Dialogue Spec)
// Semua percakapan berupa teks visual berbahasa Indonesia kasual, kocak, sarkastik, dan ekspresif.

export type DialogueCategory =
  | 'IDLE'
  | 'DEATH'
  | 'RESPAWN'
  | 'NEAR_TRAP'
  | 'NEAR_DOOR'
  | 'VICTORY'
  | 'BEHAVIOR'
  | 'META';

export type DeathCause =
  | 'spikes'
  | 'hiddenSpikes'
  | 'saw'
  | 'slidingSaw'
  | 'thwomp'
  | 'fallingCeiling'
  | 'fallingPillar'
  | 'fakeFloor'
  | 'vanishingFloor'
  | 'trapdoor'
  | 'spikeTransformFloor'
  | 'launcherFloor'
  | 'explodingFloor'
  | 'chainBomb'
  | 'fakeCheckpoint'
  | 'fakeDoor'
  | 'fakeSpring'
  | 'fall'
  | 'general';

export const DIALOGUE_DATA = {
  // A. Saat pemain terlalu lama diam (Idle 5–10s)
  IDLE: [
    'Cepat gerak woi!',
    'Cepat, nak berak!',
    'Kita lagi main apa meditasi?',
    'WOI, keyboard-mu rusak ta?',
    'Aku digaji buat berdiri tok?',
    'Pintunya gak bakal nyamperin, Bos!',
    'Mau sampai kapan kita di sini?',
    'Aku sudah lumutan, Bos.',
    'Jalan, Bos, jalan!',
    'AFK kok di dalam game horor.',
    'Woi, kopi dulu ta?',
    'Ngelamun jorok ya, Bos?',
    'Kakiku kesemutan nungguin kamu...'
  ],

  // B. Kematian umum (Death General)
  DEATH_GENERAL: [
    'Kau bisa main gak sih?!',
    'Sakit dada ku oi!',
    'Baru juga jalan, anjir!',
    'Mata dipakai, Bos!',
    'Aku stickman, bukan tumbal!',
    'Lah, kok mati lagi?!',
    'Developer punya dendam sama aku!',
    'Aku belum siap meninggal!',
    'Padahal tadi sudah yakin...',
    'Waduh, karierku tamat.',
    'Kita pura-pura gak kenal aja.',
    'Bos, aku mau resign!',
    'Nyawaku bukan paket unlimited!',
    'Tolong jangan bikin aku malu...',
    'Aduh! Remuk tulang kartunku!'
  ],

  // Kematian spesifik berdasarkan penyebab
  DEATH_BY_CAUSE: {
    spikes: [
      'Itu duri, bukan karpet!',
      'Itu duri, bukan dekorasi!',
      'Duri tajam kok dipeluk, Bos!',
      'Sakit woi, ketusuk pantatku!'
    ],
    hiddenSpikes: [
      'LANTAINYA MENYEMBUL DURI!',
      'Duri dajjal keluar dari lantai!',
      'Mana kutahu lantainya berduri?!'
    ],
    fall: [
      'Gravitasi memang gak pernah bohong.',
      'Terbangnya keren, mendaratnya berantakan.',
      'Dasar jurang dingin banget, Bos.',
      'Aaaaaaa... tolong!'
    ],
    saw: [
      'Itu bukan tempat potong rambut!',
      'Kepalaku kepotong dua, Bos!',
      'Gergajinya tajem banget, ampun!',
      'Aku kebelah jadi dua!'
    ],
    slidingSaw: [
      'Gergaji ngebut dari mana tuh?!',
      'Kena tabrak lari gergaji!',
      'Gak ada akhlak itu gergaji!'
    ],
    crush: [
      'Aku bukan alas kaki!',
      'Penyet kayak tempe goreng!',
      'Kepalaku gepeng, Bos!',
      'Tertimpa beban hidup dan balok!'
    ],
    fakeFloor: [
      'LANTAINYA PENGKHIANAT!',
      'Lantai tembus tipu daya!',
      'Tuh kan! Lantainya gak nyata!'
    ],
    explosion: [
      'BOOM! Hangus jadi abu!',
      'Lantainya meledak, woi!',
      'Gak sempat lari, anjir!',
      'Gosong total badan tipisku!'
    ],
    fakeDoor: [
      'PINTUNYA MAKAN ORANG?!',
      'Pintu dajjal bertaring!',
      'Kirain pintu keluar beneran...'
    ],
    fakeCheckpoint: [
      'BENDERA PENGKHIANAT!',
      'Kirain aman, taunya ditusuk!',
      'Checkpoint palsu biadab!'
    ],
    launcher: [
      'DILONTARKAN KE DURI ATAP!',
      'Roket tanpa rem ke duri langit!',
      'Aduh, kepalaku kena atap!'
    ]
  } as Record<string, string[]>,

  // C. Saat karakter respawn
  RESPAWN: [
    'Hati-hati oi!',
    'Oke, kali ini jangan goblok.',
    'Aku masih trauma, Bos.',
    'Tolonglah, sekali ini aja.',
    'Kita pura-pura gak kenal jebakan tadi.',
    'Tarik napas... kita pasti bisa.',
    'Jangan injak yang aneh-aneh!',
    'Nyawa baru, kebodohan lama.',
    'Aku percaya kamu. Sedikit.',
    'Kali ini pakai otak, Bos.',
    'Tolong jangan kirim aku ke alam kubur lagi.',
    'Oke, aku sudah lupa rasa sakitnya. Bohong.',
    'Bismillah, semoga gak konyol lagi...'
  ],

  // D. Saat mendekati jebakan berbahaya
  NEAR_TRAP: [
    'Kok lantainya mencurigakan ya...',
    'Jangan-jangan ini jebakan...',
    'Bos, kita muter aja yuk?',
    'Aku punya firasat buruk.',
    'PELAAANNN! Aku belum siap!',
    'Kenapa lantainya terlalu mulus?',
    'Aku gak suka bentuk duri itu.',
    'Bos, boleh aku cuti dulu?',
    'Perasaanku mengatakan kita bakal mati.',
    'Aku mencium bau masalah.'
  ],

  // E. Saat hampir mencapai pintu keluar
  NEAR_DOOR: [
    'Wah, kayaknya kali ini aman...',
    'Jangan senang dulu, Bos.',
    'Akhirnya bisa pensiun!',
    'Pintunya kok terlalu baik ya?',
    'Aku gak percaya ini semudah itu...',
    'Sebentar lagi bebas!',
    'Kok aku malah curiga?',
    'Kalau pintunya meledak, aku berhenti.',
    'Jangan-jangan ini jebakan terakhir...',
    'Bos, kita sudah dekat. Jangan aneh-aneh.'
  ],

  // F. Saat berhasil menyelesaikan level
  VICTORY: [
    'LAH, KOK BISA?!',
    'Akhirnya kita bebas!',
    'Skill issue siapa sekarang?!',
    'Screenshot dulu, ini langka!',
    'Satu level lagi? Aku takut...',
    'AKHIRNYA GAK MATI!',
    'Aku bangga sama kita, Bos.',
    'Developer pasti kecewa.',
    'Nyawaku selamat untuk sementara.',
    'Level berikutnya pasti lebih jahat.'
  ],

  // G. Dialog khusus berdasarkan perilaku pemain
  BEHAVIORS: {
    DEATH_STREAK_3: 'Kenapa kita gak belajar dari kesalahan?',
    DEATH_STREAK_10: 'Aku sudah hafal alam kubur.',
    DEATH_STREAK_25: 'Developer punya dendam pribadi sama aku.',
    JUMP_SPAM: 'Burung apa kodok sih kita ini?',
    PACING: 'Bos, kamu sebenarnya tahu mau ke mana gak?',
    WALL_PUSH: 'Mau nembus tembok pakai doa?',
    IDLE_AFTER_RESPAWN: 'Takut ya? Sama, Bos.',
    NEAR_FALL_SAVE: 'IBU, AKU SAYANG IBU!',
    TOUGH_SECTION_PASS: 'Nah, gitu dong! Aku bangga!',
    VICTORY_HIGH_DEATHS: 'Akhirnya... cicilan nyawaku lunas.'
  },

  // H. Dialog meta: Stickman sadar dirinya berada di game
  META: [
    'Pencet tombolnya, Bos. Aku gak bisa buka pakai pikiran.',
    'Kita sudah melakukan ini berkali-kali. Siapa yang sebenarnya bodoh?',
    'Psst... Bos AFK. Ada yang mau pinjam nyawa gak?',
    'Developer yang bikin game ini siapa sih? Pengen ketemu aku.',
    'Kalau kamu baca ini, berarti aku masih hidup.',
    'Aku yakin yang bikin level ini ketawa sekarang.',
    'Tolong laporkan developer ke pihak berwajib.',
    'Aku cuma karakter. Kenapa hidupku sesulit ini?',
    'Dev FREEKS, kita perlu bicara.'
  ]
};

/**
 * Helper pengambil dialog acak yang menghindari pengulangan kalimat yang sama beruntun.
 */
export class DialoguePicker {
  private static recentLines: string[] = [];

  public static pick(pool: string[]): string {
    if (!pool || pool.length === 0) return '...';
    if (pool.length === 1) return pool[0];

    // Filter kalimat yang baru saja diucapkan
    const available = pool.filter(line => !DialoguePicker.recentLines.includes(line));
    const choices = available.length > 0 ? available : pool;
    const selected = choices[Math.floor(Math.random() * choices.length)];

    // Catat riwayat percakapan terbaru (maksimal 6 kalimat)
    DialoguePicker.recentLines.push(selected);
    if (DialoguePicker.recentLines.length > 6) {
      DialoguePicker.recentLines.shift();
    }

    return selected;
  }
}
