// T16: Gravitasi Balik / Gravity Zone (PRD Bagian 5)

import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class GravityZone implements Trap {
  public readonly id: string;
  public readonly type = 'gravityZone';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private animTimer = 0;

  constructor(id: string, x: number, y: number, width: number, height: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public reset(): void {
    // Tidak ada state permanen
  }

  public getZoneBox(): Rect {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public update(dt: number, player: Player): void {
    this.animTimer += dt * 3;
    if (Collision.aabb(player.getHitbox(), this.getZoneBox())) {
      player.gravityScale = -1; // Balik gravitasi!
    }
  }

  public isDeadly(): boolean {
    return false;
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Area latar transparan ungu misterius
    ctx.fillStyle = 'rgba(157, 78, 221, 0.12)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Border putus-putus
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(0, 0, this.width, this.height);

    // Panah melayang ke atas (menandakan gravitasi terbalik)
    ctx.fillStyle = 'rgba(157, 78, 221, 0.5)';
    const arrowSpacing = 40;
    const offset = (this.animTimer * 15) % 20;

    for (let ax = 20; ax < this.width; ax += arrowSpacing) {
      for (let ay = 20; ay < this.height; ay += arrowSpacing) {
        const py = ay - offset;
        if (py < 5 || py > this.height - 5) continue;
        ctx.beginPath();
        ctx.moveTo(ax, py);
        ctx.lineTo(ax - 5, py + 8);
        ctx.lineTo(ax + 5, py + 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
