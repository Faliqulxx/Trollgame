import { CONFIG } from '../../config';
import { Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export class Shooter implements Trap {
  public readonly id: string;
  public readonly type = 'shooter';
  public x: number;
  public y: number;
  public dirX: number; // 1 (kanan) atau -1 (kiri)
  public dirY: number; // 0 (horizontal)
  public interval: number; // detik
  public projectileSpeed: number;
  public range: number;

  private timer = 0;
  private projectiles: Projectile[] = [];
  private audio?: AudioManager;

  constructor(
    id: string,
    x: number,
    y: number,
    dirX = -1,
    dirY = 0,
    interval = 1.6,
    projectileSpeed = 240,
    range = 500,
    audio?: AudioManager
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.interval = interval;
    this.projectileSpeed = projectileSpeed;
    this.range = range;
    this.audio = audio;
  }

  public reset(): void {
    this.timer = 0;
    this.projectiles = [];
  }

  public update(dt: number, _player: Player): void {
    this.timer += dt;
    if (this.timer >= this.interval) {
      this.timer = 0;
      this.shoot();
    }

    // Update projectiles
    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Hapus jika keluar jangkauan
      if (Math.hypot(p.x - this.x, p.y - this.y) > this.range) {
        p.active = false;
      }
    }
  }

  private shoot(): void {
    this.projectiles.push({
      x: this.x + (this.dirX > 0 ? CONFIG.TILE_SIZE : -8),
      y: this.y + CONFIG.TILE_SIZE / 2 - 4,
      vx: this.dirX * this.projectileSpeed,
      vy: this.dirY * this.projectileSpeed,
      active: true
    });
    this.audio?.playStinger();
  }

  public isDeadly(): boolean {
    return true;
  }

  public getHitboxes(): Rect[] {
    return this.projectiles
      .filter(p => p.active)
      .map(p => ({
        x: p.x,
        y: p.y,
        w: 12,
        h: 8
      }));
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // Gambar meriam / cannon block
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#343a40';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    ctx.strokeRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

    // Moncong meriam
    ctx.fillStyle = '#212529';
    const barrelX = this.dirX > 0 ? CONFIG.TILE_SIZE - 2 : -6;
    ctx.fillRect(barrelX, CONFIG.TILE_SIZE / 2 - 5, 8, 10);
    ctx.strokeRect(barrelX, CONFIG.TILE_SIZE / 2 - 5, 8, 10);

    ctx.restore();

    // Gambar proyektil aktif
    for (const p of this.projectiles) {
      if (!p.active) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 1.5;

      // Bentuk peluru / panah tajam
      ctx.beginPath();
      if (this.dirX > 0) {
        ctx.moveTo(0, 0);
        ctx.lineTo(12, 4);
        ctx.lineTo(0, 8);
      } else {
        ctx.moveTo(12, 0);
        ctx.lineTo(0, 4);
        ctx.lineTo(12, 8);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}
