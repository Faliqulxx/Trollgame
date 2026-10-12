// T02: Duri Muncul Tiba-tiba (PRD Bagian 5.3 Revisi v1.1 - Anti Bug Duri di Dalam Lantai)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class HiddenSpikes implements Trap {
  public readonly id: string;
  public readonly type = 'hiddenSpikes';
  public x: number;
  public y: number; // baseY = permukaan atas lantai tempat duri keluar
  public count: number;
  public trigger: Rect;
  public tileSize: number;

  // Status
  public isTriggered = false;
  public extendProgress = 0; // 0 (tersembunyi) -> 1 (muncul penuh ke atas lantai)
  public spikeHeight = 28; // Tinggi duri di atas permukaan lantai (px)
  private popSpeed = 12.5; // Menyembul penuh dalam ~0.08s (PRD 5.3)
  private audio?: AudioManager;

  constructor(
    id: string,
    x: number,
    y: number,
    count = 1,
    trigger: Rect,
    tileSize: number = CONFIG.TILE_SIZE,
    audio?: AudioManager
  ) {
    this.id = id;
    this.x = x;
    this.y = y; // Permukaan lantai
    this.count = count;
    this.trigger = trigger;
    this.tileSize = tileSize;
    this.audio = audio;
  }

  public reset(): void {
    this.isTriggered = false;
    this.extendProgress = 0;
  }

  public update(dt: number, player: Player): void {
    if (!this.isTriggered) {
      if (Collision.aabb(player.getHitbox(), this.trigger)) {
        this.isTriggered = true;
        this.audio?.playStinger();
      }
    } else {
      if (this.extendProgress < 1) {
        this.extendProgress = Math.min(1, this.extendProgress + dt * this.popSpeed);
      }
    }
  }

  /**
   * Hitbox bahaya aktif ketika duri keluar ≥ 30% dari permukaan lantai (PRD 5.3)
   */
  public isDeadly(): boolean {
    return this.isTriggered && this.extendProgress >= 0.3;
  }

  /**
   * Hitbox bahaya selalu berada DI ATAS PERMUKAAN LANTAI (baseY - h ke baseY)
   */
  public getHitboxes(): Rect[] {
    if (!this.isDeadly()) return [];

    const boxes: Rect[] = [];
    const spikeWidth = this.tileSize;
    const currentHeight = this.spikeHeight * this.extendProgress;

    for (let i = 0; i < this.count; i++) {
      boxes.push({
        x: this.x + i * spikeWidth + 4,
        y: this.y - currentHeight, // Menyembul ke atas permukaan lantai!
        w: spikeWidth - 8,
        h: currentHeight
      });
    }
    return boxes;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Sebelum dipicu: tidak ada garis atau celah tanda sama sekali (lantai terlihat normal)

    // 2. Duri menyembul ke atas dari permukaan lantai
    if (this.isTriggered && this.extendProgress > 0.05) {
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 1.8;

      const spikeWidth = this.tileSize;
      const currentHeight = this.spikeHeight * this.extendProgress;

      for (let i = 0; i < this.count; i++) {
        const baseX = this.x + i * spikeWidth;
        const baseY = this.y;

        ctx.beginPath();
        ctx.moveTo(baseX + 2, baseY);
        ctx.lineTo(baseX + spikeWidth / 2, baseY - currentHeight); // Puncak duri di atas lantai
        ctx.lineTo(baseX + spikeWidth - 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
