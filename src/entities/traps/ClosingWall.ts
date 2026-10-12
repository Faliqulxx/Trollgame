// T08: Dinding Menutup / Closing Wall (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class ClosingWall implements Trap {
  public readonly id: string;
  public readonly type = 'closingWall';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private trigger: Rect;
  private speed: number;
  public isTriggered = false;
  private audio?: AudioManager;

  constructor(
    id: string,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    width: number,
    height: number,
    trigger: Rect,
    speed = 120,
    audio?: AudioManager
  ) {
    this.id = id;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = startX;
    this.y = startY;
    this.width = width;
    this.height = height;
    this.trigger = trigger;
    this.speed = speed;
    this.audio = audio;
  }

  public reset(): void {
    this.x = this.startX;
    this.y = this.startY;
    this.isTriggered = false;
  }

  public update(dt: number, player: Player): void {
    if (!this.isTriggered) {
      if (Collision.aabb(player.getHitbox(), this.trigger)) {
        this.isTriggered = true;
        this.audio?.playCrumble();
      }
    } else {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) {
        const step = this.speed * dt;
        this.x += (dx / dist) * Math.min(dist, step);
        this.y += (dy / dist) * Math.min(dist, step);
      }
    }
  }

  public isDeadly(): boolean {
    return true; // Menghimpit atau mematikan jika bersentuhan langsung saat bergerak
  }

  public getHitboxes(): Rect[] {
    if (!this.isTriggered) return [];
    return [{
      x: this.x + 2,
      y: this.y + 2,
      w: this.width - 4,
      h: this.height - 4
    }];
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
    ctx.translate(this.x, this.y);

    ctx.fillStyle = '#3a3a46';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeRect(0, 0, this.width, this.height);

    // Duri di sisi penutup
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    const spikeH = 8;
    for (let py = 0; py < this.height - 10; py += 16) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(-spikeH, py + 8);
      ctx.lineTo(0, py + 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
