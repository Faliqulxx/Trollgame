// T13: Checkpoint Palsu / Fake Checkpoint (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class FakeCheckpoint implements Trap {
  public readonly id: string;
  public readonly type = 'fakeCheckpoint';
  public x: number;
  public y: number;
  public width = 24;
  public height = 40;
  public isTriggered = false;
  private audio?: AudioManager;

  constructor(id: string, x: number, y: number, audio?: AudioManager) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.audio = audio;
  }

  public reset(): void {
    this.isTriggered = false;
  }

  public update(_dt: number, player: Player): void {
    if (!this.isTriggered) {
      const box: Rect = { x: this.x, y: this.y, w: this.width, h: this.height };
      if (Collision.aabb(player.getHitbox(), box)) {
        this.isTriggered = true;
        this.audio?.playStinger();
      }
    }
  }

  public isDeadly(): boolean {
    return this.isTriggered;
  }

  public getHitboxes(): Rect[] {
    if (!this.isTriggered) return [];
    return [{
      x: this.x - 8,
      y: this.y - 8,
      w: this.width + 16,
      h: this.height + 8
    }];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Tiang bendera
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(4, this.height);
    ctx.lineTo(4, 2);
    ctx.stroke();

    // Bendera (sedikit warna ungu/biru menipu)
    ctx.fillStyle = this.isTriggered ? CONFIG.COLORS.HAZARD_RED : '#5e60ce';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(20, 10);
    ctx.lineTo(4, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Jika dipicu: duri raksasa menusuk keluar ke segala arah!
    if (this.isTriggered) {
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2;

      // Duri atas, kiri, kanan
      const spikes = [
        { x: -10, y: 15, tx: -16, ty: 15 },
        { x: 18, y: 15, tx: 26, ty: 15 },
        { x: 4, y: 0, tx: 4, ty: -18 }
      ];

      for (const sp of spikes) {
        ctx.beginPath();
        ctx.moveTo(sp.x - 4, sp.y);
        ctx.lineTo(sp.tx, sp.ty);
        ctx.lineTo(sp.x + 4, sp.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
