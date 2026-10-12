// T04: Lantai Palsu / Lubang Tersembunyi (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class FakeFloor implements Trap {
  public readonly id: string;
  public readonly type = 'fakeFloor';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public isDiscovered = false;
  private opacity = 1;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number = CONFIG.TILE_SIZE,
    height: number = CONFIG.TILE_SIZE
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public reset(): void {
    this.isDiscovered = false;
    this.opacity = 1;
  }

  public update(dt: number, player: Player): void {
    if (!this.isDiscovered) {
      const box: Rect = { x: this.x, y: this.y - 4, w: this.width, h: this.height + 8 };
      if (Collision.aabb(player.getHitbox(), box)) {
        this.isDiscovered = true;
      }
    } else {
      if (this.opacity > 0.15) {
        this.opacity = Math.max(0.15, this.opacity - dt * 4);
      }
    }
  }

  public isDeadly(): boolean {
    return false; // Menipu agar pemain jatuh ke duri/lubang di bawahnya
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;
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
