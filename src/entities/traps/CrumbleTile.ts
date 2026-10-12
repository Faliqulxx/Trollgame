// T03: Lantai Runtuh / Crumble Tile (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';
import { ParticleSystem } from '../../core/Particles';

export class CrumbleTile implements Trap {
  public readonly id: string;
  public readonly type = 'crumbleTile';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  // Status
  public isSteppedOn = false;
  public isBroken = false;
  private fallY = 0;
  private fallSpeed = 0;

  private audio?: AudioManager;
  private particles?: ParticleSystem;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number = CONFIG.TILE_SIZE,
    height: number = CONFIG.TILE_SIZE,
    audio?: AudioManager,
    particles?: ParticleSystem
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.audio = audio;
    this.particles = particles;
  }

  public reset(): void {
    this.isSteppedOn = false;
    this.isBroken = false;
    this.fallY = 0;
    this.fallSpeed = 0;
  }

  public update(dt: number, player: Player): void {
    if (!this.isSteppedOn) {
      // Periksa apakah pemain menyentuh atau menginjak platform ini
      const footBox: Rect = {
        x: player.x,
        y: player.y + player.height - 3,
        w: player.width,
        h: 6
      };
      const platformTop: Rect = {
        x: this.x,
        y: this.y - 4,
        w: this.width,
        h: 6
      };

      if (Collision.aabb(footBox, platformTop)) {
        this.isSteppedOn = true;
        this.isBroken = true;
        this.fallSpeed = 900; // Langsung meluncur jatuh ke bawah dengan kecepatan tinggi!
        player.coyoteTimer = 0;
        player.isGrounded = false;
        this.audio?.playCrumble();
        if (this.particles) {
          this.particles.emitCrumble(this.x, this.y, this.width);
        }
      }
    } else {
      // Langsung jatuh ke bawah cepat tanpa jeda waktu
      this.fallSpeed += 1200 * dt;
      this.fallY += this.fallSpeed * dt;
    }
  }

  public isDeadly(): boolean {
    return false; // Crumble tile membunuh dengan membuat pemain langsung jatuh ke jurang
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public getSolidBox(): Rect | null {
    // Seketika non-solid begitu diinjak!
    if (this.isBroken || this.isSteppedOn) return null;
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.fallY > 600) return; // Hilang di luar layar

    ctx.save();
    let drawX = this.x;
    let drawY = this.y + this.fallY;

    // Efek getar sebelum runtuh
    if (this.isSteppedOn && !this.isBroken) {
      drawX += (Math.random() - 0.5) * 4;
      drawY += (Math.random() - 0.5) * 4;
    }

    ctx.translate(drawX, drawY);

    const ts = CONFIG.TILE_SIZE;
    const tileCount = Math.max(1, Math.round(this.width / ts));

    // Sebelum diinjak: tampak persis seperti lantai solid biasa (tanpa retakan)
    for (let i = 0; i < tileCount; i++) {
      const px = i * ts;
      const tw = Math.min(ts, this.width - px);

      ctx.fillStyle = this.isSteppedOn ? '#484858' : CONFIG.COLORS.SOLID_BLOCK_FILL;
      ctx.fillRect(px, 0, tw, this.height);

      ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
      ctx.lineWidth = 2;
      ctx.strokeRect(px, 0, tw, this.height);

      // Detail sketsa di permukaan lantai biasa
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 4, 4);
      ctx.lineTo(px + tw - 4, 4);
      ctx.stroke();

      // Tampilkan retakan saat mulai jatuh
      if (this.isSteppedOn) {
        ctx.strokeStyle = '#202028';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px + 4, 4);
        ctx.lineTo(px + tw * 0.4, this.height * 0.6);
        ctx.lineTo(px + tw * 0.7, this.height * 0.3);
        ctx.lineTo(px + tw - 4, this.height - 4);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
