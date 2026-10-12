// T05: Gergaji Bergerak / Saw (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Circle, Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class Saw implements Trap {
  public readonly id: string;
  public readonly type = 'saw';
  public x: number;
  public y: number;
  public radius: number;

  // Gerakan jalur A -> B
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private progress = 0;
  private direction = 1;
  private angle = 0;

  constructor(
    id: string,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    radius = 18,
    speed = 100
  ) {
    this.id = id;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = startX;
    this.y = startY;
    this.radius = radius;
    this.speed = speed;
  }

  public reset(): void {
    this.progress = 0;
    this.direction = 1;
    this.x = this.startX;
    this.y = this.startY;
  }

  public update(dt: number, _player: Player): void {
    const dist = Math.hypot(this.targetX - this.startX, this.targetY - this.startY);
    if (dist > 0) {
      const step = (this.speed * dt) / dist;
      this.progress += step * this.direction;
      if (this.progress >= 1) {
        this.progress = 1;
        this.direction = -1;
      } else if (this.progress <= 0) {
        this.progress = 0;
        this.direction = 1;
      }
      this.x = this.startX + (this.targetX - this.startX) * this.progress;
      this.y = this.startY + (this.targetY - this.startY) * this.progress;
    }

    // Putaran gergaji
    this.angle += dt * 12 * this.direction;
  }

  public isDeadly(): boolean {
    return true;
  }

  public getCircle(): Circle {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius - 2 // sedikit lebih kecil agar adil
    };
  }

  public getHitboxes(): Rect[] {
    // Kembalikan bounding box untuk sistem deteksi AABB cepat
    const r = this.radius * 0.8;
    return [{
      x: this.x - r,
      y: this.y - r,
      w: r * 2,
      h: r * 2
    }];
  }

  public checkPlayerCollision(player: Player): boolean {
    return Collision.circleRect(this.getCircle(), player.getHitbox());
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Gambar jalur rel jika ada pergerakan
    if (this.startX !== this.targetX || this.startY !== this.targetY) {
      ctx.strokeStyle = '#c4beb0';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.startX, this.startY);
      ctx.lineTo(this.targetX, this.targetY);
      ctx.stroke();
    }

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Piringan Gergaji
    ctx.fillStyle = '#dcd6ca';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gigi-gigi Gergaji Tajam
    const teeth = 8;
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const nextA = ((i + 0.5) / teeth) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (this.radius - 4), Math.sin(a) * (this.radius - 4));
      ctx.lineTo(Math.cos(nextA) * (this.radius + 5), Math.sin(nextA) * (this.radius + 5));
      ctx.lineTo(Math.cos(a + Math.PI / teeth) * (this.radius - 2), Math.sin(a + Math.PI / teeth) * (this.radius - 2));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Poros tengah
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
