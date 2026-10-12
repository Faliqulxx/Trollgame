// T25: Langit-langit Jatuh / Falling Ceiling (PRD Bagian 5.2)

import { CONFIG } from '../../config';
import { Rect, Collision } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { Camera } from '../../core/Camera';
import { AudioManager } from '../../core/Audio';

export class FallingCeiling implements Trap {
  public readonly id: string;
  public readonly type = 'fallingCeiling';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  private startY: number;
  private floorY: number;
  public state: 'IDLE' | 'SHAKING' | 'FALLING' | 'LANDED' = 'IDLE';
  private fallSpeed = 0;
  private playerCrushed = false;

  private camera?: Camera;
  private audio?: AudioManager;

  constructor(
    id: string,
    x: number,
    startY: number,
    floorY: number,
    width: number = CONFIG.TILE_SIZE * 2,
    height: number = CONFIG.TILE_SIZE,
    camera?: Camera,
    audio?: AudioManager
  ) {
    this.id = id;
    this.x = x;
    this.startY = startY;
    this.floorY = floorY;
    this.y = startY;
    this.width = width;
    this.height = height;
    this.camera = camera;
    this.audio = audio;
  }

  public reset(): void {
    this.y = this.startY;
    this.state = 'IDLE';
    this.fallSpeed = 0;
    this.playerCrushed = false;
  }

  public update(dt: number, player: Player): void {
    if (this.state === 'IDLE') {
      // Pemicu: aktif ketika pemain berjalan kurang dari 1 langkah / 1 blok (32px) dari tempat jatuhnya jebakan
      const oneBlock = CONFIG.TILE_SIZE;
      const inXRange = (player.x + player.width > this.x - oneBlock) && (player.x < this.x + this.width + oneBlock);
      const inYRange = player.y > this.y && player.y <= this.floorY + 50;

      if (inXRange && inYRange) {
        // Langsung jatuh tanpa jeda (no shake/delay)
        this.state = 'FALLING';
        this.fallSpeed = 450;
        this.audio?.playCrumble();
      }
    } else if (this.state === 'FALLING') {
      this.fallSpeed += 1800 * dt;
      this.y += this.fallSpeed * dt;

      // Cek apakah balok yang sedang jatuh MENIMPA pemain (hanya jika fisik balok menyentuh pemain)
      const currentBox: Rect = {
        x: this.x + 2,
        y: this.y + 2,
        w: this.width - 4,
        h: this.height + 4
      };
      if (Collision.aabb(player.getHitbox(), currentBox)) {
        this.playerCrushed = true;
      }

      if (this.y >= this.floorY - this.height) {
        this.y = this.floorY - this.height;
        this.state = 'LANDED';
        this.camera?.shake(0.25, 6);
        this.audio?.playLand();

        // Cek jika mendarat tepat menimpa pemain di lantai
        const landingBox: Rect = {
          x: this.x + 2,
          y: this.y + 2,
          w: this.width - 4,
          h: this.height + 4
        };
        if (Collision.aabb(player.getHitbox(), landingBox)) {
          this.playerCrushed = true;
        }
      }
    }
  }

  public isDeadly(): boolean {
    return this.state === 'FALLING' || this.playerCrushed;
  }

  public getHitboxes(): Rect[] {
    if (!this.isDeadly()) return [];
    return [{
      x: this.x + 2,
      y: this.y + 2,
      w: this.width - 4,
      h: this.height + 4 // Hanya balok fisik yang menimpa pemain
    }];
  }

  public getSolidBox(): Rect | null {
    // Saat FALLING atau jika pemain tertimpa, TIDAK SOLID agar langsung mematikan pemain dan tidak mendorongnya
    if (this.state === 'FALLING' || this.playerCrushed) return null;
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    let drawX = this.x;
    let drawY = this.y;

    if (this.state === 'SHAKING') {
      drawX += (Math.random() - 0.5) * 4;
      drawY += (Math.random() - 0.5) * 4;
    }

    ctx.translate(drawX, drawY);

    // Samarkan 100% agar persis sama dengan balok atap solid biasa (PRD & permintaan user)
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
