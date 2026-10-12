// T24: Lantai Terbuka / Trapdoor (PRD Bagian 5.2)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class Trapdoor implements Trap {
  public readonly id: string;
  public readonly type = 'trapdoor';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public state: 'CLOSED' | 'OPENING' | 'OPEN' = 'CLOSED';
  private openProgress = 0; // 0 -> 1 (berayun ke bawah 90 derajat)
  private audio?: AudioManager;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number = CONFIG.TILE_SIZE * 2,
    height = 12,
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
    this.state = 'CLOSED';
    this.openProgress = 0;
  }

  public update(dt: number, player: Player): void {
    if (this.state === 'CLOSED') {
      const footBox: Rect = {
        x: player.x,
        y: player.y + player.height - 3,
        w: player.width,
        h: 5
      };
      const triggerTop: Rect = {
        x: this.x,
        y: this.y - 3,
        w: this.width,
        h: 5
      };

      if (Collision.aabb(footBox, triggerTop)) {
        this.state = 'OPENING';
        player.coyoteTimer = 0;
        player.isGrounded = false;
        this.audio?.playCrumble();
      }
    } else if (this.state === 'OPENING') {
      this.openProgress = Math.min(1, this.openProgress + dt * 5); // 0.2s animasi
      if (this.openProgress >= 1) {
        this.state = 'OPEN';
      }
    }
  }

  public isDeadly(): boolean {
    return false; // Membuat pemain jatuh
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public getSolidBox(): Rect | null {
    if (this.state === 'OPENING' || this.state === 'OPEN') return null;
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Saat masih tertutup, tampak 100% persis seperti lantai solid biasa
    if (this.state === 'CLOSED') {
      const ts = CONFIG.TILE_SIZE;
      const tileCount = Math.max(1, Math.round(this.width / ts));

      for (let i = 0; i < tileCount; i++) {
        const px = this.x + i * ts;
        const tw = Math.min(ts, this.width - i * ts);

        ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK_FILL;
        ctx.fillRect(px, this.y, tw, this.height);

        ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
        ctx.lineWidth = 2;
        ctx.strokeRect(px, this.y, tw, this.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 4, this.y + 4);
        ctx.lineTo(px + tw - 4, this.y + 4);
        ctx.stroke();
      }

      ctx.restore();
      return;
    }

    const halfW = this.width / 2;
    const angle = this.openProgress * (Math.PI / 2.2);

    // Daun Pintu Kiri terbelah ke bawah
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK_FILL;
    ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, halfW, this.height);
    ctx.strokeRect(0, 0, halfW, this.height);
    ctx.restore();

    // Daun Pintu Kanan terbelah ke bawah
    ctx.save();
    ctx.translate(this.x + this.width, this.y);
    ctx.rotate(-angle);
    ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK_FILL;
    ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
    ctx.lineWidth = 2;
    ctx.fillRect(-halfW, 0, halfW, this.height);
    ctx.strokeRect(-halfW, 0, halfW, this.height);
    ctx.restore();

    ctx.restore();
  }
}
