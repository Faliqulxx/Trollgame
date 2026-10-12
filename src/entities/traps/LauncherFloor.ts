// T21: Lantai Peluncur + Duri Langit-langit (PRD Bagian 5.2)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';
import { Camera } from '../../core/Camera';

export class LauncherFloor implements Trap {
  public readonly id: string;
  public readonly type = 'launcherFloor';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  private startY: number;
  private targetY: number; // Ketinggian atas atap
  private ceilingSpikesY: number;
  private ceilingSpikesCount: number;

  // State Machine: IDLE -> ARMED -> LAUNCHING -> REACHED
  public state: 'IDLE' | 'ARMED' | 'LAUNCHING' | 'REACHED' = 'IDLE';
  private pauseTimer = 0.15;
  private launchSpeed = 0;
  private maxLaunchSpeed = 900;
  private spikesExtended = false;

  public deltaY = 0;
  private audio?: AudioManager;
  private camera?: Camera;

  constructor(
    id: string,
    x: number,
    startY: number,
    targetY: number,
    ceilingSpikesY: number,
    width = 48,
    height = 16,
    ceilingSpikesCount = 3,
    audio?: AudioManager,
    camera?: Camera
  ) {
    this.id = id;
    this.x = x;
    this.startY = startY;
    this.targetY = targetY;
    this.y = startY;
    this.ceilingSpikesY = ceilingSpikesY;
    this.width = width;
    this.height = height;
    this.ceilingSpikesCount = ceilingSpikesCount;
    this.audio = audio;
    this.camera = camera;
  }

  public reset(): void {
    this.y = this.startY;
    this.state = 'IDLE';
    this.pauseTimer = 0.15;
    this.launchSpeed = 0;
    this.spikesExtended = false;
    this.deltaY = 0;
  }

  public update(dt: number, player: Player): void {
    const oldY = this.y;

    if (this.state === 'IDLE') {
      // Cek apakah pemain menginjak platform
      const footBox: Rect = {
        x: player.x,
        y: player.y + player.height - 3,
        w: player.width,
        h: 5
      };
      const platformTop: Rect = {
        x: this.x,
        y: this.y - 3,
        w: this.width,
        h: 5
      };

      if (Collision.aabb(footBox, platformTop)) {
        this.state = 'ARMED';
        this.pauseTimer = 0.15;
      }
    } else if (this.state === 'ARMED') {
      this.pauseTimer -= dt;
      if (this.pauseTimer <= 0) {
        this.state = 'LAUNCHING';
        this.audio?.playStinger();
        const leftover = -this.pauseTimer;
        this.launchSpeed = Math.min(this.maxLaunchSpeed, this.launchSpeed + 3000 * leftover);
        this.y -= this.launchSpeed * leftover;
      }
    } else if (this.state === 'LAUNCHING') {
      // Akselerasi cepat ke atas
      this.launchSpeed = Math.min(this.maxLaunchSpeed, this.launchSpeed + 3000 * dt);
      this.y -= this.launchSpeed * dt;

      // Cek jarak: pada 60% perjalanan, duri langit-langit menyembul turun
      const totalDist = this.startY - this.targetY;
      const currentDist = this.startY - this.y;
      if (currentDist >= totalDist * 0.6 && !this.spikesExtended) {
        this.spikesExtended = true;
        this.camera?.shake(0.2, 4);
      }

      if (this.y <= this.targetY) {
        this.y = this.targetY;
        this.state = 'REACHED';
        this.launchSpeed = 0;
      }
    }

    this.deltaY = this.y - oldY;

    // Aturan B8: Terapkan delta platform ke pemain saat berdiri di platform
    const footBox: Rect = {
      x: player.x,
      y: player.y + player.height - 4,
      w: player.width,
      h: 8
    };
    const platformTop: Rect = {
      x: this.x - 2,
      y: this.y - 6,
      w: this.width + 4,
      h: 8
    };

    if (Collision.aabb(footBox, platformTop)) {
      player.y += this.deltaY;
    }
  }

  public isDeadly(): boolean {
    // Duri langit-langit mematikan jika sudah menyembul turun
    return this.spikesExtended;
  }

  public getHitboxes(): Rect[] {
    if (!this.spikesExtended) return [];

    // Duri yang menyembul dari langit-langit
    const boxes: Rect[] = [];
    const spikeW = this.width / this.ceilingSpikesCount;
    for (let i = 0; i < this.ceilingSpikesCount; i++) {
      boxes.push({
        x: this.x + i * spikeW + 2,
        y: this.ceilingSpikesY,
        w: spikeW - 4,
        h: 24
      });
    }
    return boxes;
  }

  public getSolidBox(): Rect | null {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Duri Langit-langit (turun jika triggered)
    if (this.spikesExtended) {
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 1.8;

      const spikeW = this.width / this.ceilingSpikesCount;
      for (let i = 0; i < this.ceilingSpikesCount; i++) {
        const bx = this.x + i * spikeW;
        const by = this.ceilingSpikesY;
        ctx.beginPath();
        ctx.moveTo(bx + 2, by);
        ctx.lineTo(bx + spikeW / 2, by + 24);
        ctx.lineTo(bx + spikeW - 2, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 2. Platform Peluncur (Tampak persis seperti lantai solid biasa)
    ctx.translate(this.x, this.y);

    const ts = CONFIG.TILE_SIZE;
    const tileCount = Math.max(1, Math.round(this.width / ts));

    for (let i = 0; i < tileCount; i++) {
      const px = i * ts;
      const tw = Math.min(ts, this.width - px);

      ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK_FILL;
      ctx.fillRect(px, 0, tw, this.height);

      ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
      ctx.lineWidth = 2;
      ctx.strokeRect(px, 0, tw, this.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 4, 4);
      ctx.lineTo(px + tw - 4, 4);
      ctx.stroke();
    }

    ctx.restore();
  }
}
