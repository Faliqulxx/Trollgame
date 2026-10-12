// T20: Lantai Hilang Saat Diinjak / Vanishing Floor (PRD Bagian 5.2)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { ParticleSystem } from '../../core/Particles';
import { AudioManager } from '../../core/Audio';

export class VanishingFloor implements Trap {
  public readonly id: string;
  public readonly type = 'vanishingFloor';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public delay: number; // default <= 0.1s

  // State Machine: IDLE -> ARMED -> ACTIVE (lenyap) -> DONE
  public state: 'IDLE' | 'ARMED' | 'ACTIVE' = 'IDLE';
  private timer = 0;
  private particles?: ParticleSystem;
  private audio?: AudioManager;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number = CONFIG.TILE_SIZE,
    height: number = CONFIG.TILE_SIZE,
    delay = 0.08,
    particles?: ParticleSystem,
    audio?: AudioManager
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.delay = delay;
    this.particles = particles;
    this.audio = audio;
  }

  public reset(): void {
    this.state = 'IDLE';
    this.timer = 0;
  }

  public update(dt: number, player: Player): void {
    if (this.state === 'IDLE') {
      // Cek apakah pemain menyentuh bagian atas tile
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
        player.coyoteTimer = 0;
        player.isGrounded = false;
        if (this.delay <= 0) {
          this.state = 'ACTIVE';
          if (this.particles) {
            this.particles.emitCrumble(this.x, this.y, this.width);
          }
        } else {
          this.state = 'ARMED';
          this.timer = this.delay;
        }
        this.audio?.playCrumble();
      }
    }

    if (this.state === 'ARMED') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = 'ACTIVE';
        if (this.particles) {
          this.particles.emitCrumble(this.x, this.y, this.width);
        }
      }
    }
  }

  public isDeadly(): boolean {
    return false; // Membunuh dengan membuat pemain jatuh ke lubang/duri bawah
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public getSolidBox(): Rect | null {
    // Non-solid begitu mencapai status ACTIVE atau ARMED dengan delay 0
    if (this.state === 'ACTIVE' || (this.state === 'ARMED' && this.delay <= 0)) return null;
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.state === 'ACTIVE') return;

    ctx.save();
    let drawX = this.x;
    let drawY = this.y;

    // Getar sedikit jika ARMED
    if (this.state === 'ARMED') {
      drawX += (Math.random() - 0.5) * 3;
      drawY += (Math.random() - 0.5) * 3;
    }

    ctx.translate(drawX, drawY);

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
