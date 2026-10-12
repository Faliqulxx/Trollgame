// Scene Inti Permainan (PRD Bagian 4, 7, & 10.1)

import { CONFIG } from '../config';
import { Collision } from '../physics/Collision';
import { Player } from '../entities/Player';
import { Camera } from '../core/Camera';
import { Input } from '../core/Input';
import { AudioManager } from '../core/Audio';
import { ParticleSystem } from '../core/Particles';
import { Storage } from '../core/Storage';
import { HUD } from '../ui/HUD';
import { Level } from '../levels/LevelLoader';
import { LEVELS } from '../levels/levelsData';

export type GameSceneStatus = 'PLAYING' | 'DYING' | 'LEVEL_CLEAR' | 'PAUSED' | 'GO_TO_MENU' | 'GO_TO_END';

export class GameScene {
  public currentLevelIndex: number;
  public level: Level;
  public player: Player;
  public camera: Camera;
  public particles: ParticleSystem;
  public audio: AudioManager;
  public hud: HUD;

  // Status Permainan
  public status: GameSceneStatus = 'PLAYING';
  public isDebugMode = false;
  private deathTimer = 0;
  private levelTime = 0;
  private deathsInRun = 0;

  // Titik respawn aktif (spawn awal atau checkpoint)
  private respawnX = 0;
  private respawnY = 0;

  constructor(
    levelId: number,
    camera: Camera,
    particles: ParticleSystem,
    audio: AudioManager
  ) {
    this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, levelId - 1));
    this.camera = camera;
    this.particles = particles;
    this.audio = audio;
    this.hud = new HUD();
    this.player = new Player();

    const data = LEVELS[this.currentLevelIndex];
    this.level = new Level(data, this.camera, this.audio, this.particles);
    this.loadLevel(this.currentLevelIndex);
  }

  public loadLevel(index: number): void {
    this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    const data = LEVELS[this.currentLevelIndex];
    this.level = new Level(data, this.camera, this.audio, this.particles);

    // Setup batas kamera sesuai ukuran peta
    this.camera.setBounds(0, 0, this.level.pixelWidth, this.level.pixelHeight);

    // Spawn pemain
    this.respawnX = this.level.spawnX;
    this.respawnY = this.level.spawnY;
    this.player.spawn(this.respawnX, this.respawnY);

    // Reset status
    this.status = 'PLAYING';
    this.deathTimer = 0;
    this.levelTime = 0;
    this.deathsInRun = 0;
    this.hud.isLevelClear = false;
    this.hud.isPaused = false;
    this.hud.currentLevelId = data.id;
    this.particles.clear();
  }

  public update(dt: number, input: Input): GameSceneStatus {
    // 1. Cek Tombol Jeda (Pause / Esc / P)
    if (input.isPauseJustPressed()) {
      if (this.status === 'PLAYING') {
        this.status = 'PAUSED';
        this.hud.isPaused = true;
      } else if (this.status === 'PAUSED') {
        this.status = 'PLAYING';
        this.hud.isPaused = false;
      }
    }

    // Toggle Mode Debug Hitbox (F2 - Aturan B5 & 5.3)
    if (input.isDebugJustPressed()) {
      this.isDebugMode = !this.isDebugMode;
    }

    // 2. Cek Tombol Restart (R)
    if (input.isRestartJustPressed() && this.status !== 'LEVEL_CLEAR') {
      this.triggerDeath('Mengulang kembali...');
      return this.status;
    }

    // 3. Update HUD
    this.hud.update(dt);

    if (this.status === 'PAUSED') {
      return this.status;
    }

    if (this.status === 'LEVEL_CLEAR') {
      // Tunggu interaksi tombol di modal HUD
      return this.status;
    }

    if (this.status === 'DYING') {
      this.deathTimer -= dt;
      this.particles.update(dt);
      if (this.deathTimer <= 0) {
        this.respawn();
      }
      return this.status;
    }

    // --- Status PLAYING (Aturan B9 Urutan Update Tetap) ---
    this.levelTime += dt;

    // 1. Update Traps & Moving Platforms
    for (const trap of this.level.traps) {
      trap.update(dt, this.player);
    }

    // 2. Update Pemain & Tabrakan Solid Tile
    this.player.update(dt, input, this.level, this.audio, this.particles);

    // 3. Cek Hazard (Hitbox Bahaya Jebakan)
    const pBox = this.player.getHitbox();
    for (const trap of this.level.traps) {
      if (trap.isDeadly()) {
        for (const hb of trap.getHitboxes()) {
          if (Collision.aabb(pBox, hb)) {
            this.triggerDeath();
            return this.status;
          }
        }
      }
    }

    // D. Cek Jatuh ke Luar Batas Peta (Bawah)
    if (this.player.y > this.level.pixelHeight + 40) {
      this.triggerDeath('Jatuh ke jurang hampa.');
      return this.status;
    }

    // E. Cek Interaksi Checkpoint
    for (const cp of this.level.checkpoints) {
      if (!cp.isActivated && Collision.aabb(pBox, cp.getHitbox())) {
        cp.activate();
        this.respawnX = cp.x + 4;
        this.respawnY = cp.y + cp.h - this.player.height;
        this.audio.playCheckpoint();
      }
    }

    // F. Cek Menyentuh Pintu Keluar Asli (Update Teleport Troll jika ada)
    if (this.level.door) {
      this.level.door.update(this.player);
      if (Collision.aabb(pBox, this.level.door.getHitbox())) {
        this.triggerWin();
        return this.status;
      }
    }

    // Cek Pintu Kabur yang sudah terpojok (bisa dimasuki)
    if (this.level.runningDoor && this.level.runningDoor.canEnter()) {
      if (Collision.aabb(pBox, this.level.runningDoor.getDoorHitbox())) {
        this.triggerWin();
        return this.status;
      }
    }

    // G. Kamera Mengikuti Pemain (Aturan B9)
    this.camera.follow(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, dt);

    // H. Update Partikel
    this.particles.update(dt);

    return this.status;
  }

  private triggerDeath(_customMessage?: string): void {
    if (this.status === 'DYING') return;

    this.status = 'DYING';
    this.deathTimer = CONFIG.DEATH_ANIMATION_DURATION;
    this.deathsInRun++;
    this.player.isDead = true;

    // Suara mati & guncangan kamera
    this.audio.playDeath();
    this.camera.shake(0.3, 7);

    // Ragdoll dan percikan tinta/tangan stickman terlempar
    this.particles.emitStickmanDeath(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );

    // Simpan ke storage
    Storage.addDeath(this.level.id);
  }

  private respawn(): void {
    this.status = 'PLAYING';
    this.player.spawn(this.respawnX, this.respawnY);
    this.level.resetTraps();
  }

  private triggerWin(): void {
    this.status = 'LEVEL_CLEAR';
    this.hud.isLevelClear = true;
    this.hud.clearStats = {
      time: this.levelTime,
      deaths: this.deathsInRun
    };

    this.audio.playWin();
    this.particles.emitConfetti(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );

    // Simpan catatan level ke Storage
    Storage.recordLevelCompletion(this.level.id, this.levelTime, this.deathsInRun);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // 1. Bersihkan Canvas
    ctx.fillStyle = CONFIG.COLORS.BG_PAPER;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // 2. Render Dunia Game di dalam Kamera
    this.camera.apply(ctx);

    // Render Tile, Duri, Pintu, dll.
    this.level.render(ctx, this.camera);

    // Render Partikel di dunia
    this.particles.render(ctx);

    // Render Stickman
    this.player.render(ctx);

    // Mode Debug Hitbox (F2 - PRD 4.6 B5 & 5.3)
    if (this.isDebugMode) {
      // Hitbox Pemain (Hijau)
      const pb = this.player.getHitbox();
      ctx.strokeStyle = '#2a9d8f';
      ctx.lineWidth = 2;
      ctx.strokeRect(pb.x, pb.y, pb.w, pb.h);

      // Hitbox Pintu (Hijau)
      if (this.level.door) {
        const db = this.level.door.getHitbox();
        ctx.strokeStyle = '#2a9d8f';
        ctx.strokeRect(db.x, db.y, db.w, db.h);
      }

      // Hitbox Bahaya Tiap Jebakan (Merah)
      for (const trap of this.level.traps) {
        const hbs = trap.getHitboxes();
        for (const hb of hbs) {
          ctx.fillStyle = 'rgba(230, 57, 70, 0.45)';
          ctx.fillRect(hb.x, hb.y, hb.w, hb.h);
          ctx.strokeStyle = '#e63946';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
        }
      }
    }

    this.camera.restore(ctx);

    // 3. Render HUD & Overlay di Layar Tetap
    this.hud.render(
      ctx,
      `LV ${this.level.id}`,
      this.deathsInRun,
      this.levelTime,
      this.audio.getMuted()
    );

    // Tampilkan label debug jika aktif
    if (this.isDebugMode) {
      ctx.fillStyle = '#e63946';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('[F2 DEBUG HITBOX: AKTIF]', 20, CONFIG.CANVAS_HEIGHT - 20);
    }
  }

  public handlePointerClick(screenX: number, screenY: number): 'next_level' | 'menu' | null {
    const action = this.hud.getClickedAction(screenX, screenY);

    if (action === 'restart' || action === 'restart_modal') {
      this.hud.isPaused = false;
      this.status = 'PLAYING';
      this.loadLevel(this.currentLevelIndex);
      return null;
    }

    if (action === 'pause') {
      this.hud.isPaused = !this.hud.isPaused;
      this.status = this.hud.isPaused ? 'PAUSED' : 'PLAYING';
      return null;
    }

    if (action === 'resume') {
      this.hud.isPaused = false;
      this.status = 'PLAYING';
      return null;
    }

    if (action === 'audio') {
      this.audio.toggleMute();
      return null;
    }

    if (action === 'menu') {
      return 'menu';
    }

    if (action === 'next_level') {
      if (this.currentLevelIndex >= LEVELS.length - 1) {
        return 'next_level'; // ini akan memicu ending
      } else {
        this.loadLevel(this.currentLevelIndex + 1);
        return null;
      }
    }

    return null;
  }
}
