// T19: Teks Menipu / Rambu Troll (PRD Bagian 5 & 6.1)

import { CONFIG } from '../../config';
import { Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';

export class TrollSign implements Trap {
  public readonly id: string;
  public readonly type = 'trollSign';
  public x: number;
  public y: number;
  public text: string;
  public width: number;
  public height: number;

  constructor(id: string, x: number, y: number, text: string) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.text = text;
    this.width = 72;
    this.height = 36;
  }

  public reset(): void {
    // Stateless
  }

  public update(_dt: number, _player: Player): void {
    // Tidak bergerak
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

    // Tiang papan kayu sketsa
    ctx.strokeStyle = '#6c584c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, this.height);
    ctx.lineTo(this.width / 2, this.height + 14);
    ctx.stroke();

    // Papan kayu doodle
    ctx.fillStyle = '#eddcd2';
    ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeRect(0, 0, this.width, this.height);

    // Teks rambu menipu
    ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Bungkus teks jika terlalu panjang
    const words = this.text.split(' ');
    if (words.length > 2) {
      const mid = Math.ceil(words.length / 2);
      ctx.fillText(words.slice(0, mid).join(' '), this.width / 2, this.height * 0.35);
      ctx.fillText(words.slice(mid).join(' '), this.width / 2, this.height * 0.7);
    } else {
      ctx.fillText(this.text, this.width / 2, this.height / 2);
    }

    ctx.restore();
  }
}
