// T09: Platform Bergerak / Moving Platform (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class MovingPlatform implements Trap {
  public readonly id: string;
  public readonly type = 'movingPlatform';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private progress = 0;
  private direction = 1;
  public deltaX = 0;
  public deltaY = 0;
  private isTrollFall: boolean;
  private steppedTimer = 0;
  private hasFallen = false;

  constructor(
    id: string,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    width = 64,
    height = 16,
    speed = 80,
    isTrollFall = false
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
    this.speed = speed;
    this.isTrollFall = isTrollFall;
  }

  public reset(): void {
    this.x = this.startX;
    this.y = this.startY;
    this.progress = 0;
    this.direction = 1;
    this.steppedTimer = 0;
    this.hasFallen = false;
    this.deltaX = 0;
    this.deltaY = 0;
  }

  public update(dt: number, player: Player): void {
    const oldX = this.x;
    const oldY = this.y;

    if (this.isTrollFall && this.hasFallen) {
      this.y += 400 * dt;
      this.deltaX = 0;
      this.deltaY = this.y - oldY;
      return;
    }

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

    this.deltaX = this.x - oldX;
    this.deltaY = this.y - oldY;

    // Cek apakah pemain berdiri di atas platform ini
    const footBox: Rect = {
      x: player.x,
      y: player.y + player.height - 2,
      w: player.width,
      h: 5
    };
    const platformTop: Rect = {
      x: this.x,
      y: this.y - 4,
      w: this.width,
      h: 6
    };

    if (Collision.aabb(footBox, platformTop)) {
      // Ikut gerakkan pemain bersama platform!
      player.x += this.deltaX;
      player.y += this.deltaY;

      if (this.isTrollFall && !this.hasFallen) {
        this.steppedTimer += dt;
        if (this.steppedTimer > 0.3) {
          this.hasFallen = true;
        }
      }
    }
  }

  public isDeadly(): boolean {
    return false;
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public getSolidBox(): Rect | null {
    if (this.isTrollFall && this.hasFallen) return null;
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

    ctx.fillStyle = '#495057';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeRect(0, 0, this.width, this.height);

    // Garis garis rel pijakan
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1.5;
    for (let px = 8; px < this.width - 6; px += 12) {
      ctx.beginPath();
      ctx.moveTo(px, 3);
      ctx.lineTo(px, this.height - 3);
      ctx.stroke();
    }

    ctx.restore();
  }
}
