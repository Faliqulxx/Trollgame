// T23: Lantai Jadi Duri / Spike Transform Floor (PRD Bagian 5.2)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class SpikeTransformFloor implements Trap {
  public readonly id: string;
  public readonly type = 'spikeTransformFloor';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public state: 'IDLE' | 'STEPPED' | 'SPIKES' = 'IDLE';
  private transformTimer = 0.25; // 0.25s setelah mendarat berubah jadi duri
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
    this.state = 'IDLE';
    this.transformTimer = 0.25;
  }

  public update(dt: number, player: Player): void {
    if (this.state === 'IDLE') {
      const footBox: Rect = {
        x: player.x,
        y: player.y + player.height - 3,
        w: player.width,
        h: 5
      };
      const topSurface: Rect = {
        x: this.x,
        y: this.y - 3,
        w: this.width,
        h: 5
      };

      if (Collision.aabb(footBox, topSurface)) {
        this.state = 'STEPPED';
      }
    } else if (this.state === 'STEPPED') {
      this.transformTimer -= dt;
      if (this.transformTimer <= 0) {
        this.state = 'SPIKES';
        this.audio?.playStinger();
      }
    }
  }

  public isDeadly(): boolean {
    return this.state === 'SPIKES';
  }

  public getHitboxes(): Rect[] {
    if (this.state !== 'SPIKES') return [];
    // Hitbox duri di atas permukaan lantai
    return [{
      x: this.x + 2,
      y: this.y - 20,
      w: this.width - 4,
      h: 22
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

    if (this.state === 'IDLE') {
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
    } else if (this.state === 'STEPPED') {
      // Sedikit kilatan peringatan
      ctx.fillStyle = '#6b705c';
      ctx.strokeStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.lineWidth = 2;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.strokeRect(0, 0, this.width, this.height);
    } else {
      // Berubah jadi duri merah tajam menusuk ke atas!
      ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK_FILL;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.strokeRect(0, 0, this.width, this.height);

      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 1.8;

      const count = 2;
      const sw = this.width / count;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(i * sw + 2, 0);
        ctx.lineTo(i * sw + sw / 2, -22);
        ctx.lineTo((i + 1) * sw - 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
