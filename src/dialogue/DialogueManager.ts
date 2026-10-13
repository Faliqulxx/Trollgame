// Pengelola Sistem Dialog Stickman (Dialogue Manager)
// Mengatur pemicu (triggers), prioritas, cooldown, pelacakan perilaku pemain, dan balon percakapan.

import { Storage } from '../core/Storage';
import { Camera } from '../core/Camera';
import { Player } from '../entities/Player';
import { Trap } from '../entities/traps/Trap';
import { Door } from '../entities/Door';
import { SpeechBubble } from './SpeechBubble';
import { DIALOGUE_DATA, DialoguePicker, DialogueCategory } from './dialogueData';

export class DialogueManager {
  public bubble: SpeechBubble = new SpeechBubble();

  // State Prioritas & Waktu
  private currentPriority: number = 999; // 1 = Death, 2 = Respawn, 3 = Victory, 4 = Behavior, 5 = Proximity, 6 = Idle
  private globalCooldownTimer: number = 0;

  // Pelacakan Perilaku Pemain
  private idleTimer: number = 0;
  private deathsInRun: number = 0;
  private hasMovedSinceRespawn: boolean = false;
  private respawnIdleTimer: number = 0;

  // Pacing (maju-mundur)
  private pacingTurns: number = 0;
  private pacingTimer: number = 0;
  private lastFacing: number = 1;

  // Jump spamming
  private inPlaceJumpCount: number = 0;
  private inPlaceJumpTimer: number = 0;

  // Wall pushing
  private wallPushTimer: number = 0;

  // Catatan Jebakan & Pintu yang sudah dikomentari dalam level ini
  private triggeredTrapIds: Set<string> = new Set();
  private hasCommentedNearDoor: boolean = false;

  // Cooldown kategori individu
  private categoryCooldowns: Record<string, number> = {
    IDLE: 0,
    PROXIMITY: 0,
    BEHAVIOR: 0,
    META: 0
  };

  public resetForNewLevel(): void {
    this.bubble.hide();
    this.currentPriority = 999;
    this.globalCooldownTimer = 0;
    this.idleTimer = 0;
    this.deathsInRun = 0;
    this.hasMovedSinceRespawn = false;
    this.respawnIdleTimer = 0;
    this.pacingTurns = 0;
    this.pacingTimer = 0;
    this.inPlaceJumpCount = 0;
    this.inPlaceJumpTimer = 0;
    this.wallPushTimer = 0;
    this.triggeredTrapIds.clear();
    this.hasCommentedNearDoor = false;
  }

  private getGlobalCooldownDuration(): number {
    const freq = Storage.getDialogueFrequency();
    if (freq === 'often') return 2.6;
    if (freq === 'rare') return 9.0;
    return 4.5; // normal
  }

  /**
   * Menampilkan dialog baru jika memenuhi aturan prioritas dan cooldown
   */
  public triggerDialogue(
    category: DialogueCategory,
    priority: number,
    text: string,
    forcedDuration?: number
  ): boolean {
    if (!Storage.getDialogueEnabled()) return false;

    // Filter frekuensi: jika mode 'rare', abaikan prioritas rendah (proximity dan idle)
    const freq = Storage.getDialogueFrequency();
    if (freq === 'rare' && priority >= 5) {
      return false;
    }

    // Cek cooldown kategori (hanya untuk prioritas ambien > 3)
    if (priority > 3 && this.categoryCooldowns[category] && this.categoryCooldowns[category] > 0) {
      return false;
    }

    // Jika balon sedang aktif, hanya boleh dipotong oleh prioritas yang lebih tinggi (< currentPriority)
    if (this.bubble.isActive) {
      if (priority >= this.currentPriority) {
        return false;
      }
    } else {
      // Jika tidak ada balon aktif, cek global cooldown (hanya untuk prioritas ambien > 3)
      if (priority > 3 && this.globalCooldownTimer > 0) {
        return false;
      }
    }

    // Sukses tampilkan dialog
    this.currentPriority = priority;
    this.globalCooldownTimer = this.getGlobalCooldownDuration();
    if (this.categoryCooldowns[category] !== undefined) {
      this.categoryCooldowns[category] = 7.0;
    }

    this.bubble.show(text, forcedDuration);
    return true;
  }

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Dipanggil saat karakter mati
   */
  public onDeath(cause?: string, totalDeathsInRun = 0): void {
    this.deathsInRun = totalDeathsInRun;
    this.hasMovedSinceRespawn = false;
    this.respawnIdleTimer = 0;

    // 1. Cek dialog rahasia kematian beruntun (Prioritas 1)
    if (this.deathsInRun === 3) {
      this.triggerDialogue('BEHAVIOR', 1, DIALOGUE_DATA.BEHAVIORS.DEATH_STREAK_3);
      return;
    }
    if (this.deathsInRun === 10) {
      this.triggerDialogue('BEHAVIOR', 1, DIALOGUE_DATA.BEHAVIORS.DEATH_STREAK_10);
      return;
    }
    if (this.deathsInRun === 25) {
      this.triggerDialogue('BEHAVIOR', 1, DIALOGUE_DATA.BEHAVIORS.DEATH_STREAK_25);
      return;
    }

    // 2. Dialog sesuai penyebab kematian
    let lines: string[] | undefined;
    if (cause) {
      if (cause === 'spikes') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.spikes;
      } else if (cause === 'hiddenSpikes') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.hiddenSpikes;
      } else if (cause === 'fall') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.fall;
      } else if (cause === 'saw') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.saw;
      } else if (cause === 'slidingSaw') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.slidingSaw;
      } else if (cause === 'thwomp' || cause === 'fallingCeiling' || cause === 'fallingPillar') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.crush;
      } else if (cause === 'fakeFloor' || cause === 'vanishingFloor' || cause === 'trapdoor' || cause === 'spikeTransformFloor') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.fakeFloor;
      } else if (cause === 'explodingFloor' || cause === 'chainBomb') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.explosion;
      } else if (cause === 'fakeDoor') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.fakeDoor;
      } else if (cause === 'fakeCheckpoint') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.fakeCheckpoint;
      } else if (cause === 'launcherFloor') {
        lines = DIALOGUE_DATA.DEATH_BY_CAUSE.launcher;
      }
    }

    const pool = (lines && lines.length > 0 && Math.random() < 0.65)
      ? lines
      : DIALOGUE_DATA.DEATH_GENERAL;

    this.triggerDialogue('DEATH', 1, DialoguePicker.pick(pool));
  }

  /**
   * Dipanggil saat karakter selesai respawn
   */
  public onRespawn(): void {
    this.hasMovedSinceRespawn = false;
    this.respawnIdleTimer = 0;
    this.idleTimer = 0;

    // Kadang muncul dialog meta (chance 15%)
    if (Math.random() < 0.15) {
      this.triggerDialogue('META', 2, DialoguePicker.pick(DIALOGUE_DATA.META));
    } else {
      this.triggerDialogue('RESPAWN', 2, DialoguePicker.pick(DIALOGUE_DATA.RESPAWN));
    }
  }

  /**
   * Dipanggil saat pemain menyelesaikan level
   */
  public onVictory(deathsInRun: number): void {
    if (deathsInRun >= 8 && Math.random() < 0.6) {
      this.triggerDialogue('VICTORY', 3, DIALOGUE_DATA.BEHAVIORS.VICTORY_HIGH_DEATHS, 3.5);
    } else {
      this.triggerDialogue('VICTORY', 3, DialoguePicker.pick(DIALOGUE_DATA.VICTORY), 3.5);
    }
  }

  // =========================================================================
  // UPDATE LOOP & BEHAVIORAL DETECTION
  // =========================================================================

  public update(
    dt: number,
    player: Player,
    traps: Trap[],
    door: Door | null,
    isPaused: boolean,
    camera: Camera
  ): void {
    if (isPaused) return;

    // Update cooldown
    if (this.globalCooldownTimer > 0) this.globalCooldownTimer -= dt;
    for (const key of Object.keys(this.categoryCooldowns)) {
      if (this.categoryCooldowns[key] > 0) {
        this.categoryCooldowns[key] -= dt;
      }
    }

    // Jika balon sudah selesai tampil, reset prioritas
    if (!this.bubble.isActive) {
      this.currentPriority = 999;
    }

    // Konversi posisi karakter dari dunia ke koordinat layar kamera
    const screenX = player.x + player.width / 2 - camera.x;
    const screenY = player.y - camera.y;

    this.bubble.update(dt, screenX, screenY);

    if (player.isDead) return;

    // 1. Deteksi Gerakan & Idle
    const isMoving = Math.abs(player.vx) > 10 || Math.abs(player.vy) > 10;
    if (isMoving) {
      this.idleTimer = 0;
      this.hasMovedSinceRespawn = true;
    } else {
      this.idleTimer += dt;
      if (!this.hasMovedSinceRespawn) {
        this.respawnIdleTimer += dt;
      }
    }

    // A. Deteksi Diam Setelah Respawn
    if (!this.hasMovedSinceRespawn && this.respawnIdleTimer >= 4.0) {
      this.respawnIdleTimer = -999; // trigger sekali saja
      this.triggerDialogue('BEHAVIOR', 4, DIALOGUE_DATA.BEHAVIORS.IDLE_AFTER_RESPAWN);
      return;
    }

    // B. Deteksi Terlalu Lama Diam (Idle 6-9s)
    if (this.idleTimer >= 6.5) {
      this.idleTimer = 0;
      // 20% kemungkinan dialog meta saat idle
      if (Math.random() < 0.2) {
        this.triggerDialogue('META', 6, DialoguePicker.pick(DIALOGUE_DATA.META));
      } else {
        this.triggerDialogue('IDLE', 6, DialoguePicker.pick(DIALOGUE_DATA.IDLE));
      }
      return;
    }

    // C. Deteksi Maju-Mundur Berulang Kali (Pacing)
    this.pacingTimer += dt;
    if (player.facing !== this.lastFacing && Math.abs(player.vx) > 30) {
      this.lastFacing = player.facing;
      this.pacingTurns++;
      if (this.pacingTurns >= 6 && this.pacingTimer <= 3.0) {
        this.pacingTurns = 0;
        this.pacingTimer = 0;
        this.triggerDialogue('BEHAVIOR', 4, DIALOGUE_DATA.BEHAVIORS.PACING);
        return;
      }
    }
    if (this.pacingTimer > 3.0) {
      this.pacingTurns = 0;
      this.pacingTimer = 0;
    }

    // D. Deteksi Lompat di Tempat Berulang Kali (Kodok)
    this.inPlaceJumpTimer += dt;
    if (player.isGrounded === false && player.wasGrounded === true && Math.abs(player.vx) < 25) {
      this.inPlaceJumpCount++;
      if (this.inPlaceJumpCount >= 4 && this.inPlaceJumpTimer <= 3.5) {
        this.inPlaceJumpCount = 0;
        this.inPlaceJumpTimer = 0;
        this.triggerDialogue('BEHAVIOR', 4, DIALOGUE_DATA.BEHAVIORS.JUMP_SPAM);
        return;
      }
    }
    if (this.inPlaceJumpTimer > 4.0) {
      this.inPlaceJumpCount = 0;
      this.inPlaceJumpTimer = 0;
    }

    // E. Deteksi Menabrak Tembok (Wall Push)
    // Jika pemain menabrak tembok terus-menerus (state running tapi vx mendekati 0)
    if (player.state === 'running' && Math.abs(player.vx) < 5) {
      this.wallPushTimer += dt;
      if (this.wallPushTimer >= 2.5) {
        this.wallPushTimer = 0;
        this.triggerDialogue('BEHAVIOR', 4, DIALOGUE_DATA.BEHAVIORS.WALL_PUSH);
        return;
      }
    } else {
      this.wallPushTimer = 0;
    }

    // F. Deteksi Dekat Jebakan Berbahaya (Proximity Trap)
    this.checkTrapProximity(player, traps);

    // G. Deteksi Dekat Pintu Keluar
    if (door && !this.hasCommentedNearDoor) {
      const distToDoor = Math.hypot(
        player.x + player.width / 2 - (door.x + door.w / 2),
        player.y + player.height / 2 - (door.y + door.h / 2)
      );
      if (distToDoor < 120) {
        this.hasCommentedNearDoor = true;
        this.triggerDialogue('NEAR_DOOR', 5, DialoguePicker.pick(DIALOGUE_DATA.NEAR_DOOR));
      }
    }
  }

  private checkTrapProximity(player: Player, traps: Trap[]): void {
    if (this.categoryCooldowns.PROXIMITY > 0) return;

    for (const trap of traps) {
      if (this.triggeredTrapIds.has(trap.id)) continue;

      let trapX = 0;
      let trapY = 0;
      const hbs = trap.getHitboxes();
      if (hbs.length > 0) {
        trapX = hbs[0].x;
        trapY = hbs[0].y;
      } else if (trap.getSolidBox && trap.getSolidBox()) {
        const sb = trap.getSolidBox()!;
        trapX = sb.x;
        trapY = sb.y;
      } else if ('x' in trap && 'y' in trap) {
        trapX = (trap as any).x;
        trapY = (trap as any).y;
      } else {
        continue;
      }

      // Cek jarak horizontal & vertikal ke jebakan
      const dx = Math.abs(player.x - trapX);
      const dy = Math.abs(player.y - trapY);

      if (dx < 70 && dy < 55) {
        this.triggeredTrapIds.add(trap.id);
        this.triggerDialogue('NEAR_TRAP', 5, DialoguePicker.pick(DIALOGUE_DATA.NEAR_TRAP));
        break;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.bubble.render(ctx);
  }
}
