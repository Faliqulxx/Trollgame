// Jebakan: Pilar Tumbang / Falling Pillar
// Muncul dari bawah tanah setelah pemain melewatinya, lalu roboh tumbang ke depan menimpa pemain!

import { CONFIG } from '../../config';
import { Rect } from '../../physics/Collision';
import { Player } from '../Player';
import { Trap } from './Trap';
import { Camera } from '../../core/Camera';
import { AudioManager } from '../../core/Audio';

export class FallingPillar implements Trap {
  public readonly id: string;
  public readonly type = 'fallingPillar';

  public baseX: number;
  public floorY: number;
  public pillarWidth: number;
  public pillarHeight: number;

  public state: 'HIDDEN' | 'EMERGING' | 'TOPPLING' | 'FALLEN' = 'HIDDEN';

  // Posisi Y saat muncul dari tanah
  private currentY: number;
  // Sudut tumbang (0 = tegak lurus, Math.PI / 2 = rata dengan lantai ke depan)
  public angle = 0;
  private angularVel = 0;

  private camera?: Camera;
  private audio?: AudioManager;

  constructor(
    id: string,
    baseX: number,
    floorY: number,
    pillarWidth: number = 48,
    pillarHeight: number = 240,
    camera?: Camera,
    audio?: AudioManager
  ) {
    this.id = id;
    this.baseX = baseX;
    this.floorY = floorY;
    this.pillarWidth = pillarWidth;
    this.pillarHeight = pillarHeight;
    this.currentY = floorY + 10;
    this.camera = camera;
    this.audio = audio;
  }

  public reset(): void {
    this.state = 'HIDDEN';
    this.currentY = this.floorY + 10;
    this.angle = 0;
    this.angularVel = 0;
  }

  public update(dt: number, player: Player): void {
    if (this.state === 'HIDDEN') {
      // Pemicu: Muncul setelah dilewati!
      // Saat pemain sudah melangkah melewati posisi pilar (di depan x pilar)
      if (player.x > this.baseX + 10 && player.x < this.baseX + 260 && player.y >= this.floorY - 100) {
        this.state = 'EMERGING';
        this.audio?.playCrumble();
        this.camera?.shake(0.2, 5);
      }
    } else if (this.state === 'EMERGING') {
      // Naik cepat dari bawah tanah ke atas
      this.currentY -= 680 * dt;
      const targetY = this.floorY - this.pillarHeight;

      if (this.currentY <= targetY) {
        this.currentY = targetY;
        this.state = 'TOPPLING';
        this.angularVel = 0.8;
        this.angle = 0.02;
        this.audio?.playStinger();
      }
    } else if (this.state === 'TOPPLING') {
      // Tumbang / roboh ke depan (ke arah kanan)
      this.angularVel += 4.5 * dt;
      this.angle += this.angularVel * dt;

      if (this.angle >= Math.PI / 2) {
        this.angle = Math.PI / 2;
        this.state = 'FALLEN';
        this.camera?.shake(0.35, 8);
        this.audio?.playCrumble();
        this.audio?.playLand();
      }
    }
  }

  public isDeadly(): boolean {
    return this.state === 'EMERGING' || this.state === 'TOPPLING';
  }

  public getHitboxes(): Rect[] {
    if (this.state === 'EMERGING') {
      // Saat sedang muncul naik dari tanah
      const h = this.floorY - this.currentY;
      if (h <= 0) return [];
      return [{
        x: this.baseX + 2,
        y: this.currentY + 2,
        w: this.pillarWidth - 4,
        h: h - 4
      }];
    }

    if (this.state === 'TOPPLING') {
      // Saat sedang tumbang berputar ke depan
      const pivotX = this.baseX + this.pillarWidth;
      const pivotY = this.floorY;
      const hitboxes: Rect[] = [];

      // Buat segmen kotak di sepanjang pilar yang sedang roboh
      const segments = 6;
      for (let i = 1; i <= segments; i++) {
        const dist = (this.pillarHeight / segments) * i;
        const segX = pivotX + Math.sin(this.angle) * dist;
        const segY = pivotY - Math.cos(this.angle) * dist;

        const segSize = this.pillarWidth * 0.9;
        hitboxes.push({
          x: segX - segSize / 2,
          y: segY - segSize / 2,
          w: segSize,
          h: segSize
        });
      }

      return hitboxes;
    }

    return [];
  }

  public getSolidBox(): Rect | null {
    if (this.state === 'FALLEN') {
      // Setelah jatuh rata di lantai, menjadi pijakan solid
      const pivotX = this.baseX + this.pillarWidth;
      return {
        x: pivotX,
        y: this.floorY - this.pillarWidth / 2,
        w: this.pillarHeight,
        h: this.pillarWidth / 2
      };
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.state === 'HIDDEN') return;

    ctx.save();

    if (this.state === 'EMERGING') {
      // Gambar pilar naik dari tanah (terpotong di level lantai)
      const h = this.floorY - this.currentY;
      if (h > 0) {
        ctx.fillStyle = '#2b2b36';
        ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
        ctx.lineWidth = 2.5;

        ctx.fillRect(this.baseX, this.currentY, this.pillarWidth, h);
        ctx.strokeRect(this.baseX, this.currentY, this.pillarWidth, h);

        // Retakan batu doodle
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.baseX + 10, this.currentY + 30);
        ctx.lineTo(this.baseX + 25, this.currentY + 50);
        ctx.lineTo(this.baseX + 15, this.currentY + 80);
        ctx.stroke();

        // Efek partikel tanah retak di dasar
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(this.baseX - 6, this.floorY - 4, this.pillarWidth + 12, 4);
      }
    } else {
      // TOPPLING atau FALLEN: Gambar pilar berputar mengelilingi engsel bawah kanan
      const pivotX = this.baseX + this.pillarWidth;
      const pivotY = this.floorY;

      // Bayangan jatuh di lantai saat pilar roboh
      if (this.state === 'TOPPLING') {
        const shadowLen = Math.sin(this.angle) * this.pillarHeight;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(pivotX, this.floorY - 3, shadowLen, 6);
      }

      ctx.translate(pivotX, pivotY);
      ctx.rotate(this.angle);

      // Gambar pilar tegak terhadap koordinat rotasi
      ctx.fillStyle = '#2b2b36';
      ctx.strokeStyle = CONFIG.COLORS.STICKMAN;
      ctx.lineWidth = 2.5;

      ctx.fillRect(-this.pillarWidth, -this.pillarHeight, this.pillarWidth, this.pillarHeight);
      ctx.strokeRect(-this.pillarWidth, -this.pillarHeight, this.pillarWidth, this.pillarHeight);

      // Garis detail doodle balok batu
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1.5;
      for (let y = -this.pillarHeight + 40; y < 0; y += 45) {
        ctx.beginPath();
        ctx.moveTo(-this.pillarWidth + 6, y);
        ctx.lineTo(-6, y);
        ctx.stroke();
      }

      // Mata troll / doodle retakan di ujung atas pilar
      ctx.fillStyle = '#e63946';
      ctx.fillRect(-this.pillarWidth + 14, -this.pillarHeight + 14, 6, 6);
      ctx.fillRect(-this.pillarWidth + 28, -this.pillarHeight + 14, 6, 6);
    }

    ctx.restore();
  }
}
