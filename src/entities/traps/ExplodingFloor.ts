// T22: Lantai Meledak / Exploding Floor (PRD Bagian 5.2)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { Camera } from '../../core/Camera';
import { AudioManager } from '../../core/Audio';
import { ParticleSystem } from '../../core/Particles';

export class ExplodingFloor implements Trap {
  public readonly id: string;
  public readonly type = 'explodingFloor';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public explosionRadius = 56; // 48 - 64 px

  // State Machine: IDLE -> ARMED (peringatan 0.6s) -> ACTIVE (ledakan 0.2s) -> DONE
  public state: 'IDLE' | 'ARMED' | 'ACTIVE' | 'DONE' = 'IDLE';
  private warnTimer = 0.35;
  private readonly initialWarnTime: number;
  private explosionTimer = 0.2;

  private camera?: Camera;
  private audio?: AudioManager;
  private particles?: ParticleSystem;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number = CONFIG.TILE_SIZE,
    height: number = CONFIG.TILE_SIZE,
    warnTime = 0.35,
    camera?: Camera,
    audio?: AudioManager,
    particles?: ParticleSystem
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.initialWarnTime = warnTime;
    this.warnTimer = warnTime;
    this.camera = camera;
    this.audio = audio;
    this.particles = particles;
  }

  public reset(): void {
    this.state = 'IDLE';
    this.warnTimer = this.initialWarnTime;
    this.explosionTimer = 0.2;
  }

  public update(dt: number, player: Player): void {
    if (this.state === 'IDLE') {
      const footBox: Rect = {
        x: player.x,
        y: player.y + player.height - 3,
        w: player.width,
        h: 5
      };
      const platformTop: Rect = {
        x: this.x,
        y: this.y - 3,
        w: this.width,
        h: 5
      };

      if (Collision.aabb(footBox, platformTop)) {
        if (this.warnTimer <= 0) {
          // Meledak seketika tanpa jeda waktu!
          this.state = 'ACTIVE';
          this.camera?.shake(0.35, 10);
          this.audio?.playDeath();
          if (this.particles) {
            this.particles.emitStickmanDeath(this.x + this.width / 2, this.y + this.height / 2);
          }
        } else {
          this.state = 'ARMED';
          this.audio?.playStinger();
        }
      }
    } else if (this.state === 'ARMED') {
      this.warnTimer -= dt;
      if (this.warnTimer <= 0) {
        this.state = 'ACTIVE';
        this.camera?.shake(0.3, 8);
        this.audio?.playCrumble();
        if (this.particles) {
          this.particles.emitStickmanDeath(this.x + this.width / 2, this.y + this.height / 2);
        }
      }
    } else if (this.state === 'ACTIVE') {
      this.explosionTimer -= dt;
      if (this.explosionTimer <= 0) {
        this.state = 'DONE';
      }
    }
  }

  public isDeadly(): boolean {
    return this.state === 'ACTIVE';
  }

  public getHitboxes(): Rect[] {
    if (this.state !== 'ACTIVE') return [];
    // Hitbox bahaya radius ledakan
    const r = this.explosionRadius;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    return [{
      x: cx - r,
      y: cy - r,
      w: r * 2,
      h: r * 2
    }];
  }

  public getSolidBox(): Rect | null {
    if (this.state === 'ACTIVE' || this.state === 'DONE') return null;
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    if (this.state === 'IDLE') {
      // Tampak persis seperti lantai solid biasa tanpa tanda peringatan
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
    } else if (this.state === 'ARMED') {
      // Berkedip merah peringatan
      ctx.translate(this.x, this.y);
      const blink = Math.floor(this.warnTimer * 14) % 2 === 0;
      ctx.fillStyle = blink ? CONFIG.COLORS.HAZARD_RED : '#22222b';
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2.5;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.strokeRect(0, 0, this.width, this.height);
    } else if (this.state === 'ACTIVE') {
      // Lingkaran ledakan api besar!
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      ctx.fillStyle = 'rgba(230, 57, 70, 0.85)';
      ctx.strokeStyle = '#ffb703';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, this.explosionRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, this.explosionRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
