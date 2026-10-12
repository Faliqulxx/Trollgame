// Konfigurasi Terpusat Stickman: The Trap Door (PRD Bagian 4.2 & 8.2)

export const CONFIG = {
  // Resolusi Logis Canvas
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 540,
  TILE_SIZE: 32,

  // Fisika Karakter
  PLAYER: {
    WIDTH: 18,
    HEIGHT: 40,
    MAX_SPEED: 260,          // px/s
    ACCELERATION: 1800,      // px/s²
    FRICTION: 2200,          // px/s²
    GRAVITY: 2200,           // px/s²
    JUMP_SPEED: -720,        // px/s (negatif = ke atas)
    MAX_FALL_SPEED: 1000,    // px/s
    COYOTE_TIME: 0.18,       // detik toleransi lompat setelah meninggalkan tepi platform
    JUMP_BUFFER_TIME: 0.18,  // detik toleransi input sebelum mendarat di tanah
    VARIABLE_JUMP_MULTIPLIER: 0.5, // pemotongan kecepatan saat lepas tombol
  },

  // Game Loop & Performa
  PHYSICS: {
    FIXED_DELTA: 1 / 60,     // 60 Hz fixed timestep
    MAX_ACCUMULATOR: 0.1,    // mencegah spiral of death
    MAX_DT_CLAMP: 0.05,      // clamp per frame
  },

  // Timing
  DEATH_ANIMATION_DURATION: 0.6, // detik sebelum respawn
  LEVEL_TRANSITION_DELAY: 0.5,

  // Visual & Gaya Sketsa
  COLORS: {
    BG_PAPER: '#f6f3eb',
    GRID_LINE: '#e8e2d2',
    STICKMAN: '#18181c',
    STICKMAN_EYE: '#ffffff',
    SOLID_BLOCK: '#2b2b36',
    SOLID_BLOCK_FILL: '#383846',
    HAZARD_RED: '#e63946',
    EXIT_GREEN: '#2a9d8f',
    CHECKPOINT_BLUE: '#3a86ff',
    HINT_YELLOW: '#ffb703',
    TEXT_DARK: '#1f1f24',
    WHITE: '#ffffff',
    SHADOW: 'rgba(0, 0, 0, 0.12)'
  },

  // Audio Synthesis
  AUDIO: {
    DEFAULT_SFX_VOLUME: 0.8,
    DEFAULT_BGM_VOLUME: 0.35
  },

  TOTAL_LEVELS: 10
} as const;
