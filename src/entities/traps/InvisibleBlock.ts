// T18: Blok Tak Terlihat / Invisible Block (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class InvisibleBlock implements Trap {
  public readonly id: string;
  public readonly type = 'invisibleBlock';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public isRevealed = false;
  private audio?: AudioManager;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number = CONFIG.TILE_SIZE,
    height: number = CONFIG.TILE_SIZE,
    audio?: AudioManager
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.audio = audio;
  }

  public reset(): void {
    this.isRevealed = false;
  }

  public update(_dt: number, player: Player): void {
    if (!this.isRevealed) {
      // Jika kepala atau tubuh pemain menabrak blok ini
      const checkRect: Rect = {
        x: this.x - 2,
        y: this.y - 2,
        w: this.width + 4,
        h: this.height + 4
      };
      if (Collision.aabb(player.getHitbox(), checkRect)) {
        this.isRevealed = true;
        this.audio?.playLand();
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
    // Selalu solid! (Menghalangi lompatan atau jadi pijakan)
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isRevealed) return; // Benar-benar tak terlihat sebelum ditabrak

    ctx.save();
    ctx.translate(this.x, this.y);

    // Setelah ditabrak, muncul garis sketsa doodle tanda tanya '?'
    ctx.fillStyle = '#e5e0d3';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#666';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', this.width / 2, this.height / 2);

    ctx.restore();
  }
}
