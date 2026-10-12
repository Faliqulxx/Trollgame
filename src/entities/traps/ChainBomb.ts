// T27: Lantai Bom Berantai / Chain Bomb (PRD Bagian 5.2)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';
import { Camera } from '../../core/Camera';

export class ChainBomb implements Trap {
  public readonly id: string;
  public readonly type = 'chainBomb';
  public x: number;
  public y: number;
  public count: number;
  public tileSize: number;

  public isTriggered = false;
  private currentExplodeIndex = -1;
  private timer = 0;
  private interval = 0.25; // Meledak berurutan tiap 0.25s (PRD 5.2)

  private audio?: AudioManager;
  private camera?: Camera;

  constructor(
    id: string,
    x: number,
    y: number,
    count = 5,
    tileSize: number = CONFIG.TILE_SIZE,
    audio?: AudioManager,
    camera?: Camera
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.count = count;
    this.tileSize = tileSize;
    this.audio = audio;
    this.camera = camera;
  }

  public reset(): void {
    this.isTriggered = false;
    this.currentExplodeIndex = -1;
    this.timer = 0;
  }

  public update(dt: number, player: Player): void {
    if (!this.isTriggered) {
      // Pemain menginjak salah satu tile awal
      const footBox: Rect = {
        x: player.x,
        y: player.y + player.height - 3,
        w: player.width,
        h: 5
      };
      const triggerBox: Rect = {
        x: this.x,
        y: this.y - 3,
        w: this.tileSize * 2,
        h: 5
      };

      if (Collision.aabb(footBox, triggerBox)) {
        this.isTriggered = true;
        this.currentExplodeIndex = 0;
        this.timer = this.interval;
        this.audio?.playStinger();
      }
    } else {
      if (this.currentExplodeIndex < this.count) {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.currentExplodeIndex++;
          this.timer = this.interval;
          this.audio?.playCrumble();
          this.camera?.shake(0.15, 4);
        }
      }
    }
  }

  public isDeadly(): boolean {
    return this.isTriggered && this.currentExplodeIndex >= 0 && this.currentExplodeIndex < this.count;
  }

  public getHitboxes(): Rect[] {
    if (!this.isDeadly()) return [];

    // Hitbox mematikan pada tile yang sedang meledak
    const idx = this.currentExplodeIndex;
    const ts = this.tileSize;
    return [{
      x: this.x + idx * ts,
      y: this.y - 8,
      w: ts,
      h: ts + 16
    }];
  }

  public getSolidBox(): Rect | null {
    // Tile yang belum meledak tetap solid
    return null;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const ts = this.tileSize;

    for (let i = 0; i < this.count; i++) {
      const bx = this.x + i * ts;

      if (i < this.currentExplodeIndex) {
        // Sudah hancur / meledak (kosong)
        continue;
      } else if (i === this.currentExplodeIndex) {
        // Sedang meledak api
        ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
        ctx.fillRect(bx, this.y - 8, ts, ts + 8);
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(bx + 4, this.y - 4, ts - 8, ts);
      } else {
        // Belum meledak: tile bom berkedip jika triggered, jika belum tampak persis seperti lantai solid biasa
        const isBlinking = this.isTriggered && (i === this.currentExplodeIndex + 1);
        ctx.fillStyle = isBlinking ? '#e63946' : CONFIG.COLORS.SOLID_BLOCK_FILL;
        ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
        ctx.lineWidth = 2;
        ctx.fillRect(bx, this.y, ts, ts);
        ctx.strokeRect(bx, this.y, ts, ts);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + 4, this.y + 4);
        ctx.lineTo(bx + ts - 4, this.y + 4);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
