import { CONFIG } from '../../config';
import { Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class FakeDoor implements Trap {
  public readonly id: string;
  public readonly type = 'fakeDoor';
  public x: number;
  public y: number;
  public width = 32;
  public height = 48;
  public isTriggered = false;
  private audio?: AudioManager;

  constructor(id: string, x: number, y: number, audio?: AudioManager) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.audio = audio;
  }

  public reset(): void {
    this.isTriggered = false;
  }

  public update(_dt: number, player: Player): void {
    if (!this.isTriggered) {
      // Dekat dengan pintu (dalam jarak 45px)
      const dist = Math.hypot(
        (player.x + player.width / 2) - (this.x + this.width / 2),
        (player.y + player.height / 2) - (this.y + this.height / 2)
      );
      if (dist < 45) {
        this.isTriggered = true;
        this.audio?.playStinger();
      }
    }
  }

  public isDeadly(): boolean {
    return this.isTriggered;
  }

  public getHitboxes(): Rect[] {
    if (!this.isTriggered) return [];
    return [{
      x: this.x - 8,
      y: this.y - 8,
      w: this.width + 16,
      h: this.height + 16
    }];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (!this.isTriggered) {
      // Tampak persis seperti pintu keluar normal!
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, this.width, this.height);

      ctx.fillStyle = CONFIG.COLORS.EXIT_GREEN;
      ctx.fillRect(3, 3, this.width - 6, this.height - 3);

      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(this.width - 8, this.height / 2 + 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', this.width / 2, -4);
    } else {
      // Terbuka menampakkan taring monster dan duri berdarah!
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.strokeStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, this.width, this.height);

      // Taring tajam
      ctx.fillStyle = '#fff';
      const teethCount = 4;
      const tw = this.width / teethCount;
      for (let i = 0; i < teethCount; i++) {
        // Atas
        ctx.beginPath();
        ctx.moveTo(i * tw, 0);
        ctx.lineTo(i * tw + tw / 2, 16);
        ctx.lineTo((i + 1) * tw, 0);
        ctx.closePath();
        ctx.fill();
        // Bawah
        ctx.beginPath();
        ctx.moveTo(i * tw, this.height);
        ctx.lineTo(i * tw + tw / 2, this.height - 16);
        ctx.lineTo((i + 1) * tw, this.height);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TROLL!', this.width / 2, -6);
    }

    ctx.restore();
  }
}
