// T17: Kontrol Terbalik / Invert Control Zone (PRD Bagian 5)

import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class InvertControlZone implements Trap {
  public readonly id: string;
  public readonly type = 'invertControlZone';
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private animTimer = 0;

  constructor(id: string, x: number, y: number, width: number, height: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public reset(): void {
    // Stateless
  }

  public getZoneBox(): Rect {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public update(dt: number, player: Player): void {
    this.animTimer += dt * 4;
    if (Collision.aabb(player.getHitbox(), this.getZoneBox())) {
      player.controlsInverted = true;
    }
  }

  public isDeadly(): boolean {
    return false;
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Zona aura kebingungan kuning/oranye
    ctx.fillStyle = 'rgba(244, 162, 97, 0.12)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = 'rgba(244, 162, 97, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, this.width, this.height);

    // Ikon simbol panah bolak-balik <-> di tengah zona
    ctx.fillStyle = 'rgba(231, 111, 81, 0.7)';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⮂ ⮃', this.width / 2, this.height / 2);

    ctx.restore();
  }
}
