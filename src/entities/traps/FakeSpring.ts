// T26: Pegas Palsu / Fake Spring (PRD Bagian 5.2)

import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class FakeSpring implements Trap {
  public readonly id: string;
  public readonly type = 'fakeSpring';
  public x: number;
  public y: number;
  public width = 28;
  public height = 12;
  public launchSpeed = -1100; // Melontarkan sangat tinggi ke arah duri langit-langit!

  private compressed = false;
  private audio?: AudioManager;

  constructor(id: string, x: number, y: number, audio?: AudioManager) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.audio = audio;
  }

  public reset(): void {
    this.compressed = false;
  }

  public update(_dt: number, player: Player): void {
    const footBox: Rect = {
      x: player.x,
      y: player.y + player.height - 4,
      w: player.width,
      h: 6
    };
    const springBox: Rect = {
      x: this.x,
      y: this.y - 4,
      w: this.width,
      h: 8
    };

    if (Collision.aabb(footBox, springBox)) {
      player.vy = this.launchSpeed;
      player.isGrounded = false;
      this.compressed = true;
      this.audio?.playJump();
    }
  }

  public isDeadly(): boolean {
    return false; // Membunuh dengan melontarkan pemain ke duri atap
  }

  public getHitboxes(): Rect[] {
    return [];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Dasar pegas
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(0, this.height - 4, this.width, 4);

    // Kumparan pegas merah menipu
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const h = this.compressed ? 5 : this.height - 2;
    ctx.moveTo(4, this.height - 4);
    ctx.lineTo(this.width - 4, this.height - 4 - h * 0.5);
    ctx.lineTo(4, this.height - 4 - h);
    ctx.lineTo(this.width - 4, this.height - 4 - h);
    ctx.stroke();

    // Plat atas pegas
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(2, this.height - 4 - h - 3, this.width - 4, 3);

    ctx.restore();
  }
}
