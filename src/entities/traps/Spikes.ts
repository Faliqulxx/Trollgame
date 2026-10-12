// T01: Duri Statis (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export type SpikeOrientation = 'up' | 'down' | 'left' | 'right';

export class Spikes implements Trap {
  public readonly id: string;
  public readonly type = 'spikes';
  public x: number;
  public y: number;
  public count: number;
  public orientation: SpikeOrientation;
  public tileSize: number;

  constructor(
    id: string,
    x: number,
    y: number,
    count = 1,
    orientation: SpikeOrientation = 'up',
    tileSize: number = CONFIG.TILE_SIZE
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.count = count;
    this.orientation = orientation;
    this.tileSize = tileSize;
  }

  public update(_dt: number, _player: Player): void {
    // Duri statis tidak berubah
  }

  public reset(): void {
    // Tetap
  }

  public isDeadly(): boolean {
    return true;
  }

  public getHitboxes(): Rect[] {
    const boxes: Rect[] = [];
    const spikeWidth = this.tileSize;

    for (let i = 0; i < this.count; i++) {
      if (this.orientation === 'up') {
        boxes.push({
          x: this.x + i * spikeWidth + 2,
          y: this.y,
          w: spikeWidth - 4,
          h: this.tileSize
        });
      } else if (this.orientation === 'down') {
        boxes.push({
          x: this.x + i * spikeWidth + 2,
          y: this.y,
          w: spikeWidth - 4,
          h: this.tileSize
        });
      } else if (this.orientation === 'left') {
        boxes.push({
          x: this.x,
          y: this.y + i * spikeWidth + 2,
          w: this.tileSize,
          h: spikeWidth - 4
        });
      } else if (this.orientation === 'right') {
        boxes.push({
          x: this.x,
          y: this.y + i * spikeWidth + 2,
          w: this.tileSize,
          h: spikeWidth - 4
        });
      }
    }
    return boxes;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 1.8;

    const spikeWidth = this.tileSize;

    for (let i = 0; i < this.count; i++) {
      ctx.beginPath();
      if (this.orientation === 'up') {
        const baseX = this.x + i * spikeWidth;
        const baseY = this.y + this.tileSize;
        ctx.moveTo(baseX + 1, baseY);
        ctx.lineTo(baseX + spikeWidth / 2, this.y);
        ctx.lineTo(baseX + spikeWidth - 1, baseY);
      } else if (this.orientation === 'down') {
        const baseX = this.x + i * spikeWidth;
        const baseY = this.y;
        ctx.moveTo(baseX + 1, baseY);
        ctx.lineTo(baseX + spikeWidth / 2, this.y + this.tileSize);
        ctx.lineTo(baseX + spikeWidth - 1, baseY);
      } else if (this.orientation === 'left') {
        const baseX = this.x + this.tileSize;
        const baseY = this.y + i * spikeWidth;
        ctx.moveTo(baseX, baseY + 1);
        ctx.lineTo(this.x, baseY + spikeWidth / 2);
        ctx.lineTo(baseX, baseY + spikeWidth - 1);
      } else if (this.orientation === 'right') {
        const baseX = this.x;
        const baseY = this.y + i * spikeWidth;
        ctx.moveTo(baseX, baseY + 1);
        ctx.lineTo(this.x + this.tileSize, baseY + spikeWidth / 2);
        ctx.lineTo(baseX, baseY + spikeWidth - 1);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
