// T07: Balok Menghimpit / Thwomp (PRD Bagian 5)

import { CONFIG } from '../../config';
import { Rect, Collision } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { Camera } from '../../core/Camera';
import { AudioManager } from '../../core/Audio';

type ThwompState = 'idle' | 'falling' | 'grounded' | 'rising';

export class Thwomp implements Trap {
  public readonly id: string;
  public readonly type = 'thwomp';
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  private startY: number;
  private targetY: number;
  private state: ThwompState = 'idle';
  private groundedTimer = 0;
  private fallSpeed = 750;
  private riseSpeed = 90;
  private playerCrushed = false;
  private camera?: Camera;
  private audio?: AudioManager;

  constructor(
    id: string,
    x: number,
    startY: number,
    targetY: number,
    width = 48,
    height = 48,
    camera?: Camera,
    audio?: AudioManager
  ) {
    this.id = id;
    this.x = x;
    this.startY = startY;
    this.targetY = targetY;
    this.y = startY;
    this.width = width;
    this.height = height;
    this.camera = camera;
    this.audio = audio;
  }

  public reset(): void {
    this.y = this.startY;
    this.state = 'idle';
    this.groundedTimer = 0;
    this.playerCrushed = false;
  }

  public update(dt: number, player: Player): void {
    if (this.state === 'idle') {
      // Pemicu: aktif ketika pemain berjalan kurang dari 1 langkah / 1 blok (32px) dari tempat jatuhnya jebakan
      const oneBlock = CONFIG.TILE_SIZE;
      const inXRange = (player.x + player.width > this.x - oneBlock) && (player.x < this.x + this.width + oneBlock);
      const isUnder = player.y > this.y && player.y < this.targetY + 120;

      if (inXRange && isUnder) {
        // Langsung jatuh sangat cepat tanpa jeda
        this.state = 'falling';
        this.audio?.playCrumble();
      }
    } else if (this.state === 'falling') {
      this.y += this.fallSpeed * dt;

      // Cek apakah Thwomp menimpa pemain saat meluncur turun
      const currentBox: Rect = {
        x: this.x + 2,
        y: this.y + 2,
        w: this.width - 4,
        h: this.height + 6
      };
      if (Collision.aabb(player.getHitbox(), currentBox)) {
        this.playerCrushed = true;
      }

      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.state = 'grounded';
        this.groundedTimer = 0.5; // diam 0.5s di bawah
        this.camera?.shake(0.2, 5);
        this.audio?.playLand();

        const landBox: Rect = {
          x: this.x + 2,
          y: this.y + 2,
          w: this.width - 4,
          h: this.height + 6
        };
        if (Collision.aabb(player.getHitbox(), landBox)) {
          this.playerCrushed = true;
        }
      }
    } else if (this.state === 'grounded') {
      this.groundedTimer -= dt;
      if (this.groundedTimer <= 0) {
        this.state = 'rising';
      }
    } else if (this.state === 'rising') {
      this.y -= this.riseSpeed * dt;
      if (this.y <= this.startY) {
        this.y = this.startY;
        this.state = 'idle';
        this.playerCrushed = false;
      }
    }
  }

  public isDeadly(): boolean {
    return this.state === 'falling' || this.state === 'grounded' || this.playerCrushed;
  }

  public getHitboxes(): Rect[] {
    if (!this.isDeadly()) return [];
    return [{
      x: this.x + 2,
      y: this.y + 2,
      w: this.width - 4,
      h: this.height + 6
    }];
  }

  public getSolidBox(): Rect | null {
    // Saat jatuh atau pemain tertimpa, tidak solid agar tabrakan langsung mematikan pemain dan tidak mendorongnya
    if (this.state === 'falling' || this.playerCrushed) return null;
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.state === 'idle') {
      // Samarkan 100% agar persis sama dengan balok atap solid biasa (pemain tidak curiga)
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
    } else {
      // Saat aktif/jatuh/mendarat: munculkan wujud Thwomp asli
      ctx.fillStyle = CONFIG.COLORS.SOLID_BLOCK_FILL;
      ctx.strokeStyle = CONFIG.COLORS.SOLID_BLOCK;
      ctx.lineWidth = 2.5;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.strokeRect(0, 0, this.width, this.height);

      // Duri di bawah balok
      ctx.fillStyle = CONFIG.COLORS.HAZARD_RED;
      const spikeCount = 3;
      const spW = this.width / spikeCount;
      for (let i = 0; i < spikeCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * spW, this.height);
        ctx.lineTo(i * spW + spW / 2, this.height + 7);
        ctx.lineTo((i + 1) * spW, this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Wajah troll marah / menyeringai di balok
      ctx.fillStyle = '#fff';
      const eyeY = this.height * 0.35;
      ctx.fillRect(this.width * 0.22, eyeY, 8, 8);
      ctx.fillRect(this.width * 0.62, eyeY, 8, 8);
      ctx.strokeRect(this.width * 0.22, eyeY, 8, 8);
      ctx.strokeRect(this.width * 0.62, eyeY, 8, 8);

      // Pupil marah
      ctx.fillStyle = '#e63946';
      const pupilOffsetY = this.state === 'falling' ? 3 : 0;
      ctx.fillRect(this.width * 0.22 + 2, eyeY + 2 + pupilOffsetY, 4, 4);
      ctx.fillRect(this.width * 0.62 + 2, eyeY + 2 + pupilOffsetY, 4, 4);

      // Mulut gigi tajam
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.width * 0.25, this.height * 0.75);
      ctx.lineTo(this.width * 0.75, this.height * 0.75);
      ctx.stroke();
    }

    ctx.restore();
  }
}
