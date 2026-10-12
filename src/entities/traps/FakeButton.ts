// T12: Tombol Palsu / Fake Button (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Collision, Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { AudioManager } from '../../core/Audio';

export class FakeButton implements Trap {
  public readonly id: string;
  public readonly type = 'fakeButton';
  public x: number;
  public y: number;
  public width = 24;
  public height = 8;
  public isPressed = false;
  private audio?: AudioManager;

  constructor(id: string, x: number, y: number, audio?: AudioManager) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.audio = audio;
  }

  public reset(): void {
    this.isPressed = false;
  }

  public update(_dt: number, player: Player): void {
    if (!this.isPressed) {
      const buttonBox: Rect = { x: this.x, y: this.y - 2, w: this.width, h: this.height + 2 };
      if (Collision.aabb(player.getHitbox(), buttonBox)) {
        this.isPressed = true;
        this.audio?.playStinger();
      }
    }
  }

  public isDeadly(): boolean {
    return this.isPressed;
  }

  public getHitboxes(): Rect[] {
    if (!this.isPressed) return [];
    // Duri menusuk ke atas tepat di tempat tombol saat diinjak!
    return [{
      x: this.x + 2,
      y: this.y - 24,
      w: this.width - 4,
      h: 28
    }];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Dasar tombol
    ctx.fillStyle = '#6c757d';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 1.5;
    ctx.fillRect(0, 4, this.width, 4);
    ctx.strokeRect(0, 4, this.width, 4);

    // Bagian tombol merah yang mengundang untuk ditekan
    ctx.fillStyle = this.isPressed ? '#495057' : '#e63946';
    const btnHeight = this.isPressed ? 2 : 5;
    ctx.fillRect(4, 4 - btnHeight, this.width - 8, btnHeight);
    ctx.strokeRect(4, 4 - btnHeight, this.width - 8, btnHeight);

    // Jika ditekan, duri mematikan meledak keluar dari tombol!
    if (this.isPressed) {
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(this.width / 2, -22);
      ctx.lineTo(this.width - 4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
