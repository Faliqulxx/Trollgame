// T11: Laser Beritme (PRD Bagian 5)

import { Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class Laser implements Trap {
  public readonly id: string;
  public readonly type = 'laser';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public onDuration: number;
  public offDuration: number;

  private timer = 0;
  public isOn = false;

  constructor(
    id: string,
    x: number,
    y: number,
    width = 8,
    height = 120,
    onDuration = 1.2,
    offDuration = 1.2,
    startOffset = 0
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.onDuration = onDuration;
    this.offDuration = offDuration;
    this.timer = startOffset;
    this.isOn = (this.timer % (onDuration + offDuration)) >= offDuration;
  }

  public reset(): void {
    this.timer = 0;
    this.isOn = false;
  }

  public update(dt: number, _player: Player): void {
    this.timer += dt;
    const cycle = this.onDuration + this.offDuration;
    const mod = this.timer % cycle;
    this.isOn = mod >= this.offDuration;
  }

  public isDeadly(): boolean {
    return this.isOn;
  }

  public getHitboxes(): Rect[] {
    if (!this.isOn) return [];
    return [{
      x: this.x + 1,
      y: this.y,
      w: this.width - 2,
      h: this.height
    }];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Pemancar laser (emitter di ujung atas & bawah)
    ctx.fillStyle = '#212529';
    ctx.fillRect(this.x - 3, this.y - 4, this.width + 6, 6);
    ctx.fillRect(this.x - 3, this.y + this.height - 2, this.width + 6, 6);

    const cycle = this.onDuration + this.offDuration;
    const mod = this.timer % cycle;
    const isWarning = !this.isOn && (this.offDuration - mod < 0.4);

    if (this.isOn) {
      // Sinar laser aktif membara
      ctx.fillStyle = 'rgba(230, 57, 70, 0.9)';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Inti putih laser
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + 2, this.y, this.width - 4, this.height);

      // Cahaya glow
      ctx.fillStyle = 'rgba(230, 57, 70, 0.25)';
      ctx.fillRect(this.x - 4, this.y, this.width + 8, this.height);
    } else if (isWarning) {
      // Garis peringatan berkedip tipis
      ctx.strokeStyle = 'rgba(230, 57, 70, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height);
      ctx.stroke();
    }

    ctx.restore();
  }
}
