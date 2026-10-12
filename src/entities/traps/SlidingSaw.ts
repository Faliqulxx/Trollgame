// T06: Gergaji Meluncur / Sliding Saw (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class SlidingSaw implements Trap {
  public readonly id: string;
  public readonly type = 'slidingSaw';
  public x: number;
  public y: number;
  public radius: number;

  private spawnX: number;
  private spawnY: number;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private trigger: Rect;

  public isTriggered = false;
  private angle = 0;
  private audio?: AudioManager;

  constructor(
    id: string,
    spawnX: number,
    spawnY: number,
    targetX: number,
    targetY: number,
    trigger: Rect,
    radius = 20,
    speed = 360,
    audio?: AudioManager
  ) {
    this.id = id;
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.x = spawnX;
    this.y = spawnY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.trigger = trigger;
    this.radius = radius;
    this.speed = speed;
    this.audio = audio;
  }

  public reset(): void {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.isTriggered = false;
    this.angle = 0;
  }

  public update(dt: number, player: Player): void {
    if (!this.isTriggered) {
      if (Collision.aabb(player.getHitbox(), this.trigger)) {
        this.isTriggered = true;
        this.audio?.playStinger();
      }
    } else {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        const step = this.speed * dt;
        this.x += (dx / dist) * Math.min(dist, step);
        this.y += (dy / dist) * Math.min(dist, step);
      }
      this.angle += dt * 25;
    }
  }

  public isDeadly(): boolean {
    return this.isTriggered;
  }

  public getHitboxes(): Rect[] {
    if (!this.isTriggered) return [];
    const r = this.radius * 0.8;
    return [{
      x: this.x - r,
      y: this.y - r,
      w: r * 2,
      h: r * 2
    }];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isTriggered) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Piringan Gergaji
    ctx.fillStyle = '#f0ebe1';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gigi Gergaji Merah
    const teeth = 8;
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const nextA = ((i + 0.5) / teeth) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (this.radius - 4), Math.sin(a) * (this.radius - 4));
      ctx.lineTo(Math.cos(nextA) * (this.radius + 6), Math.sin(nextA) * (this.radius + 6));
      ctx.lineTo(Math.cos(a + Math.PI / teeth) * (this.radius - 2), Math.sin(a + Math.PI / teeth) * (this.radius - 2));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
