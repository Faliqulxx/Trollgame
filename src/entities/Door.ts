import { CONFIG } from '../config';
import { Rect } from '../physics/Collision';
import { AudioManager } from '../core/Audio';
import { ParticleSystem } from '../core/Particles';
import { Camera } from '../core/Camera';
import { Player } from './Player';

export class Door {
  public x: number;
  public y: number;
  public initialX: number;
  public initialY: number;
  public w = 32;
  public h = 48;
  public isOpen = true;

  // Fitur Troll Teleportasi Pintu
  public teleportTarget?: { x: number; y: number };
  public hasTeleported = false;
  public checkpoint?: Checkpoint;
  public onTeleportDestroy?: (x: number, y: number) => void;
  private audio?: AudioManager;
  private particles?: ParticleSystem;
  private camera?: Camera;

  constructor(
    x: number,
    y: number,
    teleportTarget?: { x: number; y: number },
    audio?: AudioManager,
    particles?: ParticleSystem,
    camera?: Camera
  ) {
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.teleportTarget = teleportTarget;
    this.audio = audio;
    this.particles = particles;
    this.camera = camera;
  }

  public reset(): void {
    // Jika pintu belum hancur/teleport, reset posisinya ke awal.
    // Jika sudah hancur (teleport), biarkan tetap di posisi baru karena
    // lokasi awal sudah menjadi checkpoint permanen untuk pemain!
    if (!this.hasTeleported) {
      this.x = this.initialX;
      this.y = this.initialY;
    }
  }

  public update(player: Player): void {
    if (this.teleportTarget && !this.hasTeleported) {
      const dist = Math.hypot(
        (player.x + player.width / 2) - (this.x + this.w / 2),
        (player.y + player.height / 2) - (this.y + this.h / 2)
      );

      // Begitu pemain mendekati pintu (jarak < 85px), pintu hancur & berteleportasi!
      if (dist < 85) {
        this.hasTeleported = true;
        this.audio?.playStinger();
        this.camera?.shake(0.35, 8);
        if (this.particles) {
          this.particles.emitStickmanDeath(this.x + this.w / 2, this.y + this.h / 2);
        }
        const oldX = this.x;
        const oldY = this.y;
        this.x = this.teleportTarget.x;
        this.y = this.teleportTarget.y;
        if (this.particles) {
          this.particles.emitDust(this.x + this.w / 2, this.y + this.h / 2, 12);
        }

        // PINTU YANG HANCUR DI AKHIR DIJADIKAN CHECKPOINT!
        this.checkpoint = new Checkpoint(oldX + 4, oldY + 8);
        this.checkpoint.activate();
        this.audio?.playCheckpoint();

        if (this.onTeleportDestroy) {
          this.onTeleportDestroy(oldX, oldY);
        }
      }
    }
  }

  public getHitbox(): Rect {
    return {
      x: this.x + 6,
      y: this.y + 4,
      w: this.w - 12,
      h: this.h - 4
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Render bendera checkpoint di lokasi pintu yang hancur
    if (this.checkpoint) {
      this.checkpoint.render(ctx);
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Kusen Pintu
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, this.w, this.h);

    // Daun Pintu Hijau Menenangkan (Gaya Sketsa)
    ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
    ctx.fillRect(3, 3, this.w - 6, this.h - 3);

    // Detail Panel Pintu
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, this.w - 12, (this.h - 12) / 2);
    ctx.strokeRect(6, 6 + (this.h - 12) / 2 + 2, this.w - 12, (this.h - 12) / 2 - 2);

    // Gagang Pintu Emas
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(this.w - 8, this.h / 2 + 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tulisan "EXIT" kecil di atas
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', this.w / 2, -4);

    ctx.restore();
  }
}

export class Checkpoint {
  public x: number;
  public y: number;
  public w = 24;
  public h = 40;
  public isActivated = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public getHitbox(): Rect {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    };
  }

  public activate(): void {
    this.isActivated = true;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Tiang bendera
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4, this.h);
    ctx.lineTo(4, 2);
    ctx.stroke();

    // Dudukan tiang
    ctx.beginPath();
    ctx.moveTo(0, this.h);
    ctx.lineTo(8, this.h);
    ctx.stroke();

    // Kain bendera
    const flagColor = this.isActivated ? CONFIG.COLORS.CHECKPOINT_BLUE : '#9999aa';
    ctx.fillStyle = flagColor;
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(20, 10);
    ctx.lineTo(4, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
