// Sintesis Audio Web Audio API Murni (PRD Bagian 9 & 10.1)

import { Storage } from './Storage';

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private bgmPlaying = false;
  private bgmTimer: number | null = null;
  private bgmNoteIndex = 0;

  // Catatan melodi chiptune yang ceria & agak troll
  private melodyNotes = [
    261.63, 329.63, 392.00, 523.25, 392.00, 329.63, // C4, E4, G4, C5, G4, E4
    293.66, 349.23, 440.00, 587.33, 440.00, 349.23, // D4, F4, A4, D5, A4, F4
    329.63, 392.00, 493.88, 659.25, 493.88, 392.00, // E4, G4, B4, E5, B4, G4
    261.63, 329.63, 392.00, 523.25, 493.88, 392.00  // C4, E4, G4, C5, B4, G4
  ];

  // Daftar audio meme kematian di folder public/Sound
  private deathSoundUrls = [
    '/Sound/akh.mp3',
    '/Sound/cat-laugh-meme-1.mp3',
    '/Sound/chicken-on-tree-screaming.mp3',
    '/Sound/faaah.mp3',
    '/Sound/hidup-jokowi.mp3',
    '/Sound/jokowi-saya-masih-sanggup-2.mp3',
    '/Sound/ketawa-bocil-alok.mp3',
    '/Sound/movie_1.mp3',
    '/Sound/prabowo-sorry-ye.mp3',
    '/Sound/tololllll.mp3'
  ];
  private currentDeathAudio: HTMLAudioElement | null = null;

  private constructor() {
    // Inisialisasi AudioContext pada interaksi pengguna pertama
    if (typeof window !== 'undefined') {
      const initCtx = () => {
        this.init();
        window.removeEventListener('click', initCtx);
        window.removeEventListener('keydown', initCtx);
        window.removeEventListener('touchstart', initCtx);
      };

      window.addEventListener('click', initCtx);
      window.addEventListener('keydown', initCtx);
      window.addEventListener('touchstart', initCtx);

      this.preloadDeathSounds();
    }
  }

  private preloadDeathSounds(): void {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
    try {
      for (const url of this.deathSoundUrls) {
        const a = new Audio();
        a.preload = 'auto';
        a.src = url;
      }
    } catch {
      // Ignore
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getSFXGain(): number {
    return Storage.getData().settings.sfx;
  }

  private getBGMGain(): number {
    return Storage.getData().settings.music;
  }

  /**
   * SFX: Lompat (Nada naik pendek)
   */
  public playJump(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

      gain.gain.setValueAtTime(0.2 * this.getSFXGain(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Abaikan jika browser belum membuka audio context
    }
  }

  /**
   * SFX: Mendarat (Thud rendah pendek)
   */
  public playLand(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

      gain.gain.setValueAtTime(0.25 * this.getSFXGain(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  /**
   * SFX: Mati (Random meme sound dari folder public/Sound)
   */
  public playDeath(): void {
    if (this.isMuted) return;

    if (typeof Audio !== 'undefined') {
      try {
        if (this.currentDeathAudio) {
          this.currentDeathAudio.pause();
          this.currentDeathAudio.currentTime = 0;
        }

        const randomIndex = Math.floor(Math.random() * this.deathSoundUrls.length);
        const url = this.deathSoundUrls[randomIndex];
        const audio = new Audio(url);
        audio.volume = Math.max(0, Math.min(1, 0.9 * this.getSFXGain()));
        this.currentDeathAudio = audio;
        audio.play().catch(() => {
          this.playSynthDeath();
        });
        return;
      } catch {
        // Fallback ke synthesizer
      }
    }

    this.playSynthDeath();
  }

  /**
   * SFX: Mati Fallback Synthesizer
   */
  public playSynthDeath(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

      gain.gain.setValueAtTime(0.35 * this.getSFXGain(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  /**
   * SFX: Lantai Runtuh (Gemuruh noise rendah)
   */
  public playCrumble(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.getSFXGain(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Ignore
    }
  }

  /**
   * SFX: Jebakan Muncul Tiba-tiba (Stinger tajam)
   */
  public playStinger(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(920, now + 0.05);

      gain.gain.setValueAtTime(0.22 * this.getSFXGain(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }

  /**
   * SFX: Checkpoint (Dua nada ceria)
   */
  public playCheckpoint(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.09); // E5

      gain.gain.setValueAtTime(0.25 * this.getSFXGain(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignore
    }
  }

  /**
   * SFX: Level Selesai (Arpeggio kemenangan ceria)
   */
  public playWin(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25 * this.getSFXGain(), start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.23);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * BGM Chiptune Sintetis Sederhana Berulang
   */
  public startBGM(): void {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.scheduleBGMNote();
  }

  public stopBGM(): void {
    this.bgmPlaying = false;
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleBGMNote(): void {
    if (!this.bgmPlaying) return;

    if (this.ctx && !this.isMuted && this.getBGMGain() > 0.01) {
      try {
        const now = this.ctx.currentTime;
        const freq = this.melodyNotes[this.bgmNoteIndex % this.melodyNotes.length];
        this.bgmNoteIndex++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const noteVolume = 0.08 * this.getBGMGain();
        gain.gain.setValueAtTime(noteVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.19);
      } catch {
        // Ignore
      }
    }

    this.bgmTimer = window.setTimeout(() => {
      this.scheduleBGMNote();
    }, 200);
  }

  public getVolume(): number {
    return this.isMuted ? 0 : this.getSFXGain();
  }

  public getVolumePercent(): number {
    return Math.round(this.getVolume() * 100);
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, Math.round(vol * 100) / 100));
    if (clamped <= 0.01) {
      this.isMuted = true;
      if (this.currentDeathAudio) {
        try {
          this.currentDeathAudio.pause();
        } catch {}
      }
    } else {
      this.isMuted = false;
    }

    Storage.updateSettings({
      sfx: clamped,
      music: clamped * 0.5
    });

    if (this.currentDeathAudio) {
      this.currentDeathAudio.volume = Math.max(0, Math.min(1, 0.9 * clamped));
    }

    this.playFeedback();
  }

  public decreaseVolume(step = 0.1): number {
    const current = this.isMuted ? 0 : this.getSFXGain();
    const next = Math.max(0, current - step);
    this.setVolume(next);
    return next;
  }

  public increaseVolume(step = 0.1): number {
    const current = this.isMuted ? 0 : this.getSFXGain();
    const next = Math.min(1, current + step);
    this.setVolume(next);
    return next;
  }

  public cycleVolume(): number {
    // Berputar: 100% -> 70% -> 40% -> 10% -> 0% (Mute) -> 100%
    const current = this.isMuted ? 0 : this.getSFXGain();
    let next: number;
    if (current <= 0.05) next = 1.0;
    else if (current <= 0.25) next = 0.0;
    else if (current <= 0.55) next = 0.2;
    else if (current <= 0.85) next = 0.5;
    else next = 0.8;
    this.setVolume(next);
    return next;
  }

  public playFeedback(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);
      gain.gain.setValueAtTime(0.2 * this.getSFXGain(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.currentDeathAudio) {
        try {
          this.currentDeathAudio.pause();
        } catch {
          // Ignore
        }
      }
    } else {
      // Jika di-unmute tapi volume saat ini 0, naikkan ke 0.5
      if (this.getSFXGain() <= 0.05) {
        Storage.updateSettings({ sfx: 0.5, music: 0.25 });
      }
      this.playFeedback();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

